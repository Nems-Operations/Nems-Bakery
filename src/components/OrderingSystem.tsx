/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Category, MenuItem, BucketSize } from "../types";
import { MENU_ITEMS } from "../data";
import { ShoppingBag, ChevronRight, Info, AlertCircle, Sparkles, Check } from "lucide-react";

interface OrderingSystemProps {
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSize?: BucketSize,
    specialInstructions?: string,
    selectedFlavor?: string
  ) => void;
  siteSettings?: any;
}

const BUCKET_FLAVOR_OPTIONS: Record<string, string[]> = {
  "scones-bucket": ["Classic Buttermilk Only", "Sweet Sultana Infusion", "Savory Cheese & Herbs", "Mixed Assortment (Sweet & Savory)"],
  "muffins-bucket": ["Classic Chocolate Chips", "Harvest Bran & Raisin", "Double Belgian Chocolate", "Lemon Poppy Seed Splash", "Assorted Morning Feast"],
  "biscuits-bucket": ["Signature Premium Mixture (Plain, Cherry, Choc, 100s & 1000s, Piped)", "Traditional Butter Swirl", "Cherry Crowned Mix", "Choc-Dipped & Sprinkles Only"],
  "rusks-bucket": ["Classic Farm Buttermilk", "Roasted Almond & Seed", "Assorted Dip Platter"],
  "gourmet-macarons": ["Traditional Pastel Mix", "Belgian Dark Choc & Strawberry", "Cream Caramel & Pistachio"],
  "koeksisters-deluxe": ["Traditional Spice Syrup", "Golden Ginger & Citrus Syrup"],
  "travel-box": ["Standard Mixed Box (Savory & Sweet)"],
  "snack-box": ["Standard Kid-Safe Sweet Mix"]
};

