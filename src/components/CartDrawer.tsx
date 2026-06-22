/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent, useEffect } from "react";
import { CartItem } from "../types";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { X, Trash2, ShoppingBag, Truck, CheckCircle, Clock, Copy, MessageSquare } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  cartItems: CartItem[];
  onUpdateQty: (id: string, size: string | undefined, qty: number, flavor?: string) => void;
  onRemoveItem: (id: string, size: string | undefined, flavor?: string) => void;
  onClearCart: () => void;
  siteSettings?: any;
}

const getEmailClient = async (): Promise<any> => {
  // Create a local direct mock SMTPJS client as a bulletproof fallback
  const localClient = {
    send: async (options: any) => {
      console.log("Local smart client dispatching email...", options);
      
      // Try local server-side same-origin proxy FIRST (secured by Nodemailer on backend)
      try {
        console.log("Attempting same-origin backend secure nodemailer proxy...");
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: options.To,
            subject: options.Subject,
            body: options.Body,
            cc: options.Cc
          })
        });
        if (response.ok) {
          const resData = await response.json();
          console.log("Proxy dispatch completed successfully via backend Nodemailer:", resData);
          return "OK";
        }
        console.warn(`Local proxy returned status ${response.status}. Trying SMTPJS direct fallback...`);
      } catch (proxyErr) {
        console.warn("Local proxy fetch failed, falling back to direct SMTPJS control API:", proxyErr);
      }

      // Fallback: SMTPJS direct POST endpoint via application/x-www-form-urlencoded
      try {
        const payload = {
          ...options,
          Action: "Send",
          nocache: Math.floor(1e6 * Math.random() + 1),
        };
        
        // Properly URL encode parameters to respect application/x-www-form-urlencoded
        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => {
          formData.append(k, String(v));
        });

        const response = await fetch("https://control.smtpjs.com/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });
        if (!response.ok) {
          throw new Error(`SMTPJS direct gateway status: ${response.status}`);
        }
        return response.text();
      } catch (directErr) {
        console.error("Direct SMTPJS gateway failed:", directErr);
        throw directErr;
      }
    }
  };

  return localClient;
};

