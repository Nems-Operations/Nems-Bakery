import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Initialize client Firebase SDK to connect to Firestore on the backend
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "react-example-dfa43",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKEL || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// PayFast IP validation utility functions
function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function ipInCidr(ip: string, cidr: string): boolean {
  if (!ip || !cidr) return false;
  // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:192.168.1.1)
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  const [range, bitsStr] = cidr.split("/");
  const bits = bitsStr ? parseInt(bitsStr, 10) : 32;

  const ipNum = ipToInt(ip);
  const rangeNum = ipToInt(range);

  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipNum & mask) === (rangeNum & mask);
}

function isPayFastIp(clientIp: string): boolean {
  if (!clientIp) return false;

  let ip = clientIp;
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Permissive in local, loopback, or non-production modes for easier webhook simulation/testing
  if (ip === "127.0.0.1" || ip === "::1" || process.env.NODE_ENV !== "production") {
    return true;
  }

  const payfastCidrs = [
    "197.97.145.144/28",
    "41.74.179.192/27",
    "102.216.36.0/28",
    "102.216.36.128/28",
    "144.126.193.139/32"
  ];

  return payfastCidrs.some(cidr => ipInCidr(ip, cidr));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust first proxy to resolve client IP in Cloud Run container behind GC Load Balancer
  app.set("trust proxy", true);

  // Middleware to support JSON payloads and URL encoded payloads (needed for PayFast ITN form posts)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Create checkout session, persist order with "PENDING_PAYMENT" details, and compile PayFast gateway payload
  app.post("/api/checkout", async (req, res) => {
    try {
      const {
        customerName,
        customerPhone,
        email,
        companyName,
        deliveryMethod,
        address,
        cartItems,
        orderCalculations,
        paymentMethod
      } = req.body;

      if (!customerName || !customerPhone || !cartItems || !orderCalculations) {
        return res.status(400).json({ error: "Missing required fields in checkout payload" });
      }

      // Generate secure unique tracking code
      const trackingNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const totalQuantity = cartItems.reduce((acc: number, curr: any) => acc + curr.quantity, 0);

      const productsDescription = cartItems.map(
        (item: any) => `${item.menuItem.name}${item.selectedFlavor ? ` (${item.selectedFlavor})` : ""}${item.selectedSize ? ` (${item.selectedSize} Bucket)` : ""} x${item.quantity}`
      ).join(", ");

      const finalPaymentMode = paymentMethod === "cod" ? "split_cod_eft" : "card_payfast";

      // 1. Initial Checkout Endpoint: Save the order to the database with a status of "PENDING_PAYMENT"
      // DO NOT send any emails here.
      const orderData = {
        customerName: customerName.trim(),
        phoneNumber: customerPhone.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        product: productsDescription.substring(0, 2000),
        quantity: totalQuantity,
        totalPrice: orderCalculations.total,
        vatAmount: 0,
        status: "Pending",
        orderDate: serverTimestamp(),
        deliveryMethod,
        deliveryAddress: deliveryMethod === "delivery" ? address.trim() : "Shop Pickup",
        paymentMethod: finalPaymentMode,
        paymentStatus: "PENDING_PAYMENT", // Enforcing PENDING_PAYMENT on initial creation
        orderNumber: trackingNumber,
        trackingNumber: trackingNumber,
        paymentDetails: null,
        cartItems, // Stored to reconstruct items safely inside Webhook mail automation
        orderCalculations, // Stored to reconstruct costs inside Webhook mail automation
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = docRef.id;

      // 2. Prep PayFast redirect URL and POST parameters
      const payfastMerchantId = process.env.VITE_PAYFAST_MERCHANT_ID || "10000100";
      const payfastMerchantKey = process.env.VITE_PAYFAST_MERCHANT_KEY || "46ca4f5e0141e";
      
      const origin = req.headers.origin || "https://nemsbakery.co.za";
      const returnUrl = `${origin}?payment=success&orderId=${orderId}&trackingCode=${trackingNumber}`;
      const cancelUrl = `${origin}`;
      
      // Payfast Instant Transaction Notification (ITN) webhook endpoint
      const notifyUrl = `${process.env.APP_URL || origin}/api/payfast-itn`;

      const payfastFields = {
        merchant_id: payfastMerchantId,
        merchant_key: payfastMerchantKey,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        m_payment_id: orderId,
        amount: orderCalculations.total.toFixed(2),
        item_name: `Bakery Order #${trackingNumber} (${totalQuantity} items)`,
        name_first: customerName.trim(),
        cell_number: customerPhone.trim()
      };

      const params = new URLSearchParams();
      Object.entries(payfastFields).forEach(([k, v]) => {
        params.append(k, v);
      });

      const payfastUrl = `https://www.payfast.co.za/eng/process?${params.toString()}`;

      // Return order parameters and pre-compiled redirect URL to the frontend
      res.json({
        success: true,
        orderId,
        trackingNumber,
        payfastUrl,
        payfastFields
      });

    } catch (err: any) {
      console.error("API Checkout route error:", err);
      res.status(500).json({ error: err.message || "Failed to initialize secure checkout session" });
    }
  });

  // Dedicated Webhook Endpoint: Receive Instant Transaction Notification (ITN) from PayFast
  app.post("/api/payfast-itn", async (req, res) => {
    try {
      // 1. Determine client IP taking proxies into account (essential for Cloud Run with LB SSL termination)
      let clientIp = req.ip || "";
      const forwardedFor = req.headers["x-forwarded-for"];
      if (forwardedFor) {
        const parts = (typeof forwardedFor === "string" ? forwardedFor : forwardedFor[0]).split(",");
        clientIp = parts[0].trim();
      }

      console.log(`PayFast ITN request received from IP: ${clientIp}`);

      // 2. Validate client IP to ensure it matches PayFast's official blocks
      if (!isPayFastIp(clientIp)) {
        console.warn(`PayFast ITN request rejected: unauthorized IP address ${clientIp}`);
        return res.status(403).send("Forbidden: Request IP address is not authorized by PayFast secure ranges.");
      }

      console.log("PayFast ITN callback payload received:", req.body);
      const { m_payment_id, payment_status, pf_payment_id, amount_gross } = req.body;

      if (!m_payment_id) {
        console.warn("PayFast ITN missing m_payment_id");
        return res.status(400).send("Missing m_payment_id");
      }

      // Fetch the order document from Firestore
      const orderDocRef = doc(db, "orders", m_payment_id);
      const orderDoc = await getDoc(orderDocRef);

      if (!orderDoc.exists()) {
        console.warn(`PayFast ITN order #${m_payment_id} not found in database`);
        return res.status(404).send("Order not found");
      }

      const orderData = orderDoc.data();
      if (!orderData) {
        return res.status(404).send("Order details empty");
      }

      // Process only completed success signals
      if (payment_status === "COMPLETE") {
        console.log(`Payment confirmed on Payfast for order id: ${m_payment_id}`);

        // Update database order payment status to PAID
        await updateDoc(orderDocRef, {
          paymentStatus: "PAID",
          status: "Confirmed",
          payfastPaymentId: pf_payment_id || null,
          amountPaid: amount_gross ? parseFloat(amount_gross) : null,
          updatedAt: new Date().toISOString()
        });

        // Trigger Email confirmation send now that payment status is successfully verified as PAID
        const {
          orderNumber,
          trackingNumber,
          customerName,
          phoneNumber,
          companyName,
          deliveryMethod,
          deliveryAddress,
          email,
          cartItems,
          orderCalculations
        } = orderData;

        const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
        if (!GMAIL_PASS) {
          console.warn("GMAIL_APP_PASSWORD not configured. Skipping order email automation.");
        } else {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "orders.nemsbakery@gmail.com",
              pass: GMAIL_PASS
            }
          });

          // Build HTML list of purchased items
          const itemsHtml = (cartItems || []).map((item: any) => {
            const flavorStr = item.selectedFlavor ? `<br/><span style="font-size: 11px; color: #78716c;">Flavor: ${item.selectedFlavor}</span>` : "";
            const sizeStr = item.selectedSize ? `<br/><span style="font-size: 11px; color: #78716c;">Size: ${item.selectedSize} Bucket</span>` : "";
            const price = parseFloat(item.unitPrice || 0);
            const quantity = parseInt(item.quantity || 1);
            return `
              <tr style="border-bottom: 1px solid #f5f5f4;">
                <td style="padding: 10px; font-size: 13px; color: #1c1917;">
                  <strong style="color: #171717;">${item.menuItem?.name || "Premium Bakery Item"}</strong>
                  ${flavorStr}
                  ${sizeStr}
                </td>
                <td style="padding: 10px; font-size: 13px; text-align: center; color: #57534e;">${quantity}</td>
                <td style="padding: 10px; font-size: 13px; text-align: right; color: #1c1917; font-family: monospace;">R ${(price * quantity).toFixed(2)}</td>
              </tr>
            `;
          }).join("");

          const recipientEmail = email ? email.trim() : "";
          let toAddress = "orders.nemsbakery@gmail.com";
          let ccAddress = "";

          if (recipientEmail) {
            toAddress = recipientEmail;
            ccAddress = "orders.nemsbakery@gmail.com";
          }

          const calcs = orderCalculations || {};

          const htmlBody = `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #D4AF37; background-color: #faf8f5; color: #1c1917;">
              <h2 style="color: #c5a028; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 0;">Order Confirmed!</h2>
              <p style="font-size: 14px; line-height: 1.6; text-align: center;">Thank you for your order at Nems Bakery! Here are your confirmation and tracking details:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border: 1px solid #e7e5e4;">
                <tr style="background-color: #1c1917; color: #ffffff;">
                  <th colspan="2" style="padding: 12px; text-align: left; font-size: 14px; font-weight: bold; border-bottom: 2px solid #D4AF37;">
                    Order Information
                  </th>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px; width: 40%;">Tracking Number:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-family: monospace; font-size: 14px; font-weight: bold; color: #b45309;">${trackingNumber || orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Customer Name:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Cellphone Number:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${phoneNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Midrand Workplace:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${companyName || "N/A (None selected / General Delivery)"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Delivery Method:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px; text-transform: capitalize;">${deliveryMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Address / Location:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${deliveryAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Payment Status:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px; color: #15803d; font-weight: bold;">PAID (via PayFast)</td>
                </tr>
              </table>

              <h3 style="color: #c5a028; margin-top: 30px; margin-bottom: 10px;">Itemized Products Breakdown</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e7e5e4;">
                <thead>
                  <tr style="background-color: #f5f5f4; border-bottom: 2px solid #e7e5e4;">
                    <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c;">Item Description</th>
                    <th style="padding: 10px; text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; width: 15%;">Qty</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; width: 25%;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="border-top: 1px solid #e7e5e4;">
                    <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Subtotal:</td>
                    <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(calcs.subtotal || 0).toFixed(2)}</td>
                  </tr>
                  ${Number(calcs.discount || 0) > 0 ? `
                  <tr>
                    <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Discount Applied:</td>
                    <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500; color: #15803d;">-R ${Number(calcs.discount || 0).toFixed(2)}</td>
                  </tr>
                  ` : ""}
                  ${Number(calcs.deliveryFee || 0) > 0 ? `
                  <tr>
                    <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Delivery Fee:</td>
                    <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(calcs.deliveryFee || 0).toFixed(2)}</td>
                  </tr>
                  ` : ""}
                  ${Number(calcs.processingFee || 0) > 0 ? `
                  <tr>
                    <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Card Processing Fee:</td>
                    <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(calcs.processingFee || 0).toFixed(2)}</td>
                  </tr>
                  ` : ""}
                  <tr style="background-color: #fafaf9; border-top: 2px solid #D4AF37;">
                    <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #1c1917;">Final Total:</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 15px; color: #c5a028; font-family: monospace;">R ${Number(calcs.total || 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="margin-top: 30px; text-align: center; border-top: 1px dashed #d4af37; padding-top: 15px; font-size: 11px; color: #78716c;">
                <p>© 2026 Nems Bakery &amp; Catering. Midrand, Gauteng, South Africa.</p>
                <p>This is an automated order confirmation receipt.</p>
              </div>
            </div>
          `;

          const mailOptions: any = {
            from: '"Nems Bakery Orders" <orders.nemsbakery@gmail.com>',
            to: toAddress,
            subject: `Order Confirmed! Your Nems Bakery Tracking Number: #${trackingNumber || orderNumber}`,
            html: htmlBody
          };

          if (ccAddress) {
            mailOptions.cc = ccAddress;
          }

          await transporter.sendMail(mailOptions);
          console.log(`Order confirmation email sent successfully via webhook for order #${m_payment_id}`);
        }
      } else {
        console.log(`Received ITN for order #${m_payment_id} but status is "${payment_status}". No confirmation email triggered.`);
      }

      res.sendStatus(200);
    } catch (error: any) {
      console.error("PayFast ITN processor error:", error);
      res.status(500).send("Webhook process failure");
    }
  });

  // API Route fallback in case it is called directly by any legacy scripts
  app.post("/api/send-order-email", async (req, res) => {
    res.json({ success: true, message: "Legacy endpoint called, skipped direct send to wait for PayFast webhook." });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
