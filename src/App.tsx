/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DailyTreatsPreview from "./components/DailyTreatsPreview";
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

  const [isDailyTreatsMode, setIsDailyTreatsMode] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  // Auto-dismiss announcement bar after 9 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnnouncementVisible(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize state with URL parameters/hash for deep linking directly to daily treats
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const isTreats = params.get("page") === "daily-treats" || window.location.hash === "#daily-treats";
      setIsDailyTreatsMode(isTreats);
      if (isTreats) {
        setActiveSection("daily-treats");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    handleUrlChange();

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Coordinate route shifts and page scrolling choreography
  const handleSetActiveSection = (section: string) => {
    setActiveSection(section);
    if (section === "daily-treats") {
      const newUrl = window.location.origin + window.location.pathname + "?page=daily-treats";
      window.history.pushState({ path: newUrl }, "", newUrl);
      setIsDailyTreatsMode(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (isDailyTreatsMode) {
        const newUrl = window.location.origin + window.location.pathname;
        window.history.pushState({ path: newUrl }, "", newUrl);
        setIsDailyTreatsMode(false);
      }
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (section === "hero") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  };

  // Handle adding items to the cart
  const handleAddToBag = (
    item: MenuItem,
    quantity: number,
    selectedSize?: BucketSize,
    specialInstructions?: string,
    selectedFlavor?: string
  ) => {
    setCartItems((prevItems) => {
      // Find matches with same item ID AND same bucket size selection AND same flavor
      const existingIdx = prevItems.findIndex(
        (cItem) =>
          cItem.menuItem.id === item.id &&
          cItem.selectedSize === selectedSize &&
          cItem.selectedFlavor === selectedFlavor
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
          selectedFlavor,
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
      message: `${quantity}x ${item.name}${selectedFlavor ? ` (${selectedFlavor})` : ''} added to your bag!`
    });

    const timer = setTimeout(() => {
      setToast(null);
    }, 6000);

    setToastTimer(timer);
  };

  // Handle updating amount of items inside drawer
  const handleUpdateQty = (itemId: string, size: string | undefined, qty: number, flavor?: string) => {
    if (qty <= 0) {
      handleRemoveItem(itemId, size, flavor);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((cItem) =>
        cItem.menuItem.id === itemId && cItem.selectedSize === size && cItem.selectedFlavor === flavor
          ? { ...cItem, quantity: qty }
          : cItem
      )
    );
  };

  const handleRemoveItem = (itemId: string, size: string | undefined, flavor?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (cItem) => !(cItem.menuItem.id === itemId && cItem.selectedSize === size && cItem.selectedFlavor === flavor)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Event coordination helper back into package customizer
  const handleSelectEventTemplate = (type: "platter" | "braai" | "hightea") => {
    handleSetActiveSection("catering-builder");
  };

  const handleStartOrder = () => {
    handleSetActiveSection("ordering");
  };

  const handleStartCustomQuote = () => {
    handleSetActiveSection("catering-builder");
  };

  const handleStartDailyTreats = () => {
    handleSetActiveSection("daily-treats");
  };

  const handleExploreDailyTreats = (targetId?: string) => {
    setIsDailyTreatsMode(true);
    setActiveSection("daily-treats");
    const newUrl = window.location.origin + window.location.pathname + "?page=daily-treats" + (targetId ? `#${targetId}` : '');
    window.history.pushState({ path: newUrl }, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Set hash explicitly so hashchange listener runs even if component is mounting
    if (targetId) {
      window.location.hash = `#${targetId}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-stone-900 selection:bg-[#D4AF37]/20 selection:text-stone-950">
      
      {/* Upper Announcement Bar representing South African delivery information */}
      {isAnnouncementVisible && (
        <div className="bg-stone-950 text-white text-[10px] sm:text-xs font-semibold py-2.5 px-4 flex items-center justify-between border-b border-[#D4AF37]/40 z-50 relative transition-all duration-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] stroke-[2.5]" />
            <span>Daily baking fresh scone batches &amp; gourmet macarons based in Johannesburg, SA!</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span>📋 Certified isolation kitchens</span>
            <span>🚚 Delivery across Gauteng</span>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="text-stone-400 hover:text-white transition-colors ml-2 p-0.5 hover:bg-white/10 rounded cursor-pointer"
              aria-label="Dismiss Announcement"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary Sticky Header */}
      <Navbar
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
      />

      {/* Main Core View Modules */}
      <main>
        {isDailyTreatsMode ? (
          <>
            {/* Standalone Deep Link Welcoming Header */}
            <div id="treats-welcome-hero" className="bg-white border-b border-amber-100 py-12 px-4 text-center">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 tracking-wider">
                  <span>Nems Bakery &amp; Catering Co.</span>
                  <span>•</span>
                  <span className="text-gold font-black uppercase">Johannesburg</span>
                </div>
                <h1 className="serif text-3xl font-black text-stone-950 sm:text-4xl">
                  Daily Treats &amp; Small Individual Orders
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Looking for individual buttermilk scones, crunchy rusks, delicate macarons, or buttery piped treats? 
                  Order directly below. Perfect for personal cravings or small office snacks.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleSetActiveSection("hero")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-205 cursor-pointer rounded-lg shadow-md hover:scale-[1.01] active:scale-95"
                  >
                    ← Explore Full Cakes &amp; Catering Menu
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Treats Standalone Shop Component */}
            <DailyTreats 
              onAddToBag={handleAddToBag}
            />
          </>
        ) : (
          <>
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

            {/* Daily Treats & Small Individual Orders Interactive Preview Slider */}
            <DailyTreatsPreview onExplore={handleExploreDailyTreats} />

            {/* 2. Interactive Online Ordering Section */}
            <OrderingSystem 
              onAddToBag={handleAddToBag}
            />

            {/* 3. Custom Dietary & Multi-Level Catering Builder Section */}
            <CateringPackageBuilder />

            {/* 4. Weddings and Celebrations Event Showcase */}
            <EventGallery 
              onSelectEventTemplate={handleSelectEventTemplate}
            />
          </>
        )}
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
