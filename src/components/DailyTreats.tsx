/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { MenuItem, Category } from "../types";
import { Coffee, Sparkles, ShoppingBag, Check, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

interface DailyTreatsProps {
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSize?: any,
    specialInstructions?: string,
    selectedFlavor?: string
  ) => void;
}

// 1. Defining the premium retail/daily small treats
const SMALL_TREATS_ITEMS: MenuItem[] = [
  {
    id: "retail-scone",
    name: "Individual Traditional Buttermilk Scone",
    category: Category.DESSERTS,
    description: "Our signature flaky buttermilk high-crown scone. Served fresh with a companion portion of whipped farm cream and sweet strawberry jam.",
    image: "https://images.unsplash.com/photo-1588058365548-9fee55860389?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 15,
    badge: "Tea Time Favourite"
  },
  {
    id: "retail-rusk-classic",
    name: "Traditional Classic Small Rusk",
    category: Category.BAKERY_BUCKETS,
    description: "Expertly double-baked pure buttermilk rusk. Perfectly block-cut, crunchy, dry, and ready for hot coffee or tea dunking.",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 20,
    badge: "Dunking Essential"
  },
  {
    id: "retail-rusk-seed",
    name: "Gourmet Almond & Triple-Seed Rusk",
    category: Category.BAKERY_BUCKETS,
    description: "Premium wellness rusk baked with real farm butter, thick roasted almonds, pumpkin seeds, sesame, and sunflower seeds.",
    image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 30,
    badge: "Low Sugar"
  },
  {
    id: "retail-biscuit-cherry",
    name: "Piped Butter Biscuit with Cherry",
    category: Category.BAKERY_BUCKETS,
    description: "Traditional melt-in-the-mouth pure butter cookie, piped into a beautiful swirl and finished with a sweet glazed red cherry dome.",
    image: "https://images.unsplash.com/photo-1558961309-dbdf079121ff?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 10,
    badge: "Heritage Swirl",
    isComingSoon: true
  },
  {
    id: "retail-biscuit-chocolate",
    name: "Dipped Belgian Chocolate Butter Biscuit",
    category: Category.BAKERY_BUCKETS,
    description: "Our classic piped shortbread biscuit, generously hand-dipped in rich, melted premium Belgian dark chocolate.",
    image: "https://images.unsplash.com/photo-1590080875134-460b1f55191b?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 12,
    badge: "Choc Indulgence",
    isComingSoon: true
  },
  {
    id: "retail-macaron-single",
    name: "Nems Signature Single Pastel Macaron",
    category: Category.DESSERTS,
    description: "A single piece of our award-winning delicate almond macaron with choice white chocolate and crushed strawberry cream filling.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=800",
    isBucket: false,
    basePrice: 18,
    badge: "Logo Signature",
    isComingSoon: true
  }
];

// Flavor options for retail goods mapping
const RETAIL_FLAVORS_OPTIONS: Record<string, string[]> = {
  "retail-scone": ["Classic Buttermilk", "Sweet Raisin", "Savory Cheese & Chives"],
  "retail-rusk-classic": ["Pure Buttermilk", "Spiced Aniseed", "Wholewheat Crunch"],
  "retail-rusk-seed": ["Almond & Triple-Seed", "Pumpkin Seed Wellness", "Pecan Crunch"],
  "retail-biscuit-cherry": ["Cherry Almond Butter", "Lemon Glazed Cherry", "Vanilla Berry Twist"],
  "retail-biscuit-chocolate": ["Belgian Choc Dipped", "Double Chocolate Mint", "Double Orange Cocoa"],
  "retail-macaron-single": ["Strawberry Cream", "Velvet Vanilla", "Lemon Meringue", "Belgian Dark Coco", "Salted Butter Caramel"]
};

// Premium pricing maps for Muffins & Cupcakes
const MUFFIN_PRICES: Record<number, number> = {
  6: 51.00,
  12: 102.00,
  24: 204.00
};

const CUPCAKE_PRICES: Record<number, number> = {
  6: 36.00,
  12: 72.00,
  24: 144.00
};

// Common flavors lists
const MUFFIN_FLAVORS = [
  "Blueberry Crumble", 
  "Classic Choc-Chip", 
  "Double Chocolate Fudge", 
  "Lemon Poppy Seed", 
  "Harvest Bran & Raisin"
];

