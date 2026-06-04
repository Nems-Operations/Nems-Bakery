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

  const deliveryFee = deliveryMethod === "delivery" ? 120 : 0;

  const orderCalculations = useMemo(() => {
    const subtotal = cartItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const total = subtotal + deliveryFee;
    return { subtotal, total };
  }, [cartItems, deliveryFee]);

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
        deliveryAddress: deliveryMethod === "delivery" ? address.trim() : "Shop Pickup"
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
                      <p className="border-t border-amber-200/40 pt-2 text-[10px] text-stone-500 font-medium">
                        A dynamic quote receipt copy has been sent to your phone <strong className="text-stone-950">{customerPhone}</strong>. Payment can be settled via instant EFT or card on collection.
                      </p>
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
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-widest">Added delicacies:</span>
                    {cartItems.map((item, idx) => {
                      const idWithIdx = `${item.id}-${item.selectedSize || "single"}-${idx}`;
                      return (
                        <div 
                          key={idWithIdx}
                          className="flex items-start justify-between border-b border-stone-100 pb-3"
                        >
                          <div className="flex items-start space-x-3">
                            <img 
                              src={item.menuItem.image} 
                              alt={item.menuItem.name} 
                              referrerPolicy="no-referrer"
                              className="h-12 w-12 rounded-lg object-cover shrink-0 border border-stone-100"
                            />
                            <div>
                              <strong className="text-xs font-semibold text-stone-900 block leading-tight">
                                {item.menuItem.name}
                              </strong>
                              {item.selectedSize && (
                                <span className="inline-block rounded-md bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold text-stone-800 mt-0.5">
                                  Size: {item.selectedSize} Bucket
                                </span>
                              )}
                              {item.specialInstructions && (
                                <p className="text-[10px] text-stone-600 font-mono italic mt-0.5 max-w-[200px] line-clamp-1">
                                  "{item.specialInstructions}"
                                </p>
                              )}
                              <span className="text-[11px] font-bold text-stone-950 block mt-1">
                                R {item.unitPrice} each
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col items-end justify-between space-y-1.5">
                            <span className="font-mono text-xs font-bold text-stone-950">
                              R {item.unitPrice * item.quantity}
                            </span>
                            <div className="flex items-center space-x-2.5">
                              <div className="flex h-6 items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden text-[11px]">
                                <button
                                  onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                                  className="px-1.5 hover:bg-stone-100"
                                >
                                  -
                                </button>
                                <span className="px-1.5 font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                                  className="px-1.5 hover:bg-stone-100"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => onRemoveItem(item.id, item.selectedSize)}
                                className="text-stone-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                    </div>

                    {/* Payment Calculator details */}
                    <div className="bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-200/40 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">Bakes Subtotal:</span>
                        <strong className="text-stone-900">R {orderCalculations.subtotal}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">Delivery Surcharge:</span>
                        <strong className="text-stone-900">R {deliveryFee}</strong>
                      </div>
                      <div className="flex justify-between border-t border-stone-200/60 pt-2 text-sm">
                        <span className="font-bold text-stone-950 font-serif">Order Total:</span>
                        <strong className="font-black text-[#D4AF37] font-serif">R {orderCalculations.total}</strong>
                      </div>
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