export default function CartDrawer({
  isOpen,
  onClose,
  onOpen,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  siteSettings
}: CartDrawerProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"collect" | "delivery">("collect");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [successTrackingNumber, setSuccessTrackingNumber] = useState<string | null>(null);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"standard" | "cod">("standard");
  const [expectedDate, setExpectedDate] = useState("");
  const [expectedTime, setExpectedTime] = useState("");

  // Kids Party Pack conditional states
  const [childName, setChildName] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  const hasKidsPartyPack = useMemo(() => {
    return cartItems.some(item => item.menuItem.id.startsWith("partyplan-"));
  }, [cartItems]);

  const generateTrackingNumber = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: "percentage" | "amount"; value: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ token: string; amount: number } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (isPaymentLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isPaymentLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const trackingCode = params.get("trackingCode");
      setSuccessTrackingNumber(trackingCode);
      setIsOrdered(true);
      onClearCart();
      onOpen?.();

      // Clean up search parameters in the URL bar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [onOpen, onClearCart]);

  const smallTreatItems = useMemo(() => {
    return cartItems.filter(item => item.menuItem.id.startsWith("retail-") || item.menuItem.id === "daily-muffin" || item.menuItem.id === "daily-cupcake");
  }, [cartItems]);

  const normalBakeItems = useMemo(() => {
    return cartItems.filter(item => !item.menuItem.id.startsWith("retail-") && item.menuItem.id !== "daily-muffin" && item.menuItem.id !== "daily-cupcake");
  }, [cartItems]);

  const hasSmallOrders = smallTreatItems.length > 0;
  const hasNormalOrders = normalBakeItems.length > 0;

  const deliveryFee = useMemo(() => {
    if (hasKidsPartyPack) {
      if (selectedSchool === "Other / Home Delivery") {
        return 120;
      }
      return 0; // Omit R120 fee for specific pre-configured schools
    }
    return deliveryMethod === "delivery" ? 120 : 0;
  }, [hasKidsPartyPack, selectedSchool, deliveryMethod]);

  const smallSubtotal = useMemo(() => {
    return smallTreatItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
  }, [smallTreatItems]);

  const normalSubtotal = useMemo(() => {
    return normalBakeItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
  }, [normalBakeItems]);

  const orderCalculations = useMemo(() => {
    const subtotal = Math.max(0, smallSubtotal + normalSubtotal);
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percentage") {
        discount = Math.round((subtotal * (appliedCoupon.value / 100)) * 100) / 100;
      } else if (appliedCoupon.type === "amount") {
        discount = Math.min(subtotal, appliedCoupon.value);
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    
    // Fee only applies to card option ('PAY WITH CARD / Instant EFT' or 'EFT BOTH TOGETHER')
    const processingFee = paymentMethod === "standard" ? 3 : 0;
    
    const total = Math.round((subtotalAfterDiscount + deliveryFee + processingFee) * 100) / 100;
    
    const discountRatio = subtotal > 0 ? (subtotalAfterDiscount / subtotal) : 1;
    
    const discountedSmallSubtotal = smallSubtotal * discountRatio;
    const discountedNormalSubtotal = normalSubtotal * discountRatio;
    
    const codTotal = Math.round(discountedSmallSubtotal * 100) / 100;
    const eftTotal = Math.round((discountedNormalSubtotal + deliveryFee) * 100) / 100;
    
    return { 
      subtotal, 
      discount,
      subtotalAfterDiscount,
      total,
      codTotal,
      eftTotal,
      processingFee
    };
  }, [smallSubtotal, normalSubtotal, deliveryFee, appliedCoupon, paymentMethod]);

  const handleApplyCoupon = (code: string) => {
    const uppercaseCode = code.trim().toUpperCase();
    if (!uppercaseCode) {
      setCouponError("Please type or enter a coupon promo code");
      setCouponSuccess(null);
      return;
    }

    // Try to find coupon in Firestore siteSettings coupons first
    const foundCoupon = siteSettings?.coupons?.find(
      (c: any) => c.code.trim().toUpperCase() === uppercaseCode
    );

    if (foundCoupon) {
      if (!foundCoupon.isActive) {
        setCouponError(`The coupon ${uppercaseCode} is no longer active.`);
        setCouponSuccess(null);
        return;
      }
      
      if (foundCoupon.expiresAt) {
        const expiryDate = new Date(foundCoupon.expiresAt);
        const today = new Date();
        if (expiryDate.getTime() < today.setHours(0,0,0,0)) {
          setCouponError(`The coupon ${uppercaseCode} expired on ${foundCoupon.expiresAt}.`);
          setCouponSuccess(null);
          return;
        }
      }

      setAppliedCoupon({
        code: foundCoupon.code,
        type: "percentage",
        value: Number(foundCoupon.discount)
      });
      setCouponSuccess(`${foundCoupon.code} applied! Enjoy ${foundCoupon.discount}% discount on subtotals!`);
      setCouponError(null);
      return;
    }

    if (uppercaseCode === "NEMS20") {
      setAppliedCoupon({ code: "NEMS20", type: "percentage", value: 20 });
      setCouponSuccess("NEMS20 applied! Enjoy 20% off your entire bag!");
      setCouponError(null);
    } else if (uppercaseCode === "TREAT50") {
      setAppliedCoupon({ code: "TREAT50", type: "amount", value: 50 });
      setCouponSuccess("TREAT50 applied! R50.00 cash voucher holds!");
      setCouponError(null);
    } else if (uppercaseCode === "LOBOLA15") {
      setAppliedCoupon({ code: "LOBOLA15", type: "percentage", value: 15 });
      setCouponSuccess("LOBOLA15 applied! Scone celebrations active with 15% off!");
      setCouponError(null);
    } else if (uppercaseCode === "BREAD100") {
      const subtotalVal = smallSubtotal + normalSubtotal;
      if (subtotalVal < 500) {
        setCouponError("BREAD100 requires a minimum order subtotal of R 500.00");
        setCouponSuccess(null);
      } else {
        setAppliedCoupon({ code: "BREAD100", type: "amount", value: 100 });
        setCouponSuccess("BREAD100 applied! R100.00 cash voucher subtracted!");
        setCouponError(null);
      }
    } else {
      setCouponError("Unknown coupon code. Please verify.");
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponInput("");
  };

  const submitOrder = async (trackingNumber: string): Promise<string> => {
    return "";
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const currentErrors: Record<string, string> = {};

    if (!customerName.trim()) currentErrors.customerName = "Name is required for tracking";
    if (!customerPhone.trim() || customerPhone.length < 9) {
      currentErrors.customerPhone = "Please supply a valid contact number";
    }

    if (hasKidsPartyPack) {
      if (!childName.trim()) currentErrors.childName = "Child's Full Name is required";
      if (!selectedSchool) currentErrors.selectedSchool = "School selection is required";
      if (!classGrade.trim()) currentErrors.classGrade = "Class/Grade is required";
      if (!deliveryDate) currentErrors.deliveryDate = "Delivery Date is required";
      if (selectedSchool === "Other / Home Delivery") {
        if (!homeAddress.trim()) currentErrors.homeAddress = "Home Address is required for home delivery";
        if (!deliveryTimeSlot) currentErrors.deliveryTimeSlot = "Delivery Time Slot is required";
      }
    } else {
      if (deliveryMethod === "delivery" && !address.trim()) {
        currentErrors.address = "A delivery destination address is mandatory";
      }
    }

    if (paymentMethod === "cod" && !hasKidsPartyPack) {
      if (hasNormalOrders) {
        if (!expectedDate) {
          currentErrors.expectedDate = "Expected delivery/collection date is required";
        }
      } else {
        if (!expectedTime) {
          currentErrors.expectedTime = "Expected delivery/collection time is required";
        }
      }
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors({});

    // If payment mode is cash on delivery, redirect to WhatsApp
    if (paymentMethod === "cod") {
      onClose();

      const itemsList = cartItems.map(item => {
        const flavorStr = item.selectedFlavor ? ` (${item.selectedFlavor})` : '';
        const sizeStr = item.selectedSize ? ` (${item.selectedSize} Bucket)` : '';
        return `${item.menuItem.name}${flavorStr}${sizeStr} x ${item.quantity} (R ${item.unitPrice.toFixed(2)} each)`;
      }).join("\n");

      const deliverySelection = hasKidsPartyPack 
        ? (selectedSchool === "Other / Home Delivery" ? "Home Delivery" : `School Run: ${selectedSchool}`) 
        : (deliveryMethod === "collect" ? "Free Pickup" : "Courier");

      let waMessage = "";
      if (hasKidsPartyPack) {
        waMessage = `Hello Nems Bakery! I would like to place a Kids Party Pack order.

Order Items:
${itemsList}

Total Balance: R${orderCalculations.total.toFixed(2)}
Delivery Selection: ${deliverySelection}
Child's Name: ${childName.trim()}
School Selector: ${selectedSchool}
Class/Grade Name: ${classGrade.trim()}
Delivery Date: ${deliveryDate}
${selectedSchool === "Other / Home Delivery" ? `Home Address: ${homeAddress.trim()}\nDelivery Time Slot: ${deliveryTimeSlot}\n` : ""}
Customer Name: ${customerName.trim()}
Phone Number: ${customerPhone.trim()}

I understand that a 50% deposit is required before my order is processed and baked.`;
      } else if (hasNormalOrders) {
        waMessage = `Hello Nems Bakery! I would like to place a Cash on Delivery order.

Order Items:
${itemsList}

Total Balance: R${orderCalculations.total.toFixed(2)}
Delivery/Pickup Selection: ${deliverySelection}
Customer Name: ${customerName.trim()}
Phone Number: ${customerPhone.trim()}

Expected Delivery/Collection Date: ${expectedDate}

I understand that a 50% deposit is required before my order is processed and baked.`;
      } else {
        waMessage = `Hello Nems Bakery! I would like to place a Cash on Delivery order.

Order Items:
${itemsList}

Total Balance: R${orderCalculations.total.toFixed(2)}
Delivery/Pickup Selection: ${deliverySelection}
Customer Name: ${customerName.trim()}
Phone Number: ${customerPhone.trim()}

Expected Delivery/Collection Time: ${expectedTime}

(Please ensure you have physical cash ready upon delivery/collection.)`;
      }

      const whatsappUrl = `https://wa.me/27637862408?text=${encodeURIComponent(waMessage)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      setIsPaymentLoading(true);
      setSubmittingInvoice(true);
      setPaymentError(null);

      let redirectTimeout: any = null;

      try {
        // --- CLIENT-SIDE DIRECT SECURE CART PERSISTENCE & PAYFAST REDIRECT ---
        // Generates unique tracking number
        const trackingNumber = generateTrackingNumber();
        const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

        const productsDescription = cartItems.map(
          item => `${item.menuItem.name}${item.selectedFlavor ? ` (${item.selectedFlavor})` : ""}${item.selectedSize ? ` (${item.selectedSize} Bucket)` : ""} x${item.quantity}`
        ).join(", ");

        // Local order ID since database collections/writes are removed
        const orderId = `NEMS-${trackingNumber}`;

        const origin = window.location.origin;
        const returnUrl = `${origin}?payment=success&orderId=${orderId}&trackingCode=${trackingNumber}`;
        const cancelUrl = origin;

        // Custom Static PayFast live production merchant credentials
        const payfastMerchantId = "24926541";
        const payfastMerchantKey = "rf1x71oxrxchi";

        // Populate PayFast fields directly with sanitized inputs to prevent 400 Bad Request
        const safeName = customerName.trim().replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 100) || "Customer";
        const safeCell = customerPhone.trim().replace(/[^0-9+]/g, ""); // Keep only digits and '+' if applicable
        const cleanItemName = `Bakery Order ${trackingNumber}`.replace(/[^a-zA-Z0-9\s-]/g, "");

        // Build item description with all details packed in clearly per guidelines
        let cleanDescription = "";
        let customDelivery = "";

        if (hasKidsPartyPack) {
          customDelivery = selectedSchool === "Other / Home Delivery" ? `Home: ${homeAddress.trim()}` : `School: ${selectedSchool}`;
          cleanDescription = [
            `Cust: ${safeName}`,
            `Mobile: ${safeCell}`,
            email.trim() ? `Email: ${email.trim()}` : "",
            `Child: ${childName.trim()}`,
            `School/Run: ${selectedSchool}`,
            `Class/Grade: ${classGrade.trim()}`,
            `Date: ${deliveryDate}`,
            selectedSchool === "Other / Home Delivery" ? `Address: ${homeAddress.trim()}` : "",
            selectedSchool === "Other / Home Delivery" ? `TimeSlot: ${deliveryTimeSlot}` : "",
            `Items: ${productsDescription}`
          ].filter(Boolean).join(" | ").substring(0, 255);
        } else {
          customDelivery = deliveryMethod === "delivery" ? `to ${address.trim()}` : "Shop Pickup";
          cleanDescription = [
            `Cust: ${safeName}`,
            `Mobile: ${safeCell}`,
            email.trim() ? `Email: ${email.trim()}` : "",
            `Workplace: ${companyName.trim()}`,
            `Delivery: ${customDelivery}`,
            `Items: ${productsDescription}`
          ].filter(Boolean).join(" | ").substring(0, 255);
        }

        const payfastFields: Record<string, string> = {
          merchant_id: payfastMerchantId,
          merchant_key: payfastMerchantKey,
          return_url: returnUrl,
          cancel_url: cancelUrl,
          m_payment_id: orderId,
          amount: Number(orderCalculations.total).toFixed(2),
          item_name: cleanItemName,
          item_description: cleanDescription,
          name_first: safeName,
          custom_str1: (hasKidsPartyPack ? selectedSchool : companyName.trim()).substring(0, 255),
          custom_str2: (hasKidsPartyPack ? customDelivery : (deliveryMethod === "delivery" ? `Delivery: ${address.trim()}` : "Pickup")).substring(0, 255),
          custom_str3: productsDescription.substring(0, 255),
          custom_str4: `Phone: ${safeCell}${hasKidsPartyPack ? ` | Child: ${childName.trim()} | Class: ${classGrade.trim()} | Date: ${deliveryDate}` : ""}`.substring(0, 255)
        };

        // Add email_address if valid and present
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail && cleanEmail.includes("@")) {
          payfastFields["email_address"] = cleanEmail;
        }
        if (safeCell) {
          payfastFields["cell_number"] = safeCell;
        }

        // Step A: Silently write the order copy to Firebase Firestore using a try/catch block
        try {
          console.log("Saving order payload to Firestore collection 'orders' silently...");
          await addDoc(collection(db, "orders"), {
            trackingNumber: trackingNumber,
            customerName: safeName,
            phoneNumber: safeCell,
            email: cleanEmail || null,
            companyName: hasKidsPartyPack ? "" : companyName.trim(),
            midrandWorkplace: hasKidsPartyPack ? "" : companyName.trim() || "None Selected",
            deliveryAddress: hasKidsPartyPack 
              ? (selectedSchool === "Other / Home Delivery" ? homeAddress.trim() : `School Run: ${selectedSchool}`) 
              : (deliveryMethod === "delivery" ? address.trim() : "Shop Pickup"),
            cartItems: cartItems.map(item => ({
              productName: item.menuItem.name,
              quantity: item.quantity,
              price: item.unitPrice,
              selectedFlavor: item.selectedFlavor || null,
              selectedSize: item.selectedSize || null,
              specialInstructions: item.specialInstructions || null
            })),
            totalPrice: orderCalculations.total,
            orderDate: new Date(), // A timestamp field: new Date()
            product: productsDescription.substring(0, 2000),
            quantity: totalQuantity,
            status: "Pending",
            deliveryMethod: hasKidsPartyPack 
              ? (selectedSchool === "Other / Home Delivery" ? "home-delivery" : "school-pickup")
              : deliveryMethod,
            paymentStatus: "PENDING_PAYMENT",
            createdAt: new Date().toISOString(),
            isKidsPartyOrder: hasKidsPartyPack,
            childName: hasKidsPartyPack ? childName.trim() : null,
            schoolName: hasKidsPartyPack ? selectedSchool : null,
            classGrade: hasKidsPartyPack ? classGrade.trim() : null,
            deliveryDate: hasKidsPartyPack ? deliveryDate : null,
            homeAddress: hasKidsPartyPack && selectedSchool === "Other / Home Delivery" ? homeAddress.trim() : null,
            deliveryTimeSlot: hasKidsPartyPack && selectedSchool === "Other / Home Delivery" ? deliveryTimeSlot : null
          });
          console.log("Order saved to Firestore successfully.");
        } catch (firebaseErr) {
          console.error("Firebase Firestore write failed silently as per requirements:", firebaseErr);
        }

        // 1. Prepare HTML/text message for email dispatch
        const itemsHTML = cartItems.map(item => `
          <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f0eeeb; font-size: 13px; color: #444; text-align: left;">
              <strong style="color: #2c2520; font-size: 14px;">${item.menuItem.name}</strong>
              ${item.selectedFlavor ? `<br/><span style="font-size: 11px; color: #7c6e64; font-style: italic;">Flavor: ${item.selectedFlavor}</span>` : ""}
              ${item.selectedSize ? `<br/><span style="font-size: 11px; color: #7c6e64; font-style: italic;">Size: ${item.selectedSize}</span>` : ""}
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f0eeeb; text-align: center; font-size: 13px; color: #4a3e3d; font-family: monospace;">${item.quantity}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f0eeeb; text-align: right; font-size: 13px; color: #4a3e3d; font-family: monospace;">R ${Number(item.unitPrice).toFixed(2)}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #f0eeeb; text-align: right; font-size: 13px; color: #2c2520; font-family: monospace; font-weight: bold;">R ${Number(item.unitPrice * item.quantity).toFixed(2)}</td>
          </tr>
        `).join("");

        const emailContentHTML = `
          <div style="background-color: #f7f5f0; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); background-color: #ffffff; border: 1px solid #eadecf;">
              
              <!-- Nems Brand Header -->
              <div style="text-align: center; padding: 35px 20px 25px 20px; background-color: #faf8f5; border-bottom: 1px solid #eadecf; position: relative;">
                <div style="width: 50px; height: 3px; background-color: #ECA1A6; display: inline-block; margin-right: 5px; border-radius: 2px;"></div>
                <div style="width: 50px; height: 3px; background-color: #A6E3E9; display: inline-block; margin-left: 5px; border-radius: 2px;"></div>
                <h1 style="color: #2c2520; margin: 10px 0 0 0; font-size: 26px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">Nems Bakery</h1>
                <p style="color: #C5A028; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Premium High-Tea & Catering Receipt</p>
              </div>

              <div style="padding: 25px 25px;">
                
                <!-- Order ID and Tracking Banner -->
                <div style="background-color: #fffaf0; border-left: 4px solid #C5A028; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 2px 0; font-size: 14px; color: #5a4f43;"><strong>Order ID:</strong></td>
                      <td style="padding: 2px 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #C5A028; text-align: right;">${orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 2px 0; font-size: 14px; color: #5a4f43;"><strong>Tracking Number:</strong></td>
                      <td style="padding: 2px 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #C5A028; text-align: right;">${trackingNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0 2px 0; font-size: 13px; color: #887a6b;" colspan="2">
                        <strong>Status:</strong> Pending Payment (Redirected to Secure PayFast Checkout)
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Customer Details -->
                <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #2c2520; margin: 0 0 12px 0; border-bottom: 1px dashed #eadecf; padding-bottom: 6px;">Customer Details</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64; width: 140px;">Customer Name:</td>
                    <td style="padding: 4px 0; font-weight: bold; color: #2c2520;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64;">Mobile Link:</td>
                    <td style="padding: 4px 0; font-weight: bold; color: #2c2520;">${safeCell}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64;">Email Address:</td>
                    <td style="padding: 4px 0; color: #2c2520;">${cleanEmail || "Not Provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64;">Workplace Center:</td>
                    <td style="padding: 4px 0; color: #2c2520;">${companyName.trim()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64;">Delivery Option:</td>
                    <td style="padding: 4px 0; font-weight: bold; color: #C5A028; text-transform: capitalize;">${deliveryMethod}</td>
                  </tr>
                  ${deliveryMethod === "delivery" ? `
                  <tr>
                    <td style="padding: 4px 0; color: #7c6e64; vertical-align: top;">Delivery Address:</td>
                    <td style="padding: 4px 0; color: #2c2520; line-height: 1.4;">${address.trim()}</td>
                  </tr>` : ""}
                </table>

                <!-- Order Summary Breakdown -->
                <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 1px; color: #2c2520; margin: 0 0 12px 0; border-bottom: 1px dashed #eadecf; padding-bottom: 6px;">Order Summary</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
                  <thead>
                    <tr style="background-color: #faf8f5;">
                      <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #eadecf; color: #5a4f43; font-weight: bold;">Product Item</th>
                      <th style="padding: 10px 8px; text-align: center; border-bottom: 2px solid #eadecf; color: #5a4f43; font-weight: bold; width: 50px;">Qty</th>
                      <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #eadecf; color: #5a4f43; font-weight: bold; width: 80px;">Unit Price</th>
                      <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #eadecf; color: #5a4f43; font-weight: bold; width: 90px;">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                  </tbody>
                </table>

                <!-- Totals Section -->
                <div style="margin-left: auto; width: 280px; font-size: 13px; border-top: 2px solid #C5A028; padding-top: 12px; background-color: #fdfdfd; padding: 15px; border-radius: 6px; border: 1px solid #f0eeeb;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 4px 0; color: #7c6e64;">Subtotal:</td>
                      <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #2c2520;">R ${Number(orderCalculations.subtotal).toFixed(2)}</td>
                    </tr>
                    ${orderCalculations.deliveryFee > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #7c6e64;">Delivery Fee:</td>
                      <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #2c2520;">R ${Number(orderCalculations.deliveryFee).toFixed(2)}</td>
                    </tr>` : ""}
                    ${orderCalculations.processingFee > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; color: #7c6e64;">Processing Fee:</td>
                      <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #2c2520;">R ${Number(orderCalculations.processingFee).toFixed(2)}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 8px 0 0 0; font-weight: bold; font-size: 15px; color: #2c2520; border-top: 1px solid #eadecf;">Grand Total:</td>
                      <td style="padding: 8px 0 0 0; text-align: right; font-weight: bold; font-size: 15px; color: #C5A028; font-family: monospace;">R ${Number(orderCalculations.total).toFixed(2)}</td>
                    </tr>
                  </table>
                </div>

                <!-- Footer Accents -->
                <div style="text-align: center; margin-top: 35px; border-top: 1px solid #eadecf; padding-top: 20px; font-size: 11px; color: #887a6b; line-height: 1.6;">
                  <p style="margin: 0; font-weight: bold; color: #2c2520;">Thank you for supporting Nems Bakery & Catering Co.!</p>
                  <p style="margin: 4px 0 0 0;">An active payment redirection form has initiated your checkout session.</p>
                  <p style="margin: 12px 0 0 0; font-size: 10px; color: #bcaaa4; font-style: italic;">Powered by Secure PayFast Gateway &bull; South Africa</p>
                </div>

              </div>
            </div>
          </div>
        `;

        // 2. Wrap the SMTPJS Email.send call in a try...catch...finally block to guarantee PayFast redirect
        try {
          console.log("Resolving and initializing SMTPJS library safely...");
          const Email = await getEmailClient();

          const emailOptions: any = {
            Host: "smtp.gmail.com",
            Username: "orders.nemsbakery@gmail.com",
            Password: "oiinzuasuecfjkgo",
            From: "orders.nemsbakery@gmail.com",
            To: cleanEmail && cleanEmail !== "orders.nemsbakery@gmail.com" ? cleanEmail : "orders.nemsbakery@gmail.com",
            Subject: `New Bakery Order #${trackingNumber} - ${safeName} (${companyName.trim()})`,
            Body: emailContentHTML
          };

          if (cleanEmail && cleanEmail !== "orders.nemsbakery@gmail.com") {
            emailOptions.Cc = "orders.nemsbakery@gmail.com";
          }

          console.log("Dispatching direct receipt email with SMTPJS standard Email.send...");
          const response = await Email.send(emailOptions);
          console.log("Email dispatch successfully concluded with SMTPJS response:", response);
        } catch (emailErr) {
          console.error("Fallback path caught order email dispatch exception:", emailErr);
        } finally {
          // --- GUARANTEED PAYFAST REDIRECT ---
          console.log("Proceeding to final payment phase: building PayFast payload secure form...");
          console.log("Dynamically building HTML form for Production PayFast post redirect:", payfastFields);

          // Create HTML Form element programmatically as requested
          const form = document.createElement("form");
          form.action = "https://www.payfast.co.za/eng/process";
          form.method = "POST";
          // Set target attribute to '_top' or '_blank' to ensure safe breakout from iframe sandbox
          form.target = (window.top && window.top !== window.self) ? "_blank" : "_top";

          const addField = (name: string, value: string) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
          };

          Object.entries(payfastFields).forEach(([key, value]) => {
            addField(key, value);
          });

          document.body.appendChild(form);
          form.submit();
          
          console.log("Direct client form submit triggers redirection successfully");

          // Fail-safe cleanup
          redirectTimeout = setTimeout(() => {
            setIsPaymentLoading(false);
            setSubmittingInvoice(false);
          }, 5000);
        }

      } catch (error: any) {
        console.error("PayFast checkout failure:", error);
        setPaymentError(error.message || "Unable to queue order or open secure PayFast portal. Please try again.");
        setIsPaymentLoading(false);
        setSubmittingInvoice(false);
        if (redirectTimeout) clearTimeout(redirectTimeout);
      }
    }
  };

  const handleOkClose = () => {
    onClearCart();
    setIsOrdered(false);
    setSuccessTrackingNumber(null);
    setCustomerName("");
    setCustomerPhone("");
    setEmail("");
    setCompanyName("");
    setAddress("");
    setExpectedDate("");
    setExpectedTime("");
    setPaymentError(null);
    handleRemoveCoupon();
    onClose();
  };

  // Render the drawer if it's open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden font-sans transition-all duration-300 z-50">
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-300 bg-stone-900/60 backdrop-blur-xs" 
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 transition-transform duration-305 translate-x-0">
        <div className="w-screen max-w-md bg-white border-l border-stone-200">
          <div className="flex h-full flex-col justify-between shadow-2xl">
            
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="font-serif text-lg font-black text-stone-950">
                  Your Confectionery Bag ZAR
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Body Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isOrdered ? (
                successTrackingNumber ? (
                  // Visual "Order Confirmed" Success Screen (UI/UX Update)
                  <div className="flex flex-col items-center justify-center min-h-[440px] text-center space-y-6 py-6 font-sans">
                    {/* Big Green Checkmark */}
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-sm animate-bounce">
                      <CheckCircle className="h-10 w-10 stroke-[2.5]" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-sans text-2xl font-black text-emerald-900 tracking-tight">ORDER CONFIRMED!</h3>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto">
                        Your payment was successfully processed. Thank you for choosing Nems Bakery!
                      </p>
                    </div>

                    {/* Order Number Display */}
                    <div className="w-full bg-stone-50 border border-stone-200 p-5 rounded-2xl text-center space-y-1">
                      <span className="text-[10px] uppercase font-black text-stone-400 tracking-widest block">ORDER TRACKING NUMBER</span>
                      <span className="text-4xl font-extrabold text-stone-900 tracking-wider block font-mono">
                        #{successTrackingNumber}
                      </span>
                    </div>

                    {/* Notice Text */}
                    <p className="text-xs text-stone-600 font-medium px-4 leading-relaxed">
                      Please take a screenshot of this screen or copy your order details below for your order tracking.
                    </p>

                    {/* Action Utilities: Buttons */}
                    <div className="w-full space-y-3 pt-2">
                      {/* Copy Order Details Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const text = `Nems Bakery Order #${successTrackingNumber} - Thank you for your purchase!`;
                          navigator.clipboard.writeText(text);
                          alert("Order details copied to clipboard!");
                        }}
                        className="w-full rounded-xl bg-white border-2 border-stone-900 hover:bg-stone-50 text-stone-900 py-3 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4 shrink-0 text-stone-700" />
                        <span>Copy Order Details</span>
                      </button>

                      {/* Send to WhatsApp Helper Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const message = `Hello Nems Bakery! I have successfully paid for my order. My 6-digit tracking code is #${successTrackingNumber}. Here is my proof of purchase!`;
                          const url = `https://wa.me/27637862408?text=${encodeURIComponent(message)}`;
                          window.open(url, "_blank");
                        }}
                        className="w-full rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0 text-white" />
                        <span>Send to WhatsApp</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleOkClose}
                      className="mt-4 text-stone-500 hover:text-stone-900 text-xs font-bold uppercase tracking-wider underline cursor-pointer"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                ) : (
                  // Order Successful Screen Design with Gold trims
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-sm animate-pulse">
                      <CheckCircle className="h-10 w-10 stroke-[2.5]" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-bold text-stone-900">Sweet Order Placed!</h3>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto">
                        Thank you for cooking with Nems. Your order is registered in our oven scheduling dashboard. We will message your phone shortly.
                      </p>
                    </div>

                    <div className="w-full bg-[#FAF9F5] border border-amber-200 p-4 rounded-2xl text-left space-y-3">
                      <span className="text-[10px] uppercase font-black text-[#D4AF37] tracking-widest block">Preparation Dispatch:</span>
                      
                      <div className="space-y-2 text-xs text-stone-900">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          <span>Bake Completion Time: <strong className="text-stone-950">24-36 Hours</strong></span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                          <span>Method Selection: <strong className="text-stone-950">{deliveryMethod === "collect" ? "Free Shop Pickup" : "Courier Delivery"}</strong></span>
                        </div>
                        <div className="border-t border-amber-200/40 pt-2 text-[10px] text-[#555] font-medium space-y-1.5 w-full">
                          {hasSmallOrders && paymentMethod === "cod" ? (
                            hasNormalOrders ? (
                              <div className="space-y-1">
                                <span className="text-stone-900 font-bold uppercase tracking-wider text-[9px] block">Split Payment Instructions:</span>
                                <p>🧁 <strong className="text-stone-950">Daily Treats (Cash on Delivery):</strong> Please prepare <strong className="text-amber-800 font-mono font-bold">R {orderCalculations.codTotal.toFixed(2)}</strong> in cash to settle on delivery.</p>
                                <p>🎂 <strong className="text-stone-950">Bulk Catering (Instant EFT / Card):</strong> The remaining <strong className="text-stone-950 font-mono font-bold">R {orderCalculations.eftTotal.toFixed(2)}</strong> must be settled via EFT before delivery.</p>
                              </div>
                            ) : (
                              <p>
                                Payment option is confirmed as <strong className="text-stone-950">Cash on Delivery (COD)</strong>. Please prepare exactly <strong className="text-stone-950 font-mono font-bold">R {orderCalculations.total.toFixed(2)}</strong> in cash for collection or delivery verification.
                              </p>
                            )
                          ) : (
                            <p>
                              A dynamic quote receipt copy has been sent to your phone <strong className="text-stone-950">{customerPhone}</strong>. The total of <strong className="text-stone-950 font-mono font-bold">R {orderCalculations.total.toFixed(2)}</strong> can be paid altogether via secure instant EFT or card.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleOkClose}
                      className="w-full rounded-full bg-stone-950 hover:bg-[#D4AF37] hover:text-stone-900 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all shadow-sm"
                    >
                      Got It, Continue Shopping
                    </button>
                  </div>
                )
              ) : cartItems.length === 0 ? (
                // Empty Bag Design
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="rounded-full bg-amber-50 p-6 border border-amber-100">
                    <ShoppingBag className="h-12 w-12 text-[#D4AF37]/60" />
                  </div>
                  <div>
                    <h3 className="font-serif text-md font-bold text-stone-900">Your Confectionery Bag is Empty</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">
                      Explore our high-tea buttermilk scones buckets, pastel macarons, and custom snack boxes to populate your party arrangements!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-stone-950 text-white min-w-44 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#D4AF37]"
                  >
                    Browse Bakery
                  </button>
                </div>
              ) : (
                // Unified Cart & Checkout View
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  {hasKidsPartyPack && (
                    <div id="kids-party-isolation-banner" className="bg-amber-50 border border-[#D4AF37]/40 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2.5 shadow-sm animate-fade-in">
                      <span className="text-base text-[#C5A028] leading-none shrink-0 font-bold font-sans">🎈</span>
                      <p className="font-semibold leading-relaxed text-[11px] text-stone-850">
                        Party Packs are handled via dedicated school/home delivery and cannot be combined with standard bakery orders.
                      </p>
                    </div>
                  )}
                  {/* Part 1: Bag Contents and Controllers */}
                  <div className="space-y-4">
                    {/* Small Daily Treats Section */}
                    {hasSmallOrders && (
                      <div className="space-y-2 border border-amber-100 bg-amber-50/10 p-3 rounded-lg">
                        <span className="text-[10px] uppercase font-black text-[#C5A028] block tracking-wide flex items-center space-x-1">
                          <span>🧁</span>
                          <span>Daily Treats &amp; Small Bites (Cash Option Eligible)</span>
                        </span>
                        <div className="space-y-2.5 divide-y divide-stone-100">
                          {smallTreatItems.map((item, idx) => (
                            <div 
                              key={`${item.id}-${idx}`}
                              className="flex items-start justify-between pt-2.5 first:pt-0"
                            >
                              <div className="flex items-start space-x-2.5">
                                <img 
                                  src={item.menuItem.image} 
                                  alt={item.menuItem.name} 
                                  referrerPolicy="no-referrer"
                                  className="h-10 w-10 rounded-md object-cover shrink-0 border border-stone-100"
                                />
                                <div className="min-w-0">
                                  <strong className="text-xs font-semibold text-stone-900 block leading-tight truncate max-w-[160px]">
                                    {item.menuItem.name}
                                  </strong>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {item.selectedFlavor && (
                                      <span className="inline-block rounded bg-amber-100 px-1 py-0.5 text-[8.5px] font-bold text-[#C5A028] border border-gold/30">
                                        Flavor: {item.selectedFlavor}
                                      </span>
                                    )}
                                  </div>
                                  {item.specialInstructions && (
                                    <p className="text-[9px] text-stone-500 font-mono italic mt-0.5 max-w-[150px] truncate">
                                      "{item.specialInstructions}"
                                    </p>
                                  )}
                                  <span className="text-[10px] font-bold text-stone-500 block mt-0.5 font-mono">
                                    R {item.unitPrice.toFixed(2)} each
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                                <span className="font-mono text-xs font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                                  R {(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-5 items-center border border-stone-200 rounded bg-white overflow-hidden text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1, item.selectedFlavor)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      -
                                    </button>
                                    <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1, item.selectedFlavor)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedFlavor)}
                                    className="text-stone-400 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right text-[10px] text-stone-500 border-t border-stone-100/60 pt-1.5 font-bold">
                          Treats Subtotal: <span className="text-stone-900 font-mono">R {smallSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Bulk Bakery buckets or custom catering */}
                    {hasNormalOrders && (
                      <div className="space-y-2 border border-stone-200 p-3 rounded-lg">
                        <span className="text-[10px] uppercase font-black text-stone-500 block tracking-wide flex items-center space-x-1">
                          <span>🎂</span>
                          <span>Bakery Buckets &amp; Bulk Catering</span>
                        </span>
                        <div className="space-y-2.5 divide-y divide-stone-100">
                          {normalBakeItems.map((item, idx) => (
                            <div 
                              key={`${item.id}-${idx}`}
                              className="flex items-start justify-between pt-2.5 first:pt-0"
                            >
                              <div className="flex items-start space-x-2.5">
                                <img 
                                  src={item.menuItem.image} 
                                  alt={item.menuItem.name} 
                                  referrerPolicy="no-referrer"
                                  className="h-10 w-10 rounded-md object-cover shrink-0 border border-stone-100"
                                />
                                <div className="min-w-0">
                                  <strong className="text-xs font-semibold text-stone-900 block leading-tight truncate max-w-[160px]">
                                    {item.menuItem.name}
                                  </strong>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {item.selectedSize && (
                                      <span className="inline-block rounded bg-stone-100 px-1 py-0.5 text-[8px] font-bold text-stone-700">
                                        Size: {item.selectedSize} Bucket
                                      </span>
                                    )}
                                    {item.selectedFlavor && (
                                      <span className="inline-block rounded bg-amber-105 px-1 py-0.5 text-[8.5px] font-bold text-[#C5A028] border border-gold/30">
                                        Flavor: {item.selectedFlavor}
                                      </span>
                                    )}
                                  </div>
                                  {item.specialInstructions && (
                                    <p className="text-[9px] text-stone-500 font-mono italic mt-0.5 max-w-[150px] truncate">
                                      "{item.specialInstructions}"
                                    </p>
                                  )}
                                  <span className="text-[10px] font-bold text-stone-500 block mt-0.5 font-mono">
                                    R {item.unitPrice.toFixed(2)} each
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                                <span className="font-mono text-xs font-bold text-stone-900 border-b border-stone-200 pb-0.5">
                                  R {(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-5 items-center border border-stone-200 rounded bg-white overflow-hidden text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1, item.selectedFlavor)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      -
                                    </button>
                                    <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1, item.selectedFlavor)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedFlavor)}
                                    className="text-stone-400 hover:text-rose-500 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-right text-[10px] text-stone-500 border-t border-stone-100/60 pt-1.5 font-bold">
                          Bulk Subtotal: <span className="text-stone-900 font-mono">R {normalSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Part 2: Coupon section (blank space directly above the subtotal) */}
                  <div className="pt-4 border-t border-stone-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] uppercase font-bold text-stone-400 tracking-wider">
                      <span>Have a Promo Coupon?</span>
                      <span className="text-[#C5A028] font-bold">Apply Coupon</span>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter Code (e.g. NEMS20, TREAT50, LOBOLA15)"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        className="flex-1 text-xs border border-stone-200 px-3 py-2.5 rounded-lg uppercase tracking-wider font-mono focus:outline-none focus:border-[#D4AF37] placeholder-stone-400 text-stone-950 bg-stone-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-900 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1 bg-rose-50 p-2 border border-rose-150 rounded-md">
                        ⚠️ {couponError}
                      </p>
                    )}

                    {couponSuccess && (
                      <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-md text-[10px] text-emerald-850 font-semibold flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-bold">✓ {couponSuccess}</p>
                          <span className="text-[9px] text-[#C5A028] font-bold block">
                            -{appliedCoupon?.type === 'percentage' ? `${appliedCoupon.value}%` : `R ${appliedCoupon?.value.toFixed(2)}`} reduction holds!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-stone-500 hover:text-rose-600 underline font-black uppercase tracking-wider text-[8px] pl-2 whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Part 3: Subtotal & Total Dashboard Card */}
                  <div className="bg-stone-50 p-4 rounded-xl space-y-2.5 border border-stone-200/40 text-xs text-stone-800">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Subtotal:</span>
                      <span className="font-mono">R {orderCalculations.subtotal.toFixed(2)}</span>
                    </div>

                    {/* ONLY appears once appliedCoupon is valid */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-[11px] text-[#C5A028] font-bold border-t border-stone-150/40 pt-2">
                        <span>Coupon Discount Applied:</span>
                        <span className="font-mono">-R {orderCalculations.discount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>🚚 Courier Fee:</span>
                        <strong className="text-stone-800 font-mono">R {deliveryFee.toFixed(2)}</strong>
                      </div>
                    )}

                    {paymentMethod === "standard" && (
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>Payment Processing Fee:</span>
                        <span className="font-mono">R {orderCalculations.processingFee.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Split COD payments vs Combined total display */}
                    {hasSmallOrders && hasNormalOrders && paymentMethod === "cod" ? (
                      <div className="border-t border-dashed border-stone-200 pt-2.5 space-y-1.5 font-bold">
                        <div className="flex justify-between text-yellow-850 bg-amber-50/50 p-1.5 rounded text-[11px] border border-amber-100">
                          <span>💵 Daily Treats (COD Due):</span>
                          <span className="font-mono">R {orderCalculations.codTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-stone-700 p-1.5 rounded text-[11px] bg-stone-100 border border-stone-200">
                          <span>🎂 Bulk Catering (EFT Due):</span>
                          <span className="font-mono">R {orderCalculations.eftTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-stone-200 pt-1.5 text-xs text-stone-900 bg-[#FDFAF5] p-1.5 border border-gold/30">
                          <span>Total Package Price:</span>
                          <strong className="font-mono text-gold">R {orderCalculations.total.toFixed(2)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between border-t border-[#D4AF37]/30 pt-2 text-sm bg-[#FDFAF5] p-2 border border-gold/30 rounded">
                        <span className="font-bold text-stone-950 font-serif">
                          {paymentMethod === "cod" ? "COD Total:" : "Combined Total:"}
                        </span>
                        <strong className="font-black text-[#D4AF37] font-serif font-mono text-base">
                          R {orderCalculations.total.toFixed(2)}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Part 4: FULFILLMENT COORDINATES & SUBMIT BUTTON */}
                  <div className="border-t border-stone-200 pt-5 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest">
                      Fulfillment Specs &amp; Delivery:
                    </span>

                    {/* Collection Mode Checkboxes */}
                    {!hasKidsPartyPack && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("collect")}
                          className={`rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider border transition-all ${
                            deliveryMethod === "collect"
                              ? "bg-stone-950 text-white border-stone-950"
                              : "bg-white text-stone-800 border-stone-200"
                          }`}
                        >
                          Free Pickup
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("delivery")}
                          className={`rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider border transition-all ${
                            deliveryMethod === "delivery"
                              ? "bg-stone-950 text-white border-stone-950"
                              : "bg-white text-stone-800 border-stone-200"
                          }`}
                        >
                          Courier (+R120)
                        </button>
                      </div>
                    )}

                    <div className="space-y-3 font-sans text-xs">
                      {hasKidsPartyPack && (
                        <div className="space-y-3 bg-[#fdfaf5] p-3.5 border border-[#D4AF37]/35 rounded-xl">
                          <span className="text-[10px] font-black uppercase text-[#C5A028] tracking-widest block mb-2 flex items-center space-x-1.5">
                            <span>🎈</span>
                            <span>Kids Party Logistics Specs:</span>
                          </span>

                          {/* Child's Full Name */}
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Child's Full Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Sipho Nkosi"
                              value={childName}
                              onChange={(e) => {
                                setChildName(e.target.value);
                                if (errors.childName) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.childName;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.childName ? "border-rose-500" : "border-stone-200"
                              }`}
                            />
                            {errors.childName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.childName}</p>}
                          </div>

                          {/* School Selector Dropdown */}
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">School Selector Dropdown *</label>
                            <select
                              value={selectedSchool}
                              onChange={(e) => {
                                setSelectedSchool(e.target.value);
                                if (errors.selectedSchool) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.selectedSchool;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.selectedSchool ? "border-rose-500" : "border-stone-200"
                              }`}
                            >
                              <option value="">-- Choose school run --</option>
                              <option value="Nova Pioneer Midrand Pre-Primary">Nova Pioneer Midrand Pre-Primary</option>
                              <option value="Nova Pioneer Midrand Primary">Nova Pioneer Midrand Primary</option>
                              <option value="Nova Pioneer Midrand High School">Nova Pioneer Midrand High School</option>
                              <option value="Curro Midrand">Curro Midrand</option>
                              <option value="Nova Pioneer Paulshof">Nova Pioneer Paulshof</option>
                              <option value="Other / Home Delivery">Other / Home Delivery</option>
                            </select>
                            {errors.selectedSchool && <p className="text-[10px] text-rose-500 mt-0.5">{errors.selectedSchool}</p>}
                          </div>

                          {/* Class / Grade Name */}
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Class / Grade Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Grade 1R"
                              value={classGrade}
                              onChange={(e) => {
                                setClassGrade(e.target.value);
                                if (errors.classGrade) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.classGrade;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.classGrade ? "border-rose-500" : "border-stone-200"
                              }`}
                            />
                            {errors.classGrade && <p className="text-[10px] text-rose-500 mt-0.5">{errors.classGrade}</p>}
                          </div>

                          {/* Delivery Date Selector */}
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Delivery Date Selector *</label>
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => {
                                setDeliveryDate(e.target.value);
                                if (errors.deliveryDate) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.deliveryDate;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.deliveryDate ? "border-rose-500" : "border-stone-200"
                              }`}
                            />
                            {errors.deliveryDate && <p className="text-[10px] text-rose-500 mt-0.5">{errors.deliveryDate}</p>}
                          </div>

                          {/* Conditional Home Delivery Fields */}
                          {selectedSchool === "Other / Home Delivery" && (
                            <div className="pt-2.5 mt-2 border-t border-dashed border-stone-200 space-y-3">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Home Address *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 15 Whispering Pine Close, Midrand"
                                  value={homeAddress}
                                  onChange={(e) => {
                                    setHomeAddress(e.target.value);
                                    if (errors.homeAddress) {
                                      setErrors(prev => {
                                        const next = { ...prev };
                                        delete next.homeAddress;
                                        return next;
                                      });
                                    }
                                  }}
                                  className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                    errors.homeAddress ? "border-rose-500" : "border-stone-200"
                                  }`}
                                />
                                {errors.homeAddress && <p className="text-[10px] text-rose-500 mt-0.5">{errors.homeAddress}</p>}
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Delivery Time Slot *</label>
                                <select
                                  value={deliveryTimeSlot}
                                  onChange={(e) => {
                                    setDeliveryTimeSlot(e.target.value);
                                    if (errors.deliveryTimeSlot) {
                                      setErrors(prev => {
                                        const next = { ...prev };
                                        delete next.deliveryTimeSlot;
                                        return next;
                                      });
                                    }
                                  }}
                                  className={`w-full rounded-lg border px-3 py-2 text-stone-950 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                    errors.deliveryTimeSlot ? "border-rose-500" : "border-stone-200"
                                  }`}
                                >
                                  <option value="">-- Choose time slot --</option>
                                  <option value="Morning Delivery (08:00 - 11:00)">Morning Delivery (08:00 - 11:00)</option>
                                  <option value="Midday Delivery (11:00 - 14:00)">Midday Delivery (11:00 - 14:00)</option>
                                  <option value="Afternoon Delivery (14:00 - 17:00)">Afternoon Delivery (14:00 - 17:00)</option>
                                </select>
                                {errors.deliveryTimeSlot && <p className="text-[10px] text-rose-500 mt-0.5">{errors.deliveryTimeSlot}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Lerato Khumalo"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] text-xs bg-white"
                        />
                        {errors.customerName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.customerName}</p>}
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. 072 123 4567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] text-xs bg-white"
                        />
                        {errors.customerPhone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.customerPhone}</p>}
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Email Address (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. custom@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] text-xs bg-white"
                        />
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Enter your email to receive your 6-digit order confirmation number directly.
                        </p>
                      </div>

                      {!hasKidsPartyPack && deliveryMethod === "delivery" && (
                        <>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Company / Workplace Name (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Gallagher Convention Centre"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              list="midrand-workplaces"
                              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] text-xs bg-white"
                            />
                            <datalist id="midrand-workplaces">
                              <option value="RTIA (Road Traffic Infringement Agency)" />
                              <option value="PURCO SA (Public Procurement Co-operative)" />
                              <option value="Nova Pioneer Midrand Pre-Primary" />
                              <option value="Gallagher Convention Centre" />
                              <option value="Midrand Corporate Park" />
                              <option value="Grand Central Airport Business Park" />
                            </datalist>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Delivery Address *</label>
                            <input
                              type="text"
                              placeholder="e.g. 834 9th avenue, Alexandra, Johannesburg"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] text-xs bg-white"
                            />
                            {errors.address && <p className="text-[10px] text-rose-500 mt-0.5">{errors.address}</p>}
                          </div>
                        </>
                      )}

                      {/* Cash Option for all configurations */}
                      <div className="space-y-2 pt-1 border border-amber-100 bg-amber-50/10 p-2.5 rounded-lg">
                        <label className="text-[9px] uppercase font-bold text-[#C5A028] block mb-1">
                          Payment Option Selection
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("standard")}
                            className={`rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              paymentMethod === "standard"
                                ? "bg-stone-950 text-white border-stone-950"
                                : "bg-white text-stone-800 border-stone-200 hover:border-[#D4AF37]/60"
                            }`}
                          >
                             {hasNormalOrders && hasSmallOrders ? "EFT BOTH TOGETHER" : "PAY WITH CARD / Instant EFT"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cod")}
                            className={`rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              paymentMethod === "cod"
                                ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-xs"
                                : "bg-white text-stone-800 border-stone-200 hover:border-[#D4AF37]/60"
                            }`}
                          >
                            💵 Cash on Delivery
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-500 bg-stone-50/50 p-2 border border-stone-100/50 italic rounded">
                          {paymentMethod === "cod" 
                            ? `Confirming via WhatsApp allows you to pay Cash on Delivery. Note that a 50% deposit is required via WhatsApp before prep.`
                            : "Settle everything altogether using credit card/instant bank EFT transfer."}
                        </p>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="mb-4 bg-rose-50 border border-rose-300 p-4 text-xs text-rose-950 font-semibold flex items-start space-x-2.5 shadow-md rounded-xl animate-fade-in border-l-4 border-l-rose-500">
                        <span className="text-rose-600 font-bold text-lg shrink-0 leading-none">⚠️</span>
                        <div>
                          <strong className="font-bold block uppercase tracking-wide text-rose-800 text-[10px] tracking-widest mb-1">Secure PayFast Checkout Error</strong>
                          {paymentError}
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cod" && !hasKidsPartyPack && (
                      <div className="mb-4 space-y-3 p-3.5 bg-amber-50/20 border border-amber-100 rounded-xl">
                        {hasNormalOrders ? (
                          <div>
                            <label className="text-[10px] uppercase font-bold text-stone-600 block mb-1">
                              Expected Delivery/Collection Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={expectedDate}
                              onChange={(e) => {
                                setExpectedDate(e.target.value);
                                if (errors.expectedDate) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.expectedDate;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.expectedDate ? "border-rose-500" : "border-stone-200"
                              }`}
                            />
                            {errors.expectedDate && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.expectedDate}</p>}
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] uppercase font-bold text-stone-600 block mb-1">
                              Expected Delivery/Collection Time *
                            </label>
                            <select
                              required
                              value={expectedTime}
                              onChange={(e) => {
                                setExpectedTime(e.target.value);
                                if (errors.expectedTime) {
                                  setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.expectedTime;
                                    return next;
                                  });
                                }
                              }}
                              className={`w-full rounded-lg border px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37] bg-white text-xs ${
                                errors.expectedTime ? "border-rose-500" : "border-stone-200"
                              }`}
                            >
                              <option value="">-- Please select a 1-hour window --</option>
                              <option value="07:00 - 08:00">07:00 - 08:00</option>
                              <option value="08:00 - 09:00">08:00 - 09:00</option>
                              <option value="09:00 - 10:00">09:00 - 10:00</option>
                              <option value="10:00 - 11:00">10:00 - 11:00</option>
                              <option value="11:00 - 12:00">11:00 - 12:00</option>
                              <option value="12:00 - 13:00">12:00 - 13:00</option>
                              <option value="13:00 - 14:00">13:00 - 14:00</option>
                              <option value="14:00 - 15:00">14:00 - 15:00</option>
                              <option value="15:00 - 16:00">15:00 - 16:00</option>
                            </select>
                            {errors.expectedTime && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.expectedTime}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 p-3.5 text-[11px] text-[#C5A028] font-bold text-center rounded-xl animate-fade-in italic">
                        *Please note: A 50% deposit is required via WhatsApp before your cash order can be processed and baked.*
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingInvoice || isPaymentLoading}
                      className={`w-full rounded-full py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                        isPaymentLoading 
                          ? "bg-stone-800 cursor-not-allowed" 
                          : paymentMethod === "cod"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                            : "bg-stone-950 hover:bg-[#D4AF37] hover:text-stone-950"
                      }`}
                    >
                      {isPaymentLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Connecting to PayFast...</span>
                        </>
                      ) : submittingInvoice ? (
                        <span>Scheduling Oven Queue...</span>
                      ) : paymentMethod === "cod" ? (
                        <span>SEND &amp; CONFIRM VIA WHATSAPP</span>
                      ) : hasNormalOrders && hasSmallOrders ? (
                        <span>PAY BOTH WITH PAYFAST</span>
                      ) : (
                        <span>PAY WITH PAYFAST &amp; ORDER</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