const CUPCAKE_FLAVORS = [
  "Vanilla Velvet", 
  "Rich Chocolate Fudge", 
  "Red Velvet Cream Cheese", 
  "Salted Caramel Swirl", 
  "Strawberry Milkshake Icing"
];

export default function DailyTreats({ onAddToBag }: DailyTreatsProps) {
  // Active Tab for Muffins & Cupcakes sliding window
  const [activeTab, setActiveTab] = useState<"muffins" | "cupcakes">("muffins");

  // Selection states for Custom Muffin Pack builder
  const [selectedMuffinPack, setSelectedMuffinPack] = useState<number>(6);
  const [selectedMuffinFlavor, setSelectedMuffinFlavor] = useState<string>("Blueberry Crumble");

  // Selection states for Custom Cupcake Pack builder
  const [selectedCupcakePack, setSelectedCupcakePack] = useState<number>(6);
  const [selectedCupcakeFlavor, setSelectedCupcakeFlavor] = useState<string>("Vanilla Velvet");

  // Array of added customized items
  const [customItems, setCustomItems] = useState<{
    id: string;
    item: MenuItem;
    qty: number;
    flavor: string;
  }[]>([]);

  // Quantities selected per standard retail item
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "retail-scone": 0,
    "retail-rusk-classic": 0,
    "retail-rusk-seed": 0,
    "retail-biscuit-cherry": 0,
    "retail-biscuit-chocolate": 0,
    "retail-macaron-single": 0,
  });

  // Chosen flavors per standard retail item
  const [selectedItemFlavors, setSelectedItemFlavors] = useState<Record<string, string>>({
    "retail-scone": "Classic Buttermilk",
    "retail-rusk-classic": "Pure Buttermilk",
    "retail-rusk-seed": "Almond & Triple-Seed",
    "retail-biscuit-cherry": "Cherry Almond Butter",
    "retail-biscuit-chocolate": "Belgian Choc Dipped",
    "retail-macaron-single": "Strawberry Cream",
  });

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderPlacedFeedback, setOrderPlacedFeedback] = useState(false);
  const [addedFeedbackMessage, setAddedFeedbackMessage] = useState("");

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleFlavorChange = (itemId: string, flavor: string) => {
    setSelectedItemFlavors((prev) => ({
      ...prev,
      [itemId]: flavor
    }));
  };

  // Synchronize hash changes for deep linking directly to item sections and adjusting tab selection
  useEffect(() => {
    const handleScrollAndSync = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const targetId = hash.replace("#", "");

      if (targetId === "daily-muffin") {
        setActiveTab("muffins");
        setTimeout(() => {
          const el = document.getElementById("daily-muffin-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      } else if (targetId === "daily-cupcake") {
        setActiveTab("cupcakes");
        setTimeout(() => {
          const el = document.getElementById("daily-cupcake-section");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      } else {
        const el = document.getElementById(targetId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a temporary subtle flash highlight effect to the target item
            el.classList.add("ring-4", "ring-gold", "ring-offset-2");
            setTimeout(() => {
              el.classList.remove("ring-4", "ring-gold", "ring-offset-2");
            }, 2500);
          }, 300);
        }
      }
    };

    // Run slightly delayed to allow mount animation to complete
    const timer = setTimeout(handleScrollAndSync, 350);
    window.addEventListener("hashchange", handleScrollAndSync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleScrollAndSync);
    };
  }, []);

  // Click handler to register Muffin or Cupcake pack directly into local basket
  const addCustomPack = (type: "muffin" | "cupcake") => {
    if (type === "muffin") {
      const price = MUFFIN_PRICES[selectedMuffinPack];
      const flavor = selectedMuffinFlavor;
      
      const newMuffinPack = {
        id: `custom-muffin-${Date.now()}-${selectedMuffinPack}`,
        item: {
          id: "daily-muffin",
          name: `Craft Muffin Pack (${selectedMuffinPack} Pcs)`,
          category: Category.DESSERTS,
          description: `Daily homemade oven-fresh muffins, hand-mixed using farm ingredients. Pack size: ${selectedMuffinPack}.`,
          image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600",
          isBucket: false,
          basePrice: price,
          badge: "Oven Hot Pack"
        },
        qty: 1,
        flavor: flavor
      };

      setCustomItems((prev) => [...prev, newMuffinPack]);
      setAddedFeedbackMessage(`Added ${selectedMuffinPack} Muffin Pack (${flavor}) for R ${price.toFixed(2)} to basket!`);
    } else {
      const price = CUPCAKE_PRICES[selectedCupcakePack];
      const flavor = selectedCupcakeFlavor;

      const newCupcakePack = {
        id: `custom-cupcake-${Date.now()}-${selectedCupcakePack}`,
        item: {
          id: "daily-cupcake",
          name: `Sweet Cupcake Pack (${selectedCupcakePack} Pcs)`,
          category: Category.DESSERTS,
          description: `Light fluffy sponge cakes decorated with delicious silky whipped frosting swirl. Pack size: ${selectedCupcakePack}.`,
          image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
          isBucket: false,
          basePrice: price,
          badge: "Lux Glazed"
        },
        qty: 1,
        flavor: flavor
      };

      setCustomItems((prev) => [...prev, newCupcakePack]);
      setAddedFeedbackMessage(`Added ${selectedCupcakePack} Cupcake Pack (${flavor}) for R ${price.toFixed(2)} to basket!`);
    }

    setTimeout(() => {
      setAddedFeedbackMessage("");
    }, 4000);
  };

  // Remove a custom pack
  const deleteCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getSelectedItemDetails = () => {
    // 1. Core small retail items
    const items = SMALL_TREATS_ITEMS.map((item) => ({
      id: item.id,
      item,
      qty: quantities[item.id] || 0,
      flavor: selectedItemFlavors[item.id] || "Original",
      isCustomPack: false
    })).filter((x) => x.qty > 0);

    // 2. Custom muffin and cupcake packs
    customItems.forEach((custom) => {
      items.push({
        id: custom.id,
        item: custom.item,
        qty: custom.qty,
        flavor: custom.flavor,
        isCustomPack: true
      });
    });

    return items;
  };

  const selectedItems = getSelectedItemDetails();
  
  // Running total calculation
  const runningTotal = selectedItems.reduce((acc, current) => {
    return acc + current.item.basePrice * current.qty;
  }, 0);

  const handleProceedToOrder = () => {
    if (selectedItems.length === 0) return;

    // Add each selected item in batch to the master bag
    selectedItems.forEach(({ item, qty, flavor }) => {
      onAddToBag(
        item,
        qty,
        undefined,
        specialInstructions ? `Treat Order Notes: ${specialInstructions}` : "Daily Retail Treat Selection",
        flavor
      );
    });

    // Reset all quantities values to 0
    setQuantities({
      "retail-scone": 0,
      "retail-rusk-classic": 0,
      "retail-rusk-seed": 0,
      "retail-biscuit-cherry": 0,
      "retail-biscuit-chocolate": 0,
      "retail-macaron-single": 0,
    });
    setCustomItems([]);
    setSpecialInstructions("");

    setOrderPlacedFeedback(true);
    setTimeout(() => {
      setOrderPlacedFeedback(false);
    }, 4500);

    // Scroll smoothly to cart trigger
    const drawerTrigger = document.getElementById("cart-trigger");
    if (drawerTrigger) {
      drawerTrigger.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="daily-treats" className="scroll-mt-20 bg-stone-50 py-16 sm:py-24 border-b border-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* 1. Interactive Sliding Custom Pack Segment (Muffins vs Cupcakes) */}
        <div className="mb-14 max-w-4xl mx-auto">
          
          {/* Sliding container housing Muffins (Left/0%) and Cupcakes (Right/-50%) */}
          <div className="bg-white border-2 border-gold rounded-2xl overflow-hidden shadow-md">
            <div 
              className="flex w-[200%] transition-transform duration-500 ease-out"
              style={{ transform: activeTab === "muffins" ? "translateX(0%)" : "translateX(-50%)" }}
            >
              
              {/* PAGE A: MUFFINS PACK Customizer */}
              <div id="daily-muffin-section" className="scroll-mt-24 w-1/2 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FDFBF7]">
                <div className="space-y-4">
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-100 border border-gold/40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600"
                      alt="Artisanal Soft Muffins"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#D4AF37] text-white px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-widest rounded-sm">
                      Muffins: R 8.50
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("cupcakes")}
                    className="w-full py-2.5 px-4 bg-stone-100 border border-stone-300 hover:border-gold hover:bg-gold/10 text-stone-700 hover:text-stone-950 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all duration-200"
                  >
                    <span>Choose Cupcakes instead</span>
                    <ArrowRight className="h-3.5 w-3.5 text-gold" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1">Step 1: Choose Muffin Pack Size</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[6, 12, 24].map((size) => (
                        <button
                          key={`muffin-${size}`}
                          type="button"
                          onClick={() => setSelectedMuffinPack(size)}
                          className={`py-3 px-2 border rounded-lg text-center transition-all ${
                            selectedMuffinPack === size
                              ? "bg-stone-950 text-white border-stone-950 font-bold scale-[1.03]"
                              : "bg-white text-stone-700 border-stone-200 hover:border-gold"
                          }`}
                        >
                          <span className="block text-xs font-black">{size} Pack</span>
                          <span className="block font-mono text-[10px] mt-0.5 opacity-80">R {MUFFIN_PRICES[size].toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1.5">Step 2: Choose Muffin Flavor</span>
                    <select
                      value={selectedMuffinFlavor}
                      onChange={(e) => setSelectedMuffinFlavor(e.target.value)}
                      className="w-full text-xs border border-stone-200 rounded-lg px-3 py-3 focus:outline-none focus:border-gold bg-[#FCFAF7] text-stone-900 font-semibold"
                    >
                      {MUFFIN_FLAVORS.map((flavor) => (
                        <option key={flavor} value={flavor}>
                          🧁 {flavor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-stone-100/80 p-4 border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block">Grand Price Summary</span>
                      <strong className="text-xl font-bold font-mono text-stone-950">
                        R {MUFFIN_PRICES[selectedMuffinPack].toFixed(2)}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => addCustomPack("muffin")}
                      className="bg-gold hover:bg-stone-950 text-white font-extrabold text-xs uppercase tracking-widest py-3 px-5 transition-all rounded-lg flex items-center space-x-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add Muffin Pack</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PAGE B: CUPCAKES PACK Customizer */}
              <div id="daily-cupcake-section" className="scroll-mt-24 w-1/2 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FCFAFA]">
                <div className="space-y-4">
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-100 border border-gold/40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1576618144449-cd747ffb7ded?auto=format&fit=crop&q=80&w=600"
                      alt="Artisanal Soft Cupcakes"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#ECA1A6] text-stone-900 px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-widest rounded-sm">
                      Cupcakes: R 6.00
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("muffins")}
                    className="w-full py-2.5 px-4 bg-stone-100 border border-stone-300 hover:border-gold hover:bg-gold/10 text-stone-700 hover:text-stone-950 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all duration-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-gold" />
                    <span>Choose Muffins instead</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1">Step 1: Choose Cupcake Pack Size</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[6, 12, 24].map((size) => (
                        <button
                          key={`cupcake-${size}`}
                          type="button"
                          onClick={() => setSelectedCupcakePack(size)}
                          className={`py-3 px-2 border rounded-lg text-center transition-all ${
                            selectedCupcakePack === size
                              ? "bg-stone-950 text-white border-stone-950 font-bold scale-[1.03]"
                              : "bg-white text-stone-700 border-stone-200 hover:border-gold"
                          }`}
                        >
                          <span className="block text-xs font-black">{size} Pack</span>
                          <span className="block font-mono text-[10px] mt-0.5 opacity-80">R {CUPCAKE_PRICES[size].toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block mb-1.5">Step 2: Choose Cupcake Flavor</span>
                    <select
                      value={selectedCupcakeFlavor}
                      onChange={(e) => setSelectedCupcakeFlavor(e.target.value)}
                      className="w-full text-xs border border-stone-200 rounded-lg px-3 py-3 focus:outline-none focus:border-gold bg-[#FCFAF7] text-stone-900 font-semibold"
                    >
                      {CUPCAKE_FLAVORS.map((flavor) => (
                        <option key={flavor} value={flavor}>
                          🧁 {flavor}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-stone-100/80 p-4 border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block">Grand Price Summary</span>
                      <strong className="text-xl font-bold font-mono text-stone-950">
                        R {CUPCAKE_PRICES[selectedCupcakePack].toFixed(2)}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => addCustomPack("cupcake")}
                      className="bg-[#ECA1A6] hover:bg-stone-950 text-stone-950 hover:text-white font-extrabold text-xs uppercase tracking-widest py-3 px-5 transition-all rounded-lg flex items-center space-x-2 border border-rose-200"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Add Cupcake Pack</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Feedback banner alert for pack builder */}
          {addedFeedbackMessage && (
            <div className="mt-4 bg-emerald-50 border border-emerald-350 p-4 rounded-xl text-xs text-emerald-900 font-semibold stroke-[2.5] flex items-center justify-between animate-fade-in shadow-xs">
              <span className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-600 stroke-[3]" />
                <span>{addedFeedbackMessage}</span>
              </span>
              <span className="text-[9px] uppercase bg-stone-900 text-white rounded px-2.5 py-1">View in Basket right →</span>
            </div>
          )}

        </div>

        {/* 2. Layout Grid with Products & Sticky Order Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Detailed Item Lists Grid (Standard Goods) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {SMALL_TREATS_ITEMS.map((item) => {
              const qtySelected = quantities[item.id] || 0;
              const currentFlavor = selectedItemFlavors[item.id];
              const possibleFlavors = RETAIL_FLAVORS_OPTIONS[item.id] || [];

              return (
                <div 
                  key={item.id} 
                  id={item.id}
                  className="scroll-mt-28 flex flex-col justify-between bg-white border border-gold hover:border-gold/80 transition-all duration-200 overflow-hidden shadow-xs relative rounded-xl"
                >
                  {/* High Quality Image Setup */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 border-b border-gold/40">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                    {item.badge && !item.isComingSoon && (
                      <span className="absolute top-0 left-0 bg-[#D4AF37] text-white px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-widest">
                        {item.badge}
                      </span>
                    )}
                    
                    {/* Visual indicator of what's added */}
                    {qtySelected > 0 && !item.isComingSoon && (
                      <div className="absolute top-2 right-2 bg-black text-white px-2.5 py-1 text-xs font-black tracking-wider shadow-md rounded-xs">
                        Selected: {qtySelected}
                      </div>
                    )}

                    {/* Coming Soon overlay with brand stamp */}
                    {item.isComingSoon && (
                      <div className="absolute inset-0 bg-stone-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 z-10 select-none">
                        <div className="mb-1.5 h-10 w-10 rounded-full border border-gold bg-white p-1 flex items-center justify-center shadow-md animate-pulse">
                          <img src="./images/logo.png" alt="Nems Logo" className="h-[90%] w-[90%] object-contain" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-stone-100 text-stone-950 border border-gold px-2.5 py-1.5 shadow-sm">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="serif text-lg font-bold text-stone-900 leading-tight">
                          {item.name}
                        </h3>
                        {!item.isComingSoon && (
                          <span className="text-base font-bold text-[#D4AF37] shrink-0 ml-2 font-mono">
                            R {item.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {item.isComingSoon ? (
                      <div className="bg-stone-50 p-3.5 border border-dashed border-stone-200 text-center rounded-xl space-y-1.5">
                        <span className="text-[9.5px] font-black text-[#C5A028] block uppercase tracking-wider">Not Available</span>
                        <p className="text-[10px] text-stone-400">Our bakers are currently upgrading our small pastry line. Grab biscuit buckets or daily custom muffin boxes instead!</p>
                      </div>
                    ) : (
                      <>
                        {/* Flavors Select section */}
                        {possibleFlavors.length > 0 && (
                          <div className="space-y-1 bg-stone-50 p-2 border border-stone-150 rounded-lg">
                            <label className="text-[8.5px] uppercase tracking-wider text-stone-500 font-bold block">
                              Select Common Flavor:
                            </label>
                            <select
                              value={currentFlavor}
                              onChange={(e) => handleFlavorChange(item.id, e.target.value)}
                              className="w-full text-[11px] border border-stone-200 bg-white rounded px-2 py-1 focus:outline-none focus:border-gold py-1.5 font-medium text-stone-800"
                            >
                              {possibleFlavors.map((flv) => (
                                <option key={flv} value={flv}>
                                  ✨ {flv}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Quantity Selector Module with +- Buttons */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                            Adjust Quantity:
                          </span>
                          <div className="flex items-center border border-stone-200 bg-neutral-50 rounded-xs overflow-hidden h-9">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors font-extrabold text-sm curser-pointer"
                              aria-label="Decrease"
                            >
                              -
                            </button>
                            <span className="px-3.5 text-xs font-bold text-stone-950 font-mono w-8 text-center">
                              {qtySelected}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors font-extrabold text-sm curser-pointer"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Order Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            
            {/* Feedback alert banner */}
            {orderPlacedFeedback && (
              <div className="mb-4 bg-[#A6E3E9]/80 border border-[#D4AF37] p-4 text-xs text-stone-900 font-medium stroke-[2.5] flex items-start space-x-2.5 shadow-md rounded-xl">
                <Check className="h-4.5 w-4.5 text-gold shrink-0 stroke-[3]" />
                <div>
                  <strong className="font-bold block uppercase tracking-wider">Treats Added to Bag!</strong>
                  Your daily retail collection has been merged into your main order folder. Let's inspect the bag to checkout!
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-gold p-6 shadow-md space-y-6 rounded-2xl">
              <div className="border-b border-gold/30 pb-4">
                <h3 className="serif text-xl font-bold uppercase tracking-tight text-stone-900 flex items-center space-x-2">
                  <Coffee className="h-5 w-5 text-gold stroke-[2]" />
                  <span>Small Order Basket</span>
                </h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                  Individual treats running total
                </p>
              </div>

              {/* Items List inside Summary Card */}
              {selectedItems.length === 0 ? (
                <div className="py-8 text-center text-stone-400 space-y-3">
                  <span className="text-3xl block">🧁</span>
                  <p className="text-xs text-stone-500 font-normal leading-relaxed max-w-xs mx-auto">
                    Your small order basket is empty. Press <strong className="font-bold text-stone-800">+</strong> on any gourmet treat above, or assemble custom muffin/cupcake packs to build your collection!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                  {selectedItems.map((selected) => (
                    <div key={selected.id || selected.item.id} className="flex justify-between items-start text-xs border-b border-stone-100 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="font-black font-mono text-gold">{selected.qty}x</span>
                          <span className="font-semibold text-stone-850 truncate max-w-[170px]">{selected.item.name}</span>
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-50 text-[#C5A028] border border-gold/15 font-bold font-sans">
                          {selected.flavor}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-bold font-mono text-stone-900 text-xs">
                          R {(selected.item.basePrice * selected.qty).toFixed(2)}
                        </span>
                        {selected.isCustomPack && (
                          <button
                            type="button"
                            onClick={() => deleteCustomItem(selected.id)}
                            className="text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove Pack"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special instructions in package wrapper */}
              <div className="space-y-1.5 pt-4 border-t border-stone-100">
                <label className="text-[9px] uppercase tracking-widest text-[#C5A028] font-bold block">
                  Bespoke Notes (e.g. ribbon color, allergen markers)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Separate the biscuits with individual wrappers..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full text-xs border border-stone-200 p-2.5 focus:outline-none focus:border-gold placeholder-stone-400 text-stone-950 bg-neutral-50 resize-none rounded-lg"
                />
              </div>

              {/* Total Summary Block */}
              <div className="pt-4 border-t border-gold/30 bg-stone-50 p-4 border rounded-xl">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                    Est. Subtotal
                  </span>
                  <span className="serif text-2xl font-black text-stone-950 font-mono">
                    R {runningTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[9px] text-[#C5A028] italic font-semibold">
                  *Excludes South African VAT (15%) & courier fees (calculated at Checkout)
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleProceedToOrder}
                className={`w-full py-4 text-xs font-extrabold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2 rounded-xl cursor-pointer ${
                  selectedItems.length > 0
                    ? "bg-gold border-gold text-white hover:bg-stone-950"
                    : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Move Selected to Main Bag</span>
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
