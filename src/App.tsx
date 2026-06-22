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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import AdminPortalModal from "./components/AdminPortalModal";
import Partnership from "./components/Partnership";
import KidsPartyPlanner from "./components/KidsPartyPlanner";

const DEFAULT_SETTINGS = {
  prices: {
    "gourmet-scones": { "2L": 140, "5L": 350, "10L": 700, "20L": 1300 },
    "artisanal-muffins": { "2L": 140, "5L": 350, "10L": 700, "20L": 1300 },
    "buttermilk-rusks": { "2L": 145, "5L": 360, "10L": 720, "20L": 1340 },
    "gourmet-macarons": { "2L": 270, "5L": 660, "10L": 1320, "20L": 2400 },
    "royal-biscuits": { "2L": 150, "5L": 375, "10L": 750, "20L": 1400 },
    "heritage-koeksisters": { "2L": 125, "5L": 310, "10L": 620, "20L": 1150 },
    "retail-scone": 30,
    "retail-rusk-classic": 25,
    "retail-rusk-seed": 30,
    "retail-biscuit-cherry": 10,
    "retail-biscuit-chocolate": 12,
    "retail-macaron-single": 18
  },
  inventory: {
    "gourmet-scones": 50,
    "artisanal-muffins": 35,
    "buttermilk-rusks": 40,
    "gourmet-macarons": 25,
    "royal-biscuits": 30,
    "heritage-koeksisters": 45,
    "retail-scone": 100,
    "retail-rusk-classic": 75,
    "retail-rusk-seed": 65,
    "retail-biscuit-cherry": 80,
    "retail-biscuit-chocolate": 85,
    "retail-macaron-single": 45
  },
  flavors: [
    { id: "flv-auth-scone", name: "Traditional Rich Cream Scone", category: "Scones", isActive: true },
    { id: "flv-raisin-scone", name: "Sweet Sun-Dried Raisin Scone", category: "Scones", isActive: true },
    { id: "flv-cheese-scone", name: "Savory Farm Cheddar Scone", category: "Scones", isActive: true },
    { id: "flv-choc-scone", name: "Sweet Double Choc Chip Scone", category: "Scones", isActive: false },
    
    { id: "flv-blue-muffin", name: "Blueberry Crumble Muffin", category: "Muffins", isActive: true },
    { id: "flv-choc-muffin", name: "Double Belgian Choc Muffin", category: "Muffins", isActive: true },
    { id: "flv-bran-muffin", name: "Harvest Bran Muffin", category: "Muffins", isActive: true },
    { id: "flv-lemon-muffin", name: "Lemon Poppy Seed Muffin", category: "Muffins", isActive: false },
    
    { id: "flv-butter-rusk", name: "Buttermilk Farm Rusk", category: "Rusks", isActive: true },
    { id: "flv-aniseed-rusk", name: "Spiced Sweet Aniseed Rusk", category: "Rusks", isActive: true },
    { id: "flv-crunch-rusk", name: "Wholewheat Crunchy Rusk", category: "Rusks", isActive: true }
  ],
  coupons: [
    { id: "cpn-nems20", code: "NEMS20", discount: 20, expiresAt: "2026-12-31", isActive: true },
    { id: "cpn-special", code: "SPECIAL15", discount: 15, expiresAt: "2026-08-31", isActive: true }
  ],
  contact: {
    email: "orders@nemsbakery.co.za",
    cellphone: "+27 82 555 4321",
    address: "Building 4, Midrand Workplace, Gauteng, 1682"
  }
};

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string } | null>(null);
  const [toastTimer, setToastTimer] = useState<any>(null);
  const [pendingPartyPack, setPendingPartyPack] = useState<{
    item: MenuItem;
    quantity: number;
    selectedSize?: BucketSize;
    specialInstructions?: string;
    selectedFlavor?: string;
  } | null>(null);

  // Initialize view states directly from URLs for zero-flicker routing
  const [isDailyTreatsMode, setIsDailyTreatsMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    return params.get("page") === "daily-treats" || 
           window.location.hash === "#daily-treats" ||
           pathname === "/daily-treats" || 
           pathname === "/daily-treats/";
  });

  const [isPartnershipMode, setIsPartnershipMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    return params.get("page") === "partnership" || 
           window.location.hash === "#partnership" || 
           pathname === "/partners" || 
           pathname === "/partners/";
  });

  const [isKidsPartyMode, setIsKidsPartyMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    return params.get("page") === "kids-party" || 
           window.location.hash === "#kids-party" || 
           pathname === "/party-packs" || 
           pathname === "/party-packs/";
  });

  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return "hero";
    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (params.get("page") === "partnership" || window.location.hash === "#partnership" || pathname === "/partners" || pathname === "/partners/") {
      return "partnership";
    }
    if (params.get("page") === "daily-treats" || window.location.hash === "#daily-treats" || pathname === "/daily-treats" || pathname === "/daily-treats/") {
      return "daily-treats";
    }
    if (params.get("page") === "kids-party" || window.location.hash === "#kids-party" || pathname === "/party-packs" || pathname === "/party-packs/") {
      return "kids-party";
    }
    return "hero";
  });

  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  const [siteSettings, setSiteSettings] = useState<any>(DEFAULT_SETTINGS);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Load site settings statically once on component mount
  useEffect(() => {
    async function loadSettingsOnce() {
      try {
        const docRef = doc(db, "site_settings", "store_config");
        const snapDoc = await getDoc(docRef);
        if (snapDoc.exists()) {
          setSiteSettings(snapDoc.data());
        } else {
          await setDoc(docRef, DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error("Failed to load static settings once:", err);
      }
    }
    loadSettingsOnce();
  }, []);

  // Auto-dismiss announcement bar after 9 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnnouncementVisible(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize state with URL parameters/hash/pathnames for deep linking directly to daily treats, partnerships or kids parties
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;
      const isTreats = params.get("page") === "daily-treats" || 
                       window.location.hash === "#daily-treats" ||
                       pathname === "/daily-treats" || 
                       pathname === "/daily-treats/";
      const isPartnership = params.get("page") === "partnership" || 
                            window.location.hash === "#partnership" || 
                            pathname === "/partners" || 
                            pathname === "/partners/";
      const isKidsParty = params.get("page") === "kids-party" || 
                          window.location.hash === "#kids-party" || 
                          pathname === "/party-packs" || 
                          pathname === "/party-packs/";
      
      setIsDailyTreatsMode(isTreats);
      setIsPartnershipMode(isPartnership);
      setIsKidsPartyMode(isKidsParty);
      
      if (isTreats) {
        setActiveSection("daily-treats");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (isPartnership) {
        setActiveSection("partnership");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (isKidsParty) {
        setActiveSection("kids-party");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Main homepage section, navigate to appropriate hash or scroll to top
        const hashSection = window.location.hash.replace("#", "");
        if (hashSection) {
          setActiveSection(hashSection);
          setTimeout(() => {
            const el = document.getElementById(hashSection);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          setActiveSection("hero");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
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
      const newUrl = window.location.origin + "/daily-treats";
      window.history.pushState({ path: newUrl }, "", newUrl);
      setIsDailyTreatsMode(true);
      setIsPartnershipMode(false);
      setIsKidsPartyMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "partnership") {
      const newUrl = window.location.origin + "/partners";
      window.history.pushState({ path: newUrl }, "", newUrl);
      setIsPartnershipMode(true);
      setIsDailyTreatsMode(false);
      setIsKidsPartyMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "kids-party") {
      const newUrl = window.location.origin + "/party-packs";
      window.history.pushState({ path: newUrl }, "", newUrl);
      setIsKidsPartyMode(true);
      setIsDailyTreatsMode(false);
      setIsPartnershipMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (isDailyTreatsMode || isPartnershipMode || isKidsPartyMode || window.location.pathname !== "/") {
        const newUrl = window.location.origin + "/";
        window.history.pushState({ path: newUrl }, "", newUrl);
        setIsDailyTreatsMode(false);
        setIsPartnershipMode(false);
        setIsKidsPartyMode(false);
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
    const isPartyPlan = item.id.startsWith("partyplan-");
    const hasPartyPackInCart = cartItems.some(cItem => cItem.menuItem.id.startsWith("partyplan-"));
    const hasRegularInCart = cartItems.some(cItem => !cItem.menuItem.id.startsWith("partyplan-"));

    if (isPartyPlan) {
      if (hasRegularInCart) {
        // Prevent addition until they clear standard treats or complete checkout
        setPendingPartyPack({
          item,
          quantity,
          selectedSize,
          specialInstructions,
          selectedFlavor
        });
        return;
      }
    } else {
      if (hasPartyPackInCart) {
        // Prevent adding standard items to bag with party pack
        if (toastTimer) {
          clearTimeout(toastTimer);
        }
        setToast({
          visible: true,
          message: "⚠️ Party Packs are handled via dedicated school/home delivery and cannot be combined with standard bakery orders."
        });
        const timer = setTimeout(() => {
          setToast(null);
        }, 8000);
        setToastTimer(timer);
        setIsCartOpen(true);
        return;
      }
    }

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
        onLogoTripleTap={() => setIsAdminModalOpen(true)}
      />

      {/* Main Core View Modules */}
      <main>
        {isPartnershipMode ? (
          <Partnership onBackToMenu={() => handleSetActiveSection("hero")} />
        ) : isKidsPartyMode ? (
          <KidsPartyPlanner 
            onAddToBag={handleAddToBag} 
            onBackToMenu={() => handleSetActiveSection("hero")}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : isDailyTreatsMode ? (
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
              cartItems={cartItems}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onOpenCart={() => setIsCartOpen(true)}
              siteSettings={siteSettings}
            />
          </>
        ) : (
          <>
            {/* 1. Hero Module */}
            <Hero 
              onStartOrder={handleStartOrder}
              onStartCustomQuote={handleStartCustomQuote}
              onStartDailyTreats={handleStartDailyTreats}
              onStartPartnership={() => handleSetActiveSection("partnership")}
              onStartKidsParty={() => handleSetActiveSection("kids-party")}
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
              siteSettings={siteSettings}
            />

            {/* 3. Custom Dietary & Multi-Level Catering Builder Section */}
            <CateringPackageBuilder />

            {/* 4. Weddings and Celebrations Event Showcase */}
            <EventGallery 
              onSelectEventTemplate={handleSelectEventTemplate}
            />

            {/* 5. Grow Your Business With Nems Bakery Partnership Banner */}
            <section className="bg-[#FDFAF5] py-16 px-4 border-t border-b border-amber-100">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center space-x-1 border border-gold/40 bg-white/80 px-3.5 py-1 text-[10px] uppercase font-bold tracking-widest text-[#B49225] rounded-full">
                  <span>Earn Extra Income</span>
                </div>
                
                <h3 className="serif text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase tracking-tight">
                  Grow Your Business With Nems Bakery
                </h3>
                
                <p className="text-sm sm:text-base text-stone-705 leading-relaxed max-w-2xl mx-auto">
                  Looking to earn extra income? Join our Partnership Program! Whether you want to purchase bulk buckets to resell at a profit in your community, or manage commission-based fresh treats as a corporate distributor in your office park, we have a track built for your goals.
                </p>
                
                <div className="pt-2">
                  <button
                    onClick={() => handleSetActiveSection("partnership")}
                    className="inline-flex items-center justify-center bg-stone-950 text-white hover:bg-gold px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    Learn More &amp; Apply →
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Interactive Cart Sidebar */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        siteSettings={siteSettings}
      />

      {/* Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        siteSettings={siteSettings}
        onUpdateSettings={(newSets) => setSiteSettings(newSets)}
        setIsAdminModalOpen={setIsAdminModalOpen}
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

      {pendingPartyPack && (
        <div id="cart-conflict-modal" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="text-center space-y-2">
              <span className="text-4xl">⚠️</span>
              <h3 className="font-serif font-black text-stone-900 text-lg uppercase tracking-wider">Cart Mixing Restriction</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                You have standard bakery items in your bag. <strong className="text-stone-950 block mt-1">Party Packs are handled via dedicated school/home delivery and cannot be combined with standard bakery orders.</strong>
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  // Automatically clear out regular treats/buckets first as per rules
                  setCartItems([]);
                  
                  // Now add the Kids Party Pack
                  const item = pendingPartyPack.item;
                  const quantity = pendingPartyPack.quantity;
                  const selectedSize = pendingPartyPack.selectedSize;
                  const specialInstructions = pendingPartyPack.specialInstructions;
                  const selectedFlavor = pendingPartyPack.selectedFlavor;
                  
                  const price = selectedSize && item.bucketPrices 
                    ? item.bucketPrices[selectedSize] 
                    : item.basePrice;

                  setCartItems([
                    {
                      id: item.id,
                      menuItem: item,
                      selectedSize,
                      selectedFlavor,
                      quantity,
                      specialInstructions,
                      unitPrice: price
                    }
                  ]);
                  
                  setPendingPartyPack(null);

                  if (toastTimer) {
                    clearTimeout(toastTimer);
                  }
                  
                  setToast({
                    visible: true,
                    message: "🔔 Bag cleared of standard treats & Kids Party Plan loaded successfully!"
                  });
                  
                  const timer = setTimeout(() => {
                    setToast(null);
                  }, 8000);
                  setToastTimer(timer);

                  setIsCartOpen(true);
                }}
                className="w-full py-3 bg-[#D4AF37] hover:bg-stone-900 hover:text-white text-stone-950 font-black uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-md cursor-pointer text-center"
              >
                Clear Bakery &amp; Add Party Pack
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingPartyPack(null);
                  setIsCartOpen(true); // Open the cart so they can complete checkout
                }}
                className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white font-black uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-md cursor-pointer text-center"
              >
                Complete Current Checkout First
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingPartyPack(null);
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel Addition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Area */}
      <Footer onPartnershipClick={() => handleSetActiveSection("partnership")} />

    </div>
  );
}
