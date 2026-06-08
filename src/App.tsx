/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import OrderingSystem from "./components/OrderingSystem";
import DailyTreats from "./components/DailyTreats";
import CateringPackageBuilder from "./components/CateringPackageBuilder";
import EventGallery from "./components/EventGallery";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import { MenuItem, BucketSize, CartItem } from "./types";
import { MENU_ITEMS } from "./data";
import { Info, Sparkles, AlertCircle, ShoppingBag, X } from "lucide-react";

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [toast, setToast] = useState<{ visible: boolean; message: string } | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);

  // Handle adding items to the cart
  const handleAddToBag = (
    item: MenuItem,
    quantity: number,
    selectedSize?: BucketSize,
    specialInstructions?: string
  ) => {
    setCartItems((prevItems) => {
      // Find matches with same item ID AND same bucket size selection
      const existingIdx = prevItems.findIndex(
        (cItem) =>
          cItem.menuItem.id === item.id &&
          cItem.selectedSize === selectedSize
      );

      const price = selectedSize && item.bucketPrices 
        ? item.bucketPrices[selectedSize] 
        : item.basePrice;

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
          specialInstructions: specialInstructions || updated[existingIdx].specialInstructions
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          id: item.id,
          menuItem: item,
          selectedSize,
          quantity,
          specialInstructions,
          unitPrice: price
        }
      ];
    });

    // Clear any active toast timers
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    // Set new toast
    setToast({
      visible: true,
      message: `${quantity}x ${item.name} added to your bag!`
    });

    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);

    setToastTimer(timer);
  };

  // Handle updating amount of items inside drawer
  const handleUpdateQty = (itemId: string, size: string | undefined, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(itemId, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((cItem) =>
        cItem.menuItem.id === itemId && cItem.selectedSize === size
          ? { ...cItem, quantity: qty }
          : cItem
      )
    );
  };

  const handleRemoveItem = (itemId: string, size: string | undefined) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (cItem) => !(cItem.menuItem.id === itemId && cItem.selectedSize === size)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Event coordination helper back into package customizer
  const handleSelectEventTemplate = (type: "platter" | "braai" | "hightea") => {
    setActiveSection("catering-builder");
    
    // Attempt to pre-select packageType on-screen within CateringPackageBuilder component
    // by triggering changes on the form if mapped
    const customizerEl = document.getElementById("catering-builder");
    if (customizerEl) {
      customizerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStartOrder = () => {
    setActiveSection("ordering");
    const el = document.getElementById("ordering");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartCustomQuote = () => {
    setActiveSection("catering-builder");
    const el = document.getElementById("catering-builder");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartDailyTreats = () => {
    setActiveSection("daily-treats");
    const el = document.getElementById("daily-treats");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-stone-900 selection:bg-[#D4AF37]/20 selection:text-stone-950">
      
      {/* Upper Announcement Bar representing South African delivery information */}
      <div className="bg-stone-950 text-white text-[10px] sm:text-xs font-semibold py-2 px-4 flex items-center justify-between border-b border-[#D4AF37]/40 z-50 relative">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] stroke-[2.5]" />
          <span>Daily baking fresh scones batches & gourmet macarons based in Pretoria & Johannesburg, SA!</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span>📋 Health certified isolation kitchens</span>
          <span>🚚 Delivery across Gauteng</span>
        </div>
      </div>

      {/* Primary Sticky Header */}
      <Navbar
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Core View Modules */}
      <main>
        {/* 1. Hero Module */}
        <Hero 
          onStartOrder={handleStartOrder}
          onStartCustomQuote={handleStartCustomQuote}
          onStartDailyTreats={handleStartDailyTreats}
        />

        {/* Brand Promise Section */}
        <section className="bg-white py-12 border-b border-amber-100/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <span className="text-3xl font-serif font-black text-[#D4AF37]">01</span>
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-950">Traditional South African Heritage</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Passed-down recipes using pure South African farm buttermilk and real butter for our high scone crowns.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <span className="text-3xl font-serif font-black text-[#D4AF37]">02</span>
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-950">Specialized Long Distance Travel</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Our double-walled corrugated cardboard Travel Boxes preserve high-temperature stability over long travel.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <span className="text-3xl font-serif font-black text-[#D4AF37]">03</span>
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-950">Allergen Safety Isolation</h3>
                <p className="text-[11px] text-stone-600 mt-1">
                  Certified health code practices with separate baking stations for nut-allergy and gluten-free adaptations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Online Ordering Section */}
        <OrderingSystem 
          onAddToBag={handleAddToBag}
        />

        {/* New Daily Treats / Small Orders Section */}
        <DailyTreats 
          onAddToBag={handleAddToBag}
        />

        {/* 3. Custom Dietary & Multi-Level Catering Builder Section */}
        <CateringPackageBuilder />

        {/* 4. Weddings and Celebrations Event Showcase */}
        <EventGallery 
          onSelectEventTemplate={handleSelectEventTemplate}
        />
      </main>

      {/* Interactive Cart Sidebar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Dynamic Checkout Toast Prompt */}
      {toast && toast.visible && (
        <>
          <style>{`
            @keyframes shrinkTimeout {
              0% { width: 100%; }
              100% { width: 0%; }
            }
          `}</style>
          <div 
            id="cart-checkout-toast"
            className="fixed bottom-6 right-6 md:right-10 z-[100] max-w-sm w-[90%] sm:w-full bg-stone-950/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-[#D4AF37]/50 flex flex-col space-y-2.5 transition-all duration-300 md:hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-[#D4AF37]/20 p-2 rounded-lg text-[#D4AF37] shrink-0 animate-pulse">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Delicacy Added</p>
                  <p className="text-xs font-semibold text-stone-100 mt-1 truncate">{toast.message}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setToast(null)}
                className="text-stone-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400 font-medium">Continue shopping or...</span>
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setToast(null);
                }}
                className="bg-[#D4AF37] hover:bg-white text-stone-950 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Go to checkout →
              </button>
            </div>

            {/* Animated shrinking progress line */}
            <div className="h-[2px] w-full bg-stone-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-[#D4AF37] rounded-full"
                style={{
                  animation: "shrinkTimeout 6s linear forwards"
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer Area */}
      <Footer />

    </div>
  );
}
