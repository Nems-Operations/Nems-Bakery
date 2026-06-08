/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MenuItem, Category } from "../types";
import { Coffee, Sparkles, ShoppingBag, Check } from "lucide-react";

interface DailyTreatsProps {
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSize?: undefined,
    specialInstructions?: string
  ) => void;
}

// 1. Defining the premium retail/daily small treats
const SMALL_TREATS_ITEMS: MenuItem[] = [
  {
    id: "retail-scone",
    name: "Individual Traditional Buttermilk Scone",
    category: Category.DESSERTS,
    description: "Our signature flaky buttermilk high-crown scone. Served fresh with a companion portion of whipped whipped farm cream and sweet strawberry jam.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 15,
    badge: "Tea Time Favourite"
  },
  {
    id: "retail-rusk-classic",
    name: "Traditional Classic Small Rusk",
    category: Category.BAKERY_BUCKETS,
    description: "Expertly double-baked pure buttermilk rusk. Perfectly block-cut, crunchy, dry, and ready for hot coffee or tea dunking.",
    image: "https://images.unsplash.com/photo-1558961313-7f8a9e557e4e?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 20,
    badge: "Dunking Essential"
  },
  {
    id: "retail-rusk-seed",
    name: "Gourmet Almond & Triple-Seed Rusk",
    category: Category.BAKERY_BUCKETS,
    description: "Premium wellness rusk baked with real farm butter, thick roasted almonds, pumpkin seeds, sesame, and sunflower seeds.",
    image: "https://images.unsplash.com/photo-1598114858882-34fd0822699e?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 30,
    badge: "Low Sugar"
  },
  {
    id: "retail-biscuit-cherry",
    name: "Piped Butter Biscuit with Cherry",
    category: Category.BAKERY_BUCKETS,
    description: "Traditional melt-in-the-mouth pure butter cookie, piped into a beautiful swirl and finished with a sweet glazed red cherry dome.",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 10,
    badge: "Heritage Swirl"
  },
  {
    id: "retail-biscuit-chocolate",
    name: "Dipped Belgian Chocolate Butter Biscuit",
    category: Category.BAKERY_BUCKETS,
    description: "Our classic piped shortbread biscuit, generously hand-dipped in rich, melted premium Belgian dark chocolate.",
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 12,
    badge: "Choc Indulgence"
  },
  {
    id: "retail-macaron-single",
    name: "Nems Signature Single Pastel Macaron",
    category: Category.DESSERTS,
    description: "A single piece of our award-winning delicate almond macaron with choice white chocolate and crushed strawberry cream filling.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
    isBucket: false,
    basePrice: 18,
    badge: "Logo Signature"
  }
];

