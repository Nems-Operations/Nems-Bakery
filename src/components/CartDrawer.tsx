/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent, useEffect } from "react";
import { CartItem } from "../types";
import { X, Trash2, ShoppingBag, Truck, CheckCircle, Clock, Copy, MessageSquare } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  cartItems: CartItem[];
  onUpdateQty: (id: string, size: string | undefined, qty: number, flavor?: string) => void;
  onRemoveItem: (id: string, size: string | undefined, flavor?: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  onOpen,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart
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

  const deliveryFee = deliveryMethod === "delivery" ? 120 : 0;

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
    if (deliveryMethod === "delivery" && !address.trim()) {
      currentErrors.address = "A delivery destination address is mandatory";
    }

    if (paymentMethod === "cod") {
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

      const deliverySelection = deliveryMethod === "collect" ? "Free Pickup" : "Courier";

      let waMessage = "";
      if (hasNormalOrders) {
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
        // Automatically determine if the app should use the pure client-side checkout or server-side API.
        // It should use client-side if hosted on GitHub Pages (static), or if explicitly specified by setting.
        const isLocalOrPreview = window.location.hostname === "localhost" || 
                                 window.location.hostname === "127.0.0.1" || 
                                 window.location.hostname.endsWith(".run.app");
        const isStaticHost = !isLocalOrPreview || import.meta.env.VITE_FORCE_CLIENT_CHECKOUT === "true";

        const customApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "";

        let orderId = "";
        let trackingNumber = "";
        let payfastUrl = "";
        let payfastFields: Record<string, string> = {};

        if (isStaticHost && !customApiUrl) {
          // --- PURE FRONTEND CHECKOUT FLOW (for GitHub Pages / static hosting) ---
          console.log("Static hosting detected - performing direct frontend checkout...");
          
          trackingNumber = generateTrackingNumber();
          const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

          const productsDescription = cartItems.map(
            item => `${item.menuItem.name}${item.selectedFlavor ? ` (${item.selectedFlavor})` : ""}${item.selectedSize ? ` (${item.selectedSize} Bucket)` : ""} x${item.quantity}`
          ).join(", ");

          const finalPaymentMode = paymentMethod === "cod" ? "split_cod_eft" : "card_payfast";

          // Save the order to Firestore directly from the user's browser client
          const path = "orders";
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
            paymentStatus: "PENDING_PAYMENT",
            orderNumber: trackingNumber,
            trackingNumber: trackingNumber,
            paymentDetails: null,
            cartItems: cartItems.map(item => ({
              menuItem: {
                name: item.menuItem.name,
                id: item.menuItem.id,
                basePrice: item.menuItem.basePrice
              },
              selectedFlavor: item.selectedFlavor || null,
              selectedSize: item.selectedSize || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })),
            orderCalculations,
            createdAt: new Date().toISOString()
          };

          const docRef = await addDoc(collection(db, path), orderData);
          orderId = docRef.id;

          // Build PayFast integration parameters on the client
          const payfastMerchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID || "10000100";
          const payfastMerchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "46ca4f5e0141e";
          
          const origin = window.location.origin;
          const returnUrl = `${origin}?payment=success&orderId=${orderId}&trackingCode=${trackingNumber}`;
          const cancelUrl = origin;
          
          // Optionally allow pointing webhook notifications to a custom production backend/functions if configured
          const notifyUrl = import.meta.env.VITE_WEBHOOK_URL || `${origin}/api/payfast-itn`;

          payfastFields = {
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

          payfastUrl = `https://www.payfast.co.za/eng/process?${params.toString()}`;

        } else {
          // --- SERVER SIDE API ROUTES CHECKOUT ---
          let endpointUrl = "/api/checkout";
          if (customApiUrl) {
            if (customApiUrl.includes("/checkout") || customApiUrl.includes("/api/")) {
              endpointUrl = customApiUrl;
            } else {
              endpointUrl = `${customApiUrl.replace(/\/$/, "")}/api/checkout`;
            }
          }
          console.log(`Executing server side checkout via endpoint: ${endpointUrl}`);

          const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              email: email.trim(),
              companyName: companyName.trim(),
              deliveryMethod,
              address: address.trim(),
              cartItems: cartItems.map(item => ({
                menuItem: {
                  name: item.menuItem.name,
                  id: item.menuItem.id,
                  basePrice: item.menuItem.basePrice
                },
                selectedFlavor: item.selectedFlavor || null,
                selectedSize: item.selectedSize || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice
              })),
              orderCalculations: {
                subtotal: orderCalculations.subtotal,
                deliveryFee: orderCalculations.deliveryFee,
                discount: orderCalculations.discount,
                processingFee: orderCalculations.processingFee,
                total: orderCalculations.total
              },
              paymentMethod: "card_payfast"
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to initialize secure checkout session");
          }

          const checkoutData = await response.json();
          orderId = checkoutData.orderId;
          trackingNumber = checkoutData.trackingNumber;
          payfastUrl = checkoutData.payfastUrl;
          payfastFields = checkoutData.payfastFields;
        }

        // Breakout redirection flow using both window breakout and programmatic form POST with custom target
        let redirected = false;

        // Plan A: Top-level breakout redirect using get-based URL returned by API
        try {
          if (window.top && window.top !== window.self) {
            console.log("Iframe detected - breaking out to PayFast via top window location");
            window.top.location.href = payfastUrl;
            redirected = true;
          }
        } catch (topErr) {
          console.warn("Iframe breakout via top.location was restricted by browser sandboxing. Trying alternative methods.", topErr);
        }

        // Plan B: Programmatic form POST breakout using target="_blank"
        if (!redirected) {
          try {
            const form = document.createElement("form");
            form.action = "https://www.payfast.co.za/eng/process";
            form.method = "POST";
            form.target = "_blank"; // Set target to "_blank" to ensure it opens in a new tab for maximum reliability

            const addField = (name: string, value: string) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = name;
              input.value = value;
              form.appendChild(input);
            };

            Object.entries(payfastFields).forEach(([key, value]: [string, any]) => {
              addField(key, value);
            });

            document.body.appendChild(form);
            form.submit();
            redirected = true;
            console.log("PayFast programmatic form post submitted successfully");
          } catch (formErr) {
            console.error("Form submission failed, trying direct window.open fallback:", formErr);
          }
        }

        // Plan C: Ultimate fallback window.open / window.location.href
        if (!redirected) {
          console.log("Redirecting utilizing window.open or standard location fallback");
          window.open(payfastUrl, "_blank") || (window.location.href = payfastUrl);
        }

        // Configure a fail-safe timeout so that the loading spinner resets 
        // to a friendly state instead of hanging forever if redirect is delayed/blocked
        redirectTimeout = setTimeout(() => {
          setIsPaymentLoading(false);
          setSubmittingInvoice(false);
        }, 5000);

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

                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Lerato Khumalo"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
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
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
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
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
                        />
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Enter your email to receive your 6-digit order confirmation number directly.
                        </p>
                      </div>

                      {deliveryMethod === "delivery" && (
                        <>
                          <div>
                            <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Company / Workplace Name (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Gallagher Convention Centre"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              list="midrand-workplaces"
                              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
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
                              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
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

                    {paymentMethod === "cod" && (
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
