/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, FormEvent } from "react";
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Gift, 
  Calendar, 
  ArrowRight, 
  X,
  Compass,
  Utensils,
  Sparkle
} from "lucide-react";
import { MenuItem, Category } from "../types";
import CateringPackageBuilder from "./CateringPackageBuilder";
import KidsPartyPlanner from "./KidsPartyPlanner";
import OrderingSystem from "./OrderingSystem";
import EventGallery from "./EventGallery";

interface PackagesHubProps {
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSize?: any,
    specialInstructions?: string,
    selectedFlavor?: string
  ) => void;
  siteSettings?: any;
  isKidsPartyOpenByDefault?: boolean;
  onCloseKidsParty?: () => void;
  isCateringOpenByDefault?: boolean;
  onCloseCatering?: () => void;
  isBucketsOpenByDefault?: boolean;
  onCloseBuckets?: () => void;
  isEventsOpenByDefault?: boolean;
  onCloseEvents?: () => void;
  onSelectEventTemplate?: (type: "platter" | "braai" | "hightea") => void;
  initialBucketItemId?: string;
  initialBucketSize?: any;
}

export default function PackagesHub({
  onAddToBag,
  siteSettings,
  isKidsPartyOpenByDefault = false,
  onCloseKidsParty,
  isCateringOpenByDefault = false,
  onCloseCatering,
  isBucketsOpenByDefault = false,
  onCloseBuckets,
  isEventsOpenByDefault = false,
  onCloseEvents,
  onSelectEventTemplate,
  initialBucketItemId,
  initialBucketSize
}: PackagesHubProps) {
  // Modal visibility states
  const [activeModal, setActiveModal] = useState<"catering" | "custom" | "kids" | "buckets" | "events" | null>(null);

  // Sync deep link states with activeModal
  useEffect(() => {
    if (isKidsPartyOpenByDefault) {
      setActiveModal("kids");
    }
  }, [isKidsPartyOpenByDefault]);

  useEffect(() => {
    if (isCateringOpenByDefault) {
      setActiveModal("catering");
    }
  }, [isCateringOpenByDefault]);

  useEffect(() => {
    if (isBucketsOpenByDefault) {
      setActiveModal("buckets");
    }
  }, [isBucketsOpenByDefault]);

  useEffect(() => {
    if (initialBucketItemId) {
      setActiveModal("buckets");
    }
  }, [initialBucketItemId]);

  useEffect(() => {
    if (isEventsOpenByDefault) {
      setActiveModal("events");
    }
  }, [isEventsOpenByDefault]);

  // Mobile menu flyout state
  const [isMobileFlyoutOpen, setIsMobileFlyoutOpen] = useState(false);

  // Custom package builder states
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({
    scones: 6,
    muffins: 6,
    classicRusks: 0,
    seedRusks: 0,
    cherryBiscuits: 0,
    chocBiscuits: 0,
    macarons: 12
  });

  const [boxType, setBoxType] = useState<"standard" | "travel">("standard");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [isCustomAdded, setIsCustomAdded] = useState(false);

  // Pricing constants for Custom Packages
  const customPricing = useMemo(() => {
    const prices = siteSettings?.prices || {};
    return {
      scones: prices["retail-scone"] || 30,
      muffins: 35, // Premium custom muffin
      classicRusks: prices["retail-rusk-classic"] || 25,
      seedRusks: prices["retail-rusk-seed"] || 30,
      cherryBiscuits: prices["retail-biscuit-cherry"] || 10,
      chocBiscuits: prices["retail-biscuit-chocolate"] || 12,
      macarons: prices["retail-macaron-single"] || 18,
      box: {
        standard: 50,
        travel: 150
      },
      dietary: {
        "gluten-free": 80,
        "halal": 50,
        "vegan": 90,
        "diabetic": 70,
        "nut-free": 40
      }
    };
  }, [siteSettings]);

  const customItemsData = [
    { id: "scones", name: "High-Crown Buttermilk Scones", price: customPricing.scones, desc: "Traditional farm-style rich scones.", icon: "🧁" },
    { id: "muffins", name: "Gourmet Bakery Muffins", price: customPricing.muffins, desc: "Fluffy, freshly baked morning treats.", icon: "🧁" },
    { id: "classicRusks", name: "Classic Buttermilk Rusks", price: customPricing.classicRusks, desc: "Double-baked crispy coffee dunkers.", icon: "🥖" },
    { id: "seedRusks", name: "Roasted Almond & Seed Rusks", price: customPricing.seedRusks, desc: "Low-sugar multi-seed premium rusks.", icon: "🥖" },
    { id: "cherryBiscuits", name: "Cherry Butter Biscuits", price: customPricing.cherryBiscuits, desc: "Pure butter swirl with cherry dome.", icon: "🍪" },
    { id: "chocBiscuits", name: "Chocolate-Dipped Biscuits", price: customPricing.chocBiscuits, desc: "Piped shortbread in Belgian dark choc.", icon: "🍪" },
    { id: "macarons", name: "Signature Pastel Macarons", price: customPricing.macarons, desc: "Almond macarons with strawberry creme.", icon: "🍬" }
  ];

  // Calculate live custom package cost
  const customSummary = useMemo(() => {
    let itemsSubtotal = 0;
    Object.entries(customQuantities).forEach(([id, qty]) => {
      const price = Number((customPricing as any)[id] || 0);
      itemsSubtotal += price * Number(qty);
    });

    const boxCost = Number(customPricing.box[boxType] || 0);
    const dietaryCost = selectedDietary.reduce((sum: number, dId: string) => {
      return sum + Number((customPricing.dietary as any)[dId] || 0);
    }, 0);

    const total = itemsSubtotal + boxCost + dietaryCost;
    const totalItemsCount = Object.values(customQuantities).reduce((sum: number, qty: number) => sum + Number(qty), 0);

    return {
      itemsSubtotal,
      boxCost,
      dietaryCost,
      total,
      totalItemsCount
    };
  }, [customQuantities, boxType, selectedDietary, customPricing]);

  // Sidebar link details
  const navigationLinks = [
    { label: "Daily Treats", id: "daily-treats" },
    { label: "Bakery Buckets", id: "ordering" },
    { label: "Catering Packages", id: "catering-packages" },
    { label: "Custom Packages", id: "custom-packages" },
    { label: "Kids Party Packs", id: "kids-party-packs" },
    { label: "Events Booking", id: "events-booking" }
  ];

  const handleScrollToId = (id: string) => {
    setIsMobileFlyoutOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCustomQuantityChange = (id: string, delta: number) => {
    setCustomQuantities(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const handleCustomDietaryToggle = (id: string) => {
    setSelectedDietary(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (customSummary.totalItemsCount === 0) {
      errors.items = "Please select at least 1 treat to build your package!";
    }
    if (!customName.trim()) {
      errors.name = "Your name is required";
    }
    if (!customPhone.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!customEmail.trim() || !customEmail.includes("@")) {
      errors.email = "Please enter a valid email address";
    }
    if (!customDate) {
      errors.date = "Please choose a delivery date";
    }

    if (Object.keys(errors).length > 0) {
      setCustomErrors(errors);
      return;
    }

    setCustomErrors({});

    // Construct the custom item details
    const selectedList = customItemsData
      .filter(item => customQuantities[item.id] > 0)
      .map(item => `${customQuantities[item.id]}x ${item.name}`)
      .join(", ");

    const dietaryLabels = selectedDietary.map(dId => {
      if (dId === "gluten-free") return "Gluten-Free";
      if (dId === "halal") return "Halal";
      if (dId === "vegan") return "Vegan";
      if (dId === "diabetic") return "Low-Sugar";
      return "Nut-Free";
    }).join(", ");

    const finalDescription = `Bespoke Box contains: ${selectedList}. Box Style: ${
      boxType === "travel" ? "Travel-Specialized Box" : "Standard Gift Box"
    }.${dietaryLabels ? " Dietary Accommodations: " + dietaryLabels + "." : ""} Scheduled: ${customDate}. Contact: ${customPhone}.`;

    const customMenuItem: MenuItem = {
      id: `custompack-${Date.now()}`,
      name: "Bespoke Custom Package",
      category: Category.CATERING_BOXES,
      description: finalDescription,
      isBucket: false,
      basePrice: customSummary.total
    };

    onAddToBag(customMenuItem, 1, undefined, customInstructions);
    
    setIsCustomAdded(true);
    setTimeout(() => {
      setIsCustomAdded(false);
      setActiveModal(null);
      // Reset state
      setCustomQuantities({
        scones: 6,
        muffins: 6,
        classicRusks: 0,
        seedRusks: 0,
        cherryBiscuits: 0,
        chocBiscuits: 0,
        macarons: 12
      });
      setSelectedDietary([]);
      setCustomName("");
      setCustomPhone("");
      setCustomEmail("");
      setCustomDate("");
      setCustomInstructions("");
    }, 2000);
  };

  return (
    <section id="packages-hub" className="scroll-mt-24 py-20 bg-stone-50 border-t border-b border-amber-100/60 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Hub Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 border border-[#D4AF37]/50 bg-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#B49225]">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-spin-slow" />
            <span>Premium Event Solutions</span>
          </div>
          <h2 className="serif text-4xl sm:text-5xl font-black text-stone-950 uppercase tracking-tight">
            Packages &amp; Catering Hub
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Whether hosting a corporate summit, celebrating a Lobola, reselling community treats, or throwing a colorful kids party, our premium category packages keep your hosting simple and polished.
          </p>
        </div>

        {/* Desktop Sidebar & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* 1. Sleek Sticky Sidebar Navigation Panel */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28 bg-white border border-[#D4AF37]/30 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase text-[#B49225] tracking-widest border-b border-stone-150 pb-3 mb-4 flex items-center space-x-2">
              <Compass className="h-4 w-4" />
              <span>Gourmet Guide</span>
            </h3>
            <ul className="space-y-2.5 font-sans text-xs">
              {navigationLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleScrollToId(link.id)}
                    className="w-full text-left py-2 px-3.5 rounded-xl font-bold transition-all text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-between group cursor-pointer"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-dashed border-stone-200 text-center text-[10px] text-stone-400 leading-relaxed font-sans">
              📍 Handcrafted in Johannesburg<br />Gauteng School &amp; Home Delivery
            </div>
          </div>

          {/* 2. Main Banners Content Column */}
          <div className="lg:col-span-9 space-y-10">
            
            {/* Banner 1: Bakery Buckets & Provisions (ID: ordering) */}
            <div 
              id="ordering" 
              className="scroll-mt-28 group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch"
            >
              {/* Image Segment */}
              <div className="md:w-5/12 min-h-[220px] relative overflow-hidden bg-stone-100">
                <img 
                  src="./assets/bakery_buckets_hero_1783018519419.jpg" 
                  alt="Bakery Buckets Traditional Delicacies with tea and scones"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                <span className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  Authentic Bakery Buckets
                </span>
              </div>
              
              {/* Text Segment */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="serif text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                    Bakery Buckets &amp; Provisions
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Order our signature buttermilk scone crowns, deluxe chocolate chip muffins, traditional koeksisters, or butter biscuits packed in food-safe airtight bucket containers (2L to 20L). Perfect for morning tea, graduation support, weddings, and lobolas.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-sans">
                    <span>🪣 Airtight Travel Protection</span>
                    <span>•</span>
                    <span>🍪 Bulk Piece Counts (~12 - 110 pcs)</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveModal("buckets")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md group-hover:scale-[1.01] active:scale-95 cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>Explore Bakery Buckets →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Banner 2: Catering Packages (ID: catering-packages, Reversed rhythm) */}
            <div 
              id="catering-packages" 
              className="scroll-mt-28 group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row-reverse items-stretch"
            >
              {/* Image Segment */}
              <div className="md:w-5/12 min-h-[220px] relative overflow-hidden bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800" 
                  alt="Gourmet Catering Platters"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                <span className="absolute top-4 left-4 bg-stone-950/95 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#D4AF37]/30">
                  Corporate &amp; Events
                </span>
              </div>
              
              {/* Text Segment */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="serif text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                    Gourmet Catering Packages
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Savoury mini meatball platter boxes, traditional lamb spitbraais, and high-tea dessert buffets served on royal brass stands. Tailored fully to your guest metrics with dietary safety built-in.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-sans">
                    <span>⚡ Serves 20 - 500+</span>
                    <span>•</span>
                    <span>🎂 Custom Buffet Layouts</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveModal("catering")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md group-hover:scale-[1.01] active:scale-95 cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>Explore Catering Packages →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Banner 3: Custom Packages (ID: custom-packages) */}
            <div 
              id="custom-packages" 
              className="scroll-mt-28 group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch"
            >
              {/* Image Segment */}
              <div className="md:w-5/12 min-h-[220px] relative overflow-hidden bg-stone-100">
                <img 
                  src="https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=800" 
                  alt="Bespoke Bakery Gift Box"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                <span className="absolute top-4 left-4 bg-[#B49225] text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  Bespoke Hampers
                </span>
              </div>
              
              {/* Text Segment */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="serif text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                    Bespoke Custom Packages
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Choose from our legendary high-crown scones, multi-seed crunch rusks, and pastel macarons. Customize double-walled corrugated Travel Boxes to protect your treats over long distance transport.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-sans">
                    <span>📦 Travel-Guaranteed</span>
                    <span>•</span>
                    <span>🍪 Gift Ribbons &amp; Cards</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveModal("custom")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md group-hover:scale-[1.01] active:scale-95 cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>Design Custom Package →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Banner 4: Kids Party Packs (ID: kids-party-packs, Reversed rhythm) */}
            <div 
              id="kids-party-packs" 
              className="scroll-mt-28 group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row-reverse items-stretch"
            >
              {/* Image Segment */}
              <div className="md:w-5/12 min-h-[220px] relative overflow-hidden bg-stone-100">
                <img 
                  src="./assets/kids_party_packs_1783018532665.jpg" 
                  alt="Spiderman party packs and princess cupcake box"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  School Run Runs
                </span>
              </div>
              
              {/* Text Segment */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="serif text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                    Themed Kids Party Packs
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Perfect, individually packed child-friendly boxes containing juice boxes, mini cupcakes, chips, and balloons. Customized with Spider-Man party packs and beautiful princess-themed cupcake boxes, delivered directly to Curro or Nova Pioneer!
                  </p>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-sans">
                    <span>🎈 Dedicated School Run Delivery</span>
                    <span>•</span>
                    <span>🍿 100% Nut-Free Available</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveModal("kids")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md group-hover:scale-[1.01] active:scale-95 cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>Plan Kids Party Pack →</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Banner 5: Events Setup & Booking (ID: events-booking) */}
            <div 
              id="events-booking" 
              className="scroll-mt-28 group relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch"
            >
              {/* Image Segment */}
              <div className="md:w-5/12 min-h-[220px] relative overflow-hidden bg-stone-100">
                <img 
                  src="./assets/decorated_venue_place_1783019276088.jpg" 
                  alt="Decorated Venue Reception Place"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
                <span className="absolute top-4 left-4 bg-purple-700 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  Catering &amp; Decor Layouts
                </span>
              </div>
              
              {/* Text Segment */}
              <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="serif text-2xl sm:text-3xl font-bold text-stone-950 leading-tight">
                    Event Setup &amp; Booking Gallery
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    View setup designs of our beautifully styled corporate high teas, weddings, and traditional family event gatherings across Gauteng. Coordinated with royal service sets, matching linens, and certified safety.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-stone-500 font-bold uppercase tracking-wider font-sans">
                    <span>👑 Premium Styling Sets</span>
                    <span>•</span>
                    <span>📋 Full Coordinator Management</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setActiveModal("events")}
                    className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md group-hover:scale-[1.01] active:scale-95 cursor-pointer inline-flex items-center space-x-2"
                  >
                    <span>View Setup Gallery →</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile/Tablet Horizontal Sliding pill navigation (clutter-free helper) */}
      <div className="lg:hidden mt-10 border-t border-stone-200/50 pt-6 px-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-center block mb-3">
          ⚡ Quick Section Jump
        </span>
        <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-none snap-x">
          {navigationLinks.map((link) => (
            <button
              key={`mob-${link.id}`}
              onClick={() => handleScrollToId(link.id)}
              className="snap-center shrink-0 bg-white border border-stone-200 px-4 py-2 rounded-xl text-[10.5px] font-bold text-stone-750 hover:border-[#D4AF37] active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Navigator Button for Mobile Device Flyout Menu */}
      <div className="lg:hidden fixed bottom-6 left-6 z-[80]">
        <button
          onClick={() => setIsMobileFlyoutOpen(true)}
          className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 p-3.5 rounded-full shadow-2xl border border-[#D4AF37]/50 active:scale-90 transition-all flex items-center space-x-2 cursor-pointer"
          aria-label="Quick Navigator Menu"
        >
          <Compass className="h-5 w-5 text-gold animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest pr-1">Jump</span>
        </button>
      </div>

      {/* Mobile Flyout Modal */}
      {isMobileFlyoutOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fade-in" onClick={() => setIsMobileFlyoutOpen(false)}>
          <div 
            className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-slide-up border-t border-[#D4AF37]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-150 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#B49225] flex items-center space-x-1.5">
                <Compass className="h-4 w-4" />
                <span>Gourmet Menu Navigation</span>
              </span>
              <button 
                onClick={() => setIsMobileFlyoutOpen(false)}
                className="text-stone-400 hover:text-stone-950 transition-colors p-1"
                aria-label="Close Navigator"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="space-y-1 font-sans text-sm">
              {navigationLinks.map((link) => (
                <li key={`fly-${link.id}`}>
                  <button
                    onClick={() => handleScrollToId(link.id)}
                    className="w-full text-left py-3 px-4 rounded-xl font-bold transition-all text-stone-850 hover:text-stone-950 hover:bg-stone-50 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="text-center text-[10px] text-stone-400 pt-3 border-t border-dashed border-stone-200">
              📍 Handcrafted in Midrand &amp; resold Gauteng-wide
            </div>
          </div>
        </div>
      )}


      {/* MODAL 1: Catering Packages Modal */}
      {activeModal === "catering" && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center animate-fade-in" onClick={() => {
          setActiveModal(null);
          if (onCloseCatering) onCloseCatering();
        }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <CateringPackageBuilder 
              isModal={true} 
              onClose={() => {
                setActiveModal(null);
                if (onCloseCatering) onCloseCatering();
              }} 
            />
          </div>
        </div>
      )}


      {/* MODAL 2: Bespoke Custom Package Builder Modal */}
      {activeModal === "custom" && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center overflow-y-auto animate-fade-in" onClick={() => setActiveModal(null)}>
          <div 
            className="bg-[#FAF9F5] rounded-3xl w-full max-w-4xl shadow-2xl relative animate-scale-up my-4 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-850 hover:text-stone-950 rounded-full transition-all z-20 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-4 sm:p-8 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-8 pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B49225] block">Bespoke Customizer</span>
                <h3 className="serif text-3xl font-extrabold text-stone-950 leading-tight">
                  Design Your Bespoke Gift Package
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Mix and match scone crowns, sweet macarons, or dapper buttermilk rusks. Add protective long-distance travel boxes, configure dietary isolations, and add custom card letters!
                </p>
              </div>

              {isCustomAdded ? (
                <div className="py-16 text-center space-y-4 animate-scale-up">
                  <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 text-3xl shadow-sm">
                    ✓
                  </div>
                  <h4 className="font-serif text-xl font-bold text-stone-900">Added to Bag Successfully!</h4>
                  <p className="text-xs text-stone-600 max-w-xs mx-auto">
                    Your customized gift box has been compiled and added as an individual unit in your checkout bag.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Selector list */}
                  <div className="lg:col-span-7 bg-white border border-[#D4AF37]/30 rounded-2xl p-5 sm:p-6 space-y-6">
                    
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#B49225] tracking-widest block mb-4 flex items-center space-x-1.5">
                        <span>1. Select Your Treat Quantities</span>
                      </span>
                      
                      {customErrors.items && (
                        <p className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">
                          ⚠️ {customErrors.items}
                        </p>
                      )}

                      <div className="space-y-4">
                        {customItemsData.map((item) => {
                          const qty = customQuantities[item.id] || 0;
                          return (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50/50 border border-stone-150 rounded-xl hover:border-gold/30 transition-all">
                              <div className="min-w-0 pr-3">
                                <span className="text-base mr-1.5">{item.icon}</span>
                                <span className="font-bold text-xs sm:text-sm text-stone-950 font-sans">{item.name}</span>
                                <span className="text-[10.5px] text-stone-500 font-mono block mt-0.5">R {item.price.toFixed(2)} each</span>
                              </div>
                              
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleCustomQuantityChange(item.id, -1)}
                                  className="w-7 h-7 bg-white hover:bg-stone-950 hover:text-white border border-stone-200 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-mono font-bold text-stone-900">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCustomQuantityChange(item.id, 1)}
                                  className="w-7 h-7 bg-white hover:bg-stone-950 hover:text-white border border-stone-200 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Choose Box style */}
                    <div className="border-t border-stone-100 pt-5">
                      <span className="text-[10px] font-black uppercase text-[#B49225] tracking-widest block mb-3">
                        2. Select Box Protection Style
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBoxType("standard")}
                          className={`flex flex-col text-left p-3.5 border rounded-xl transition-all ${
                            boxType === "standard"
                              ? "bg-stone-950 text-white border-stone-950"
                              : "bg-stone-50/50 border-stone-200 text-stone-900 hover:border-gold/40"
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center space-x-1.5 mb-1">
                            <Gift className="h-3.5 w-3.5" />
                            <span>Standard Gift Box (R50)</span>
                          </span>
                          <span className="text-[10.5px] text-stone-400 leading-normal">
                            Premium cardboard with elegant gold sticker wraps and branded ribbons. Perfect for gifts.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBoxType("travel")}
                          className={`flex flex-col text-left p-3.5 border rounded-xl transition-all ${
                            boxType === "travel"
                              ? "bg-stone-950 text-white border-stone-950"
                              : "bg-stone-50/50 border-stone-200 text-stone-900 hover:border-gold/40"
                          }`}
                        >
                          <span className="text-xs font-bold flex items-center space-x-1.5 mb-1">
                            <Compass className="h-3.5 w-3.5" />
                            <span>Double-Walled Travel Box (R150)</span>
                          </span>
                          <span className="text-[10.5px] text-stone-400 leading-normal">
                            Heavy corrugated double protection. High thermal resistance for Gauteng transport.
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Custom Dietary Isolation */}
                    <div className="border-t border-stone-100 pt-5">
                      <span className="text-[10px] font-black uppercase text-[#B49225] tracking-widest block mb-3">
                        3. Add Dietary Kitchen Isolation
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "gluten-free", label: "Gluten-Free (+R80)", badge: "GF" },
                          { id: "halal", label: "Halal Friendly (+R50)", badge: "Halal" },
                          { id: "vegan", label: "Plant-Based (+R90)", badge: "Vegan" },
                          { id: "diabetic", label: "Low-Sugar (+R70)", badge: "Diabetic" },
                          { id: "nut-free", label: "Nut-Free (+R40)", badge: "Safe" }
                        ].map((diet) => {
                          const isSel = selectedDietary.includes(diet.id);
                          return (
                            <button
                              key={diet.id}
                              type="button"
                              onClick={() => handleCustomDietaryToggle(diet.id)}
                              className={`py-2 px-3 border text-[10.5px] font-bold rounded-xl transition-all text-center flex flex-col justify-center items-center cursor-pointer ${
                                isSel
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                  : "bg-stone-50/50 border-stone-200 text-stone-700 hover:border-gold/30"
                              }`}
                            >
                              <span>{diet.badge}</span>
                              <span className="text-[9px] text-stone-400 mt-0.5 block">{diet.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Contact info & Pricing overview */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Customer Logistics Form inside Custom package modal */}
                    <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4">
                      <span className="text-[10px] font-black uppercase text-[#B49225] tracking-widest block pb-2 border-b border-stone-100">
                        4. Delivery Logistics Specs
                      </span>

                      <div>
                        <label className="text-[9px] uppercase font-black text-stone-600 block mb-1">Your Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Sipho Nkosi"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2 text-stone-950 focus:outline-none focus:border-gold bg-stone-50/50 text-xs ${
                            customErrors.name ? "border-rose-500" : "border-stone-200"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-black text-stone-600 block mb-1">Phone Number *</label>
                          <input
                            type="text"
                            placeholder="e.g. 082 123 4567"
                            value={customPhone}
                            onChange={(e) => setCustomPhone(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-stone-950 focus:outline-none focus:border-gold bg-stone-50/50 text-xs ${
                              customErrors.phone ? "border-rose-500" : "border-stone-200"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-black text-stone-600 block mb-1">Delivery Date *</label>
                          <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-stone-950 focus:outline-none focus:border-gold bg-stone-50/50 text-xs ${
                              customErrors.date ? "border-rose-500" : "border-stone-200"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-black text-stone-600 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          placeholder="e.g. sipho@domain.co.za"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className={`w-full rounded-xl border px-3 py-2 text-stone-950 focus:outline-none focus:border-gold bg-stone-50/50 text-xs ${
                            customErrors.email ? "border-rose-500" : "border-stone-200"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-black text-stone-600 block mb-1">Gift Card Letter / Notes (Optional)</label>
                        <textarea
                          rows={2}
                          placeholder="Add custom greeting or allergy details here..."
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-stone-950 focus:outline-none focus:border-gold bg-stone-50/50 text-xs resize-none"
                        />
                      </div>
                    </div>

                    {/* Live Calculator Quote Summary */}
                    <div className="bg-stone-950 text-white rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl relative border border-[#D4AF37]/40">
                      
                      <div className="border-b border-stone-850 pb-3">
                        <span className="text-[9px] uppercase tracking-widest text-[#B49225] font-black block">Live Calculations</span>
                        <h4 className="font-serif text-lg font-bold text-stone-50">Custom Package Total</h4>
                      </div>

                      <div className="space-y-2 text-[11px] font-sans">
                        <div className="flex justify-between py-1 border-b border-stone-900/60 text-stone-300">
                          <span>Treats Subtotal:</span>
                          <span className="font-semibold text-white font-mono">R {customSummary.itemsSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-900/60 text-stone-300">
                          <span>Box Package Fee:</span>
                          <span className="font-semibold text-white font-mono">R {customSummary.boxCost.toFixed(2)}</span>
                        </div>
                        {customSummary.dietaryCost > 0 && (
                          <div className="flex justify-between py-1 border-b border-stone-900/60 text-emerald-400">
                            <span>Dietary Isolation Fee:</span>
                            <span className="font-semibold font-mono">R {customSummary.dietaryCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="pt-2 flex flex-col items-center justify-center space-y-1 text-center bg-stone-900 p-3 rounded-xl border border-[#D4AF37]/20 mt-3 font-mono">
                          <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold block font-sans">Combined Total Price</span>
                          <span className="serif text-2xl font-black text-[#D4AF37] italic">R {customSummary.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full py-3.5 bg-[#D4AF37] hover:bg-white text-stone-950 font-black uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer text-center inline-flex items-center justify-center space-x-2"
                        >
                          <ShoppingBag className="h-4 w-4 shrink-0" />
                          <span>Add Custom Package to Bag</span>
                        </button>
                      </div>

                      <p className="text-[9px] text-stone-500 text-center leading-relaxed font-sans pt-1">
                        📦 Insulated Travel boxes secure your bake crowns beautifully.<br />Subject to Gauteng couriers or free pickup runs.
                      </p>

                    </div>

                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}


      {/* MODAL 3: Kids Party Packs Planner Modal */}
      {activeModal === "kids" && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center animate-fade-in" onClick={() => {
          setActiveModal(null);
          if (onCloseKidsParty) onCloseKidsParty();
        }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setActiveModal(null);
                if (onCloseKidsParty) onCloseKidsParty();
              }}
              className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-850 hover:text-stone-950 rounded-full transition-all z-[110] cursor-pointer"
              aria-label="Close Kids Party Modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[90vh] overflow-y-auto rounded-3xl">
              <KidsPartyPlanner 
                onAddToBag={onAddToBag}
                onBackToMenu={() => {
                  setActiveModal(null);
                  if (onCloseKidsParty) onCloseKidsParty();
                }}
                onOpenCart={() => {
                  setActiveModal(null);
                  if (onCloseKidsParty) onCloseKidsParty();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Bakery Buckets Modal */}
      {activeModal === "buckets" && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center animate-fade-in" onClick={() => {
          setActiveModal(null);
          if (onCloseBuckets) onCloseBuckets();
        }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <OrderingSystem 
              onAddToBag={onAddToBag}
              siteSettings={siteSettings}
              isModal={true}
              initialItemId={initialBucketItemId}
              initialSize={initialBucketSize}
              onClose={() => {
                setActiveModal(null);
                if (onCloseBuckets) onCloseBuckets();
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL 5: Event Setup & Booking Gallery Modal */}
      {activeModal === "events" && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs p-2 sm:p-4 flex items-center justify-center animate-fade-in" onClick={() => {
          setActiveModal(null);
          if (onCloseEvents) onCloseEvents();
        }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <EventGallery 
              onSelectEventTemplate={(type) => {
                if (onSelectEventTemplate) {
                  onSelectEventTemplate(type);
                }
              }}
              isModal={true}
              onClose={() => {
                setActiveModal(null);
                if (onCloseEvents) onCloseEvents();
              }}
            />
          </div>
        </div>
      )}

    </section>
  );
}
