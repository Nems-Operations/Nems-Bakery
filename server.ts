import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: send order email
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { 
        orderNumber, 
        customerName, 
        customerPhone, 
        companyName, 
        deliveryMethod, 
        deliveryAddress, 
        email, 
        cartItems, 
        orderCalculations 
      } = req.body;

      if (!orderNumber || !customerName || !customerPhone || !cartItems || !orderCalculations) {
        return res.status(400).json({ error: "Missing required fields in payload" });
      }

      const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
      if (!GMAIL_PASS) {
        console.warn("GMAIL_APP_PASSWORD environment variable is not defined");
        return res.status(500).json({ error: "GMAIL_APP_PASSWORD is not configured on the server." });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "orders.nemsbakery@gmail.com",
          pass: GMAIL_PASS,
        },
      });

      // Build items html list
      const itemsHtml = cartItems.map((item: any) => {
        const flavorStr = item.selectedFlavor ? `<br/><span style="font-size: 11px; color: #78716c;">Flavor: ${item.selectedFlavor}</span>` : "";
        const sizeStr = item.selectedSize ? `<br/><span style="font-size: 11px; color: #78716c;">Size: ${item.selectedSize} Bucket</span>` : "";
        return `
          <tr style="border-bottom: 1px solid #f5f5f4;">
            <td style="padding: 10px; font-size: 13px; color: #1c1917;">
              <strong style="color: #171717;">${item.menuItem.name}</strong>
              ${flavorStr}
              ${sizeStr}
            </td>
            <td style="padding: 10px; font-size: 13px; text-align: center; color: #57534e;">${item.quantity}</td>
            <td style="padding: 10px; font-size: 13px; text-align: right; color: #1c1917; font-family: monospace;">R ${(item.unitPrice * item.quantity).toFixed(2)}</td>
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
              <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-family: monospace; font-size: 14px; font-weight: bold; color: #b45309;">${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Customer Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-weight: bold; font-size: 13px;">Cellphone Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e7e5e4; font-size: 13px;">${customerPhone}</td>
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
                <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(orderCalculations.subtotal || 0).toFixed(2)}</td>
              </tr>
              ${Number(orderCalculations.discount || 0) > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Discount Applied:</td>
                <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500; color: #15803d;">-R ${Number(orderCalculations.discount || 0).toFixed(2)}</td>
              </tr>
              ` : ""}
              ${Number(orderCalculations.deliveryFee || 0) > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Delivery Fee:</td>
                <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(orderCalculations.deliveryFee || 0).toFixed(2)}</td>
              </tr>
              ` : ""}
              ${Number(orderCalculations.processingFee || 0) > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 10px; text-align: right; font-size: 12px; color: #78716c;">Card Processing Fee:</td>
                <td style="padding: 8px 10px; text-align: right; font-size: 12px; font-weight: 500;">R ${Number(orderCalculations.processingFee || 0).toFixed(2)}</td>
              </tr>
              ` : ""}
              <tr style="background-color: #fafaf9; border-top: 2px solid #D4AF37;">
                <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 14px; color: #1c1917;">Final Total:</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 15px; color: #c5a028; font-family: monospace;">R ${Number(orderCalculations.total || 0).toFixed(2)}</td>
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
        subject: `Order Confirmed! Your Nems Bakery Tracking Number: #${orderNumber}`,
        html: htmlBody,
      };

      if (ccAddress) {
        mailOptions.cc = ccAddress;
      }

      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent successfully for order #${orderNumber}`);
      res.json({ success: true });

    } catch (error: any) {
      console.error("Error sending order email:", error);
      res.status(500).json({ error: error.message || "Failed to send order email" });
    }
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