export default function DailyTreats({ onAddToBag }: DailyTreatsProps) {
  // Quantities selected per retail item
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "retail-scone": 0,
    "retail-rusk-classic": 0,
    "retail-rusk-seed": 0,
    "retail-biscuit-cherry": 0,
    "retail-biscuit-chocolate": 0,
    "retail-macaron-single": 0,
  });

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderPlacedFeedback, setOrderPlacedFeedback] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const getSelectedItemDetails = () => {
    return SMALL_TREATS_ITEMS.map((item) => ({
      item,
      qty: quantities[item.id] || 0,
    })).filter((x) => x.qty > 0);
  };

  const selectedItems = getSelectedItemDetails();
  const runningTotal = selectedItems.reduce((acc, current) => {
    return acc + current.item.basePrice * current.qty;
  }, 0);

  const handleProceedToOrder = () => {
    if (selectedItems.length === 0) return;

    // Add each selected item in batch to the master bag
    selectedItems.forEach(({ item, qty }) => {
      onAddToBag(
        item,
        qty,
        undefined,
        specialInstructions ? `Small Order Note: ${specialInstructions}` : "Individual Retail Treat"
      );
    });

    // Reset quantities values to 0 and show confirmation
    setQuantities({
      "retail-scone": 0,
      "retail-rusk-classic": 0,
      "retail-rusk-seed": 0,
      "retail-biscuit-cherry": 0,
      "retail-biscuit-chocolate": 0,
      "retail-macaron-single": 0,
    });
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
        
        {/* Header Block and Brand Promise */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 border border-gold bg-amber-50/50 px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#C5A028]">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Individual Slices & Coffee Mates</span>
          </div>
          <h2 className="serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Order Daily Treats <span className="text-gold italic font-normal">&amp;</span> Retail Bites
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Not catering a massive lobola or graduation yet? Enjoy Nems in single-serving sizes. Pick your individual scones, buttermilk rusks, or hand-decorated butter biscuits packed cleanly for your daily tea time.
          </p>
        </div>

        {/* Layout Grid with Products & Sticky Order Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Item Lists Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {SMALL_TREATS_ITEMS.map((item) => {
              const qtySelected = quantities[item.id] || 0;
              return (
                <div 
                  key={item.id} 
                  className="flex flex-col justify-between bg-white border border-gold hover:border-gold/80 transition-all duration-200 overflow-hidden shadow-xs relative"
                >
                  {/* High Quality Image Setup */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 border-b border-gold/40">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                    {item.badge && (
                      <span className="absolute top-0 left-0 bg-[#D4AF37] text-white px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-widest">
                        {item.badge}
                      </span>
                    )}
                    
                    {/* Visual indicator of what's added */}
                    {qtySelected > 0 && (
                      <div className="absolute top-2 right-2 bg-black text-white px-2.5 py-1 text-xs font-black tracking-wider shadow-md rounded-xs">
                        Selected: {qtySelected}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="serif text-lg font-bold text-stone-900">
                          {item.name}
                        </h3>
                        <span className="text-base font-bold text-[#D4AF37] shrink-0 ml-2">
                          R {item.basePrice}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Quantity Selector Module with +- Buttons */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">
                        Adjust Quantity:
                      </span>
                      <div className="flex items-center border border-stone-200 bg-neutral-50 rounded-xs overflow-hidden h-9">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors font-extrabold text-sm"
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
                          className="px-3 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors font-extrabold text-sm"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Order Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            
            {/* Feedback alert banner */}
            {orderPlacedFeedback && (
              <div className="mb-4 bg-[#A6E3E9]/80 border border-[#D4AF37] p-4 text-xs text-stone-900 font-medium stroke-[2.5] flex items-start space-x-2.5 shadow-md">
                <Check className="h-4.5 w-4.5 text-gold shrink-0 stroke-[3]" />
                <div>
                  <strong className="font-bold block uppercase tracking-wider">Treats Added to Bag!</strong>
                  Your daily retail collection has been merged into your main order folder. Let's inspect the bag to checkout!
                </div>
              </div>
            )}

            <div className="bg-white border-2 border-gold p-6 shadow-md space-y-6">
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
                    Your small order basket is empty. Press <strong className="font-bold text-stone-800">+</strong> on any gourmet treat above to build your daily collection!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {selectedItems.map(({ item, qty }) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-stone-850">
                      <div className="flex-1">
                        <span className="font-bold font-mono text-gold mr-2">{qty}x</span>
                        <span className="font-semibold text-stone-850">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-stone-900 shrink-0 ml-4">
                        R {item.basePrice * qty}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Special instructions in package wrapper */}
              <div className="space-y-1.5 pt-4 border-t border-stone-100">
                <label className="text-[9px] uppercase tracking-widest text-[#C5A028] font-bold block">
                  Catering notes (e.g. ribbon color, allergen markers)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Separate the biscuits with individual wrappers..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full text-xs border border-stone-200 p-2.5 focus:outline-none focus:border-gold placeholder-stone-400 text-stone-950 bg-neutral-50 resize-none"
                />
              </div>

              {/* Total Summary Block */}
              <div className="pt-4 border-t border-gold/30 bg-stone-50 p-4 border rounded-xs">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                    Est. Subtotal
                  </span>
                  <span className="serif text-2xl font-black text-stone-950">
                    R {runningTotal}
                  </span>
                </div>
                <p className="text-[9px] text-stone-400 italic font-semibold">
                  *Excludes VAT & checkout delivery fees
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleProceedToOrder}
                className={`w-full py-4 text-xs font-extrabold uppercase tracking-widest border transition-all flex items-center justify-center space-x-2 ${
                  selectedItems.length > 0
                    ? "bg-gold border-gold text-white hover:bg-stone-950"
                    : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Proceed to Order</span>
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
