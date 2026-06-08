/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from "react";
import { CartItem } from "../types";
import { X, Trash2, ShoppingBag, Truck, MapPin, CheckCircle, Clock } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (id: string, size: string | undefined, qty: number) => void;
  onRemoveItem: (id: string, size: string | undefined) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"collect" | "delivery">("collect");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"standard" | "cod">("standard");

  const smallTreatItems = useMemo(() => {
    return cartItems.filter(item => item.menuItem.id.startsWith("retail-"));
  }, [cartItems]);

  const normalBakeItems = useMemo(() => {
    return cartItems.filter(item => !item.menuItem.id.startsWith("retail-"));
  }, [cartItems]);

  const hasSmallOrders = smallTreatItems.length > 0;
  const hasNormalOrders = normalBakeItems.length > 0;

  const isOnlySmallOrders = useMemo(() => {
    return cartItems.length > 0 && cartItems.every(item => item.menuItem.id.startsWith("retail-"));
  }, [cartItems]);

  const deliveryFee = deliveryMethod === "delivery" ? 120 : 0;

  const smallSubtotal = useMemo(() => {
    return smallTreatItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
  }, [smallTreatItems]);

  const normalSubtotal = useMemo(() => {
    return normalBakeItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
  }, [normalBakeItems]);

  const orderCalculations = useMemo(() => {
    const subtotal = smallSubtotal + normalSubtotal;
    const total = subtotal + deliveryFee;
    return { subtotal, total };
  }, [smallSubtotal, normalSubtotal, deliveryFee]);

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

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    setErrors({});
    setSubmittingInvoice(true);

    const productsDescription = cartItems.map(
      item => `${item.menuItem.name}${item.selectedSize ? ` (${item.selectedSize} Bucket)` : ''} x${item.quantity}`
    ).join(", ");

    const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const path = "orders";

    // Detect payment mode (cod for small treats; eft for catering/bulk)
    let finalPaymentMode = "standard";
    if (hasSmallOrders) {
      if (paymentMethod === "cod") {
        finalPaymentMode = hasNormalOrders ? "split_cod_eft" : "cod";
      }
    }

    try {
      await addDoc(collection(db, path), {
        customerName: customerName.trim(),
        phoneNumber: customerPhone.trim(),
        product: productsDescription.substring(0, 2000),
        quantity: totalQuantity,
        totalPrice: orderCalculations.total,
        status: "Pending",
        orderDate: serverTimestamp(),
        deliveryMethod,
        deliveryAddress: deliveryMethod === "delivery" ? address.trim() : "Shop Pickup",
        paymentMethod: finalPaymentMode,
        paymentDetails: finalPaymentMode === "split_cod_eft" ? {
          cod_amount: smallSubtotal,
          eft_amount: normalSubtotal + deliveryFee
        } : null
      });

      setSubmittingInvoice(false);
      setIsOrdered(true);
    } catch (error) {
      setSubmittingInvoice(false);
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleOkClose = () => {
    onClearCart();
    setIsOrdered(false);
    setCustomerName("");
    setCustomerPhone("");
    setAddress("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
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
                              <span className="text-stone-900 font-bold uppercase tracking-wider text-[9px] block">Split Payment Instructions</span>
                              <p>🧁 <strong className="text-stone-950">Daily Treats (Cash on Delivery):</strong> Please prepare <strong className="text-amber-800 font-mono font-bold">R {smallSubtotal}</strong> in cash to settle on delivery.</p>
                              <p>🎂 <strong className="text-stone-950">Bulk Catering (Instant EFT / Card):</strong> The remaining <strong className="text-stone-950 font-mono font-bold">R {normalSubtotal + deliveryFee}</strong> must be settled via EFT before delivery.</p>
                            </div>
                          ) : (
                            <p>
                              Payment option is confirmed as <strong className="text-stone-950">Cash on Delivery (COD)</strong>. Please prepare exactly <strong className="text-stone-950 font-mono">R {orderCalculations.total}</strong> in cash for collection or delivery verification.
                            </p>
                          )
                        ) : (
                          <p>
                            A dynamic quote receipt copy has been sent to your phone <strong className="text-stone-950">{customerPhone}</strong>. The total of <strong className="text-stone-950 font-mono font-bold">R {orderCalculations.total}</strong> can be paid altogether via secure instant EFT or card.
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
                // Active Cart list with checkout form
                <div className="space-y-6">
                  {/* Cart Items List separated */}
                  <div className="space-y-4">
                    {/* 1. Small Daily Treats Section */}
                    {hasSmallOrders && (
                      <div className="space-y-2 border border-amber-100 bg-amber-50/10 p-3 rounded-lg">
                        <span className="text-[10px] uppercase font-black text-[#C5A028] block tracking-wide flex items-center space-x-1">
                          <span>🧁</span>
                          <span>Daily Treats & Small Bites (Cash Option Eligible)</span>
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
                                  {item.specialInstructions && (
                                    <p className="text-[9px] text-stone-500 font-mono italic mt-0.5 max-w-[150px] truncate">
                                      "{item.specialInstructions}"
                                    </p>
                                  )}
                                  <span className="text-[10px] font-bold text-stone-500 block mt-0.5 font-mono">
                                    R {item.unitPrice} each
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                                <span className="font-mono text-xs font-bold text-stone-900">
                                  R {item.unitPrice * item.quantity}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-5 items-center border border-stone-200 rounded bg-white overflow-hidden text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      -
                                    </button>
                                    <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id, item.selectedSize)}
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
                          Treats Subtotal: <span className="text-stone-900 font-mono">R {smallSubtotal}</span>
                        </div>
                      </div>
                    )}

                    {/* 2. Normal Bulk / Catering / Bucket Section */}
                    {hasNormalOrders && (
                      <div className="space-y-2 border border-stone-200 p-3 rounded-lg">
                        <span className="text-[10px] uppercase font-black text-stone-500 block tracking-wide flex items-center space-x-1">
                          <span>🎂</span>
                          <span>Bakery Buckets & Bulk Catering</span>
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
                                  {item.selectedSize && (
                                    <span className="inline-block rounded bg-stone-100 px-1 py-0.5 text-[8px] font-bold text-stone-700 mt-0.5">
                                      Size: {item.selectedSize} Bucket
                                    </span>
                                  )}
                                  {item.specialInstructions && (
                                    <p className="text-[9px] text-stone-500 font-mono italic mt-0.5 max-w-[150px] truncate">
                                      "{item.specialInstructions}"
                                    </p>
                                  )}
                                  <span className="text-[10px] font-bold text-stone-500 block mt-0.5 font-mono">
                                    R {item.unitPrice} each
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
                                <span className="font-mono text-xs font-bold text-stone-900">
                                  R {item.unitPrice * item.quantity}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-5 items-center border border-stone-200 rounded bg-white overflow-hidden text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      -
                                    </button>
                                    <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                                      className="px-1 hover:bg-stone-100"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(item.id, item.selectedSize)}
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
                          Bulk Subtotal: <span className="text-stone-900 font-mono">R {normalSubtotal}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking / Checkout Details Form (Gold / White background) */}
                  <form onSubmit={handleCheckoutSubmit} className="border-t border-stone-200 pt-5 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest">
                      Fulfillment Specs:
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
                        <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Phone Number for SMS Confirmation *</label>
                        <input
                          type="text"
                          placeholder="e.g. 072 123 4567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
                        />
                        {errors.customerPhone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.customerPhone}</p>}
                      </div>

                      {deliveryMethod === "delivery" && (
                        <div>
                          <label className="text-[9px] uppercase font-bold text-stone-600 block mb-1">Physical Delivery Address in SA *</label>
                          <input
                            type="text"
                            placeholder="e.g. 124 Francis Street, Pretoria"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-stone-900 focus:outline-none focus:border-[#D4AF37]"
                          />
                          {errors.address && <p className="text-[10px] text-rose-500 mt-0.5">{errors.address}</p>}
                        </div>
                      )}

                      {/* Cash upon delivery selector inside checkout form (appears if any small retail treats exist) */}
                      {hasSmallOrders && (
                        <div className="space-y-2 pt-1 border border-amber-100 bg-amber-50/10 p-2.5 rounded-lg">
                          <label className="text-[9px] uppercase font-bold text-[#C5A028] block mb-1">
                            Daily Treats Payment Option
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
                              {hasNormalOrders ? "EFT Both Together" : "Standard EFT"}
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
                              ? (hasNormalOrders 
                                ? `Treat elements (R ${smallSubtotal}) paid via Cash upon arrival. Large Catering / Bucket order requires EFT confirmation before prep.`
                                : `Prepare clean cash matching your total of R ${orderCalculations.total} on arrival.`
                                )
                              : "Settle everything altogether using credit card/instant bank EFT transfer."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Calculator details */}
                    <div className="bg-stone-50 p-4 rounded-xl space-y-2.5 border border-stone-200/40 text-xs">
                      {hasNormalOrders && (
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium font-sans">🎂 Catering Subtotal:</span>
                          <strong className="text-stone-900 font-mono">R {normalSubtotal}</strong>
                        </div>
                      )}
                      {hasSmallOrders && (
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium font-sans">🧁 Daily Treats Subtotal:</span>
                          <strong className="text-stone-900 font-mono">R {smallSubtotal}</strong>
                        </div>
                      )}
                      
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-stone-500 font-medium font-sans">🚚 Courier Fee:</span>
                          <strong className="text-stone-900 font-mono">R {deliveryFee}</strong>
                        </div>
                      )}

                      {/* Split displays vs combined display */}
                      {hasSmallOrders && hasNormalOrders && paymentMethod === "cod" ? (
                        <div className="border-t border-dashed border-stone-200 pt-2.5 space-y-1.5 font-bold">
                          <div className="flex justify-between text-yellow-800 bg-amber-50/50 p-1.5 rounded text-[11px]">
                            <span>💵 Daily Treats (COD Due):</span>
                            <span className="font-mono">R {smallSubtotal}</span>
                          </div>
                          <div className="flex justify-between text-stone-700 p-1.5 rounded text-[11px]">
                            <span>🎂 Bulk Catering (EFT Due):</span>
                            <span className="font-mono">R {normalSubtotal + deliveryFee}</span>
                          </div>
                          <div className="flex justify-between border-t border-stone-200 pt-1.5 text-xs text-stone-900">
                            <span>Total Package Price:</span>
                            <strong className="font-mono text-gold">R {smallSubtotal + normalSubtotal + deliveryFee}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between border-t border-[#D4AF37]/30 pt-2 text-sm">
                          <span className="font-bold text-stone-950 font-serif">
                            {paymentMethod === "cod" ? "COD Order Total:" : "Combined Order Total:"}
                          </span>
                          <strong className="font-black text-[#D4AF37] font-serif font-mono text-base">
                            R {orderCalculations.total}
                          </strong>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingInvoice}
                      className="w-full rounded-full bg-stone-950 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4AF37] hover:text-stone-950 transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>{submittingInvoice ? "Scheduling Oven Queue..." : "Confirm Store & Bake Order"}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