export default function OrderingSystem({ onAddToBag, siteSettings }: OrderingSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.BAKERY_BUCKETS);
  
  // Track selected configurations per item ID for rendering selectors
  const [sizeSelection, setSizeSelection] = useState<Record<string, BucketSize>>({
    "scones-bucket": "5L",
    "muffins-bucket": "5L",
    "biscuits-bucket": "5L",
    "rusks-bucket": "5L",
    "gourmet-macarons": "5L", // Uses sizes of macarons
    "koeksisters-deluxe": "5L"
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({
    "scones-bucket": 1,
    "muffins-bucket": 1,
    "biscuits-bucket": 1,
    "rusks-bucket": 1,
    "gourmet-macarons": 1,
    "koeksisters-deluxe": 1,
    "travel-box": 1,
    "snack-box": 10 // Minimum 10
  });

  // Track flavor selections per bucket item IDs
  const [flavorSelection, setFlavorSelection] = useState<Record<string, string>>({
    "scones-bucket": "Classic Buttermilk Only",
    "muffins-bucket": "Classic Chocolate Chips",
    "biscuits-bucket": "Signature Premium Mixture (Plain, Cherry, Choc, 100s & 1000s, Piped)",
    "rusks-bucket": "Classic Farm Buttermilk",
    "gourmet-macarons": "Traditional Pastel Mix",
    "koeksisters-deluxe": "Traditional Spice Syrup",
  });

  const [specialNotes, setSpecialNotes] = useState<Record<string, string>>({});
  const [addedItemFeedback, setAddedItemFeedback] = useState<Record<string, boolean>>({});

  // Get filtered items dynamically (restored to original hardcoded values)
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleSizeChange = (itemId: string, size: BucketSize) => {
    setSizeSelection((prev) => ({ ...prev, [itemId]: size }));
  };

  const handleQuantityChange = (itemId: string, value: number, min: number = 1) => {
    if (value < min) return;
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleFlavorChange = (itemId: string, flavor: string) => {
    setFlavorSelection((prev) => ({ ...prev, [itemId]: flavor }));
  };

  const executeAddToBag = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    const size = item.isBucket || item.id === "gourmet-macarons" ? sizeSelection[item.id] : undefined;
    const notes = specialNotes[item.id] || "";
    
    // Resolve hardcoded flavor selections
    const activeFlavors = BUCKET_FLAVOR_OPTIONS[item.id] || [];
    const flavor = activeFlavors.length > 0
      ? (flavorSelection[item.id] && activeFlavors.includes(flavorSelection[item.id]) 
          ? flavorSelection[item.id] 
          : activeFlavors[0])
      : undefined;

    onAddToBag(item, qty, size, notes, flavor);

    // Show temporary "Added!" indicator on the item card
    setAddedItemFeedback((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemFeedback((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);

    // Clear notes text
    setSpecialNotes((prev) => ({ ...prev, [item.id]: "" }));
  };

  return (
    <section id="ordering" className="scroll-mt-20 bg-white py-16 sm:py-24 border-b border-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A028] block">Nems Gourmet Shop</span>
          <h2 className="serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Bakery Buckets <span className="text-gold italic font-normal">&amp;</span> Custom Provisions
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Freshly baked upon confirmation. We pack our premium items in South Africa's staple food-safe airtight bucket containers (ranging from 2L to 20L), keeping your scones, muffins, and desserts wonderfully soft for transport and traditional ceremonies.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-4 mb-12 border-b border-stone-200">
          {Object.values(Category).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-4 text-xs font-extrabold uppercase tracking-[0.2em] transition-all border-b-2 ${
                selectedCategory === cat
                  ? "border-gold text-gold font-bold bg-neutral-50/50"
                  : "border-transparent text-stone-500 hover:text-ink hover:border-stone-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Informative Note for South African Sizing */}
        {selectedCategory === Category.BAKERY_BUCKETS && (
          <div className="mb-12 flex items-start space-x-3 bg-neutral-50 border border-gold p-6 max-w-3xl mx-auto">
            <Info className="h-5 w-5 shrink-0 text-gold mt-1" />
            <div className="text-xs text-stone-800 space-y-2">
              <span className="font-bold block uppercase tracking-wider text-ink text-xs">South African Bakery Bucket Specifications:</span>
              <p className="leading-relaxed text-stone-600">
                Perfect for morning tea, graduation support, weddings and lobolas. Standard volumes translate to piece counts: 
                <strong className="text-stone-950 font-semibold"> 2L</strong> (~12 pcs) • 
                <strong className="text-stone-950 font-semibold"> 5L</strong> (~30 pcs) • 
                <strong className="text-stone-950 font-semibold"> 10L</strong> (~60 pcs) • 
                <strong className="text-stone-950 font-semibold"> 20L</strong> (~110 pcs). All packed air-tight.
              </p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isBucketVariant = item.isBucket || item.id === "gourmet-macarons";
            const currentSize = sizeSelection[item.id] || "5L";
            const price = isBucketVariant && item.bucketPrices 
              ? item.bucketPrices[currentSize] 
              : item.basePrice;
            const quantityText = isBucketVariant && item.approxQuantity 
              ? item.approxQuantity[currentSize] 
              : null;
            
            const isMin10 = item.id === "snack-box";
            const currentQty = quantities[item.id] || (isMin10 ? 10 : 1);
            const isOutOfStock = false;

            return (
              <div 
                key={item.id} 
                className={`group flex flex-col justify-between overflow-hidden bg-white border border-gold shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 relative ${
                  isOutOfStock ? "grayscale-[40%] opacity-80" : ""
                }`}
              >
                {/* Image & Badge Wrapper */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-50 border-b border-gold">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isOutOfStock && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1.5 text-[8.5px] font-black uppercase tracking-[0.1em] border-l border-b border-gold z-20 shadow-sm">
                      OUT OF STOCK
                    </span>
                  )}
                  {item.badge && !item.isComingSoon && (
                    <span className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.2em] border-r border-b border-gold">
                      {item.badge}
                    </span>
                  )}

                  {/* Brand Logo Sticker Overlay (outside the bucket) */}
                  {!item.isComingSoon && (
                    <div className="absolute top-3 right-3 z-10 select-none transition-transform group-hover:scale-110 duration-300">
                      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-gold bg-white p-0.5 shadow-md flex items-center justify-center">
                        <img 
                          src="./images/logo.png" 
                          alt="Nems Authentic Seal" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Coming Soon overlay screen */}
                  {item.isComingSoon && (
                    <div className="absolute inset-0 bg-stone-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-10 coming-soon-banner">
                      <div className="mb-2 h-12 w-12 rounded-full border border-gold bg-white p-1 flex items-center justify-center shadow-lg">
                        <img src="./images/logo.png" alt="Nems Logo" className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-stone-100 text-stone-950 border border-gold px-3 py-1.5 shadow-md">
                        Coming Soon
                      </span>
                      <span className="text-white text-xs mt-2 font-serif italic text-gold/90">
                        Not Available
                      </span>
                    </div>
                  )}

                  {/* Pastel overlay accents based on specific items (macarons) */}
                  {item.id === "gourmet-macarons" && !item.isComingSoon && (
                    <div className="absolute top-3 right-3 flex space-x-1.5 bg-white/90 backdrop-blur-xs p-1 border border-gold">
                      <span className="h-4 w-4 rounded-full bg-[#ECA1A6] border border-white" title="Rose macaron style" />
                      <span className="h-4 w-4 rounded-full bg-[#A6E3E9] border border-white" title="Mint blue macaron style" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="serif text-xl font-bold text-ink group-hover:text-gold transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.isComingSoon ? (
                    <div className="bg-stone-50 p-4 border border-dashed border-stone-200 text-center rounded-xl mt-auto space-y-3">
                      <p className="text-xs text-stone-500 font-medium leading-relaxed">
                        Our premium luxury macarons are currently offline as we upgrade our artisanal baking infrastructure.
                      </p>
                      <button
                        disabled
                        className="w-full bg-stone-200 text-stone-400 py-3 text-xs font-extrabold uppercase tracking-widest cursor-not-allowed border border-stone-300/30 rounded-lg"
                      >
                        Coming Soon
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Normal layout elements wrap */}
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        {/* Size Selectors (for 2L, 5L, 10L, 20L Buckets) */}
                        {isBucketVariant && item.bucketPrices && (
                          <div className="space-y-3 bg-neutral-50 p-4 border border-gold/40">
                            <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-gold block">
                              Select Bucket Volume
                            </span>
                            <div className="grid grid-cols-4 gap-1.5">
                              {(["2L", "5L", "10L", "20L"] as BucketSize[]).map((size) => (
                                <button
                                  key={size}
                                  onClick={() => handleSizeChange(item.id, size)}
                                  className={`py-2 text-xs font-bold transition-all border ${
                                    currentSize === size
                                      ? "bg-black text-white border-black font-black"
                                      : "bg-white text-stone-700 border-stone-200 hover:border-gold"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>

                            {/* Approximate Scone/Cookie count indication */}
                            {quantityText && (
                              <div className="flex items-center space-x-1.5 text-[10px] text-stone-500 font-semibold tracking-wide">
                                <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                                <span>Yields <strong className="text-stone-900">{quantityText}</strong></span>
                              </div>
                            )}
                          </div>
                        )}

                         {/* Flavor selector for goods with different common flavors */}
                         {(() => {
                           const activeBackupList = BUCKET_FLAVOR_OPTIONS[item.id] || [];
                            if (activeBackupList.length <= 1) return null;
                            
                            const flavorSelectedValue = flavorSelection[item.id] && activeBackupList.includes(flavorSelection[item.id])
                              ? flavorSelection[item.id]
                              : activeBackupList[0] || "";

                            return (
                              <div className="space-y-1.5 bg-amber-50/20 p-3.5 border border-gold/30 rounded-lg">
                                <label className="text-[9px] font-extrabold text-stone-900 uppercase tracking-widest block font-sans mb-1.5 font-sans">
                                  Choose Baked Flavor
                                </label>
                                <select
                                  value={flavorSelectedValue}
                                  onChange={(e) => handleFlavorChange(item.id, e.target.value)}
                                  className="w-full text-xs border border-stone-200 rounded px-2.5 py-2.5 bg-white text-stone-950 font-semibold focus:outline-none focus:border-gold cursor-pointer font-sans"
                                >
                                  {activeBackupList.map((flv: string) => (
                                    <option key={flv} value={flv}>
                                      ✨ {flv}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}

                        {/* Special note input */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold text-[#C5A028] uppercase tracking-widest block">
                            Preparation Notes (Allergy / Accommodations)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Bake soft, label gluten-free items..."
                            value={specialNotes[item.id] || ""}
                            onChange={(e) => setSpecialNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            className="w-full text-xs border border-stone-200 px-2.5 py-2.5 focus:outline-none focus:border-gold placeholder-stone-400 text-stone-950 bg-neutral-50"
                          />
                        </div>

                        {/* Quantity & Actions and validation for Minimum orders */}
                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.15em] text-stone-500 block">Total Est.</span>
                            <span className="text-xl font-bold font-serif text-ink italic block">
                              R {price * currentQty}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-stone-200 bg-neutral-50 overflow-hidden h-9">
                              <button
                                onClick={() => handleQuantityChange(item.id, currentQty - 1, isMin10 ? 10 : 1)}
                                className="px-2.5 text-stone-600 hover:bg-stone-100 font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-semibold text-stone-900 font-mono">
                                {currentQty}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, currentQty + 1)}
                                className="px-2.5 text-stone-600 hover:bg-stone-100 font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Submit to Bag Button */}
                            <button
                              disabled={isOutOfStock}
                              onClick={() => executeAddToBag(item)}
                              className={`flex h-9 items-center justify-center px-4 text-xs font-extrabold uppercase tracking-widest transition-all ${
                                isOutOfStock
                                  ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                                  : addedItemFeedback[item.id]
                                  ? "bg-[#A6E3E9] text-stone-950 font-bold"
                                  : "bg-gold text-white hover:bg-black"
                              }`}
                            >
                              {addedItemFeedback[item.id] ? (
                                <span className="flex items-center space-x-1">
                                  <Check className="h-4 w-4 shrink-0 stroke-[3]" />
                                  <span>In Bag</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1">
                                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                                  <span>Add</span>
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Snack-box specific alert for validation */}
                  {isMin10 && (
                    <div className="flex items-start space-x-1.5 text-[9px] text-amber-800 font-semibold bg-amber-50 p-2 border border-amber-200">
                      <AlertCircle className="h-3 w-3 shrink-0 text-amber-600 mt-0.5" />
                      <span>Batch Policy: Minimum order of 10 school bags is required.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
