/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";

interface DailyTreatsPreviewProps {
  onExplore: (targetId?: string) => void;
}

const PREVIEW_ITEMS = [
  {
    id: "retail-scone",
    name: "Buttermilk Scone",
    price: 15.00,
    description: "Traditional high-crown flaky scone.",
    image: "./images/buttermilk_scones.png",
    badge: "Tea Favorite"
  },
  {
    id: "retail-rusk-classic",
    name: "Classic Butter Rusk",
    price: 20.00,
    description: "Crunchy double-baked buttermilk dunker.",
    image: "./images/rusks_pack.png",
    badge: "Coffee Dunker"
  },
  {
    id: "daily-muffin",
    name: "Gourmet Muffin",
    price: 20.00,
    description: "Freshly baked moist morning INDULGENCE.",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600",
    badge: "Oven Fresh"
  },
  {
    id: "daily-cupcake",
    name: "Silky Iced Cupcake",
    price: 6.00,
    description: "Decorated sponge with rich frosting.",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=600",
    badge: "Lux Frosting", isOutOfStock: true
  },
  {
    id: "retail-biscuit-cherry",
    name: "Cherry Butter Biscuit",
    price: 10.00,
    description: "Traditional butter swirl with cherry dome.",
    image: "./images/biscuits_assorted.png",
    badge: "Heritage Swirl",
    isComingSoon: true
  },
  {
    id: "retail-biscuit-chocolate",
    name: "Chocolate Dipped Biscuit",
    price: 12.00,
    description: "Classic piped shortbread in Belgian dark choc.",
    image: "./images/biscuits_assorted.png",
    badge: "Dark Decadence",
    isComingSoon: true
  },
  {
    id: "retail-macaron-single",
    name: "Pastel Macaron",
    price: 18.00,
    description: "Delicate almond macaron with strawberry cream.",
    image: "./images/gourmet_macarons.png",
    badge: "Award Winner",
    isComingSoon: true
  }
];

// Double the items array to create a seamless infinite loop scrolling effect
const LOOPED_ITEMS = [...PREVIEW_ITEMS, ...PREVIEW_ITEMS, ...PREVIEW_ITEMS];

export default function DailyTreatsPreview({ onExplore }: DailyTreatsPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll loop with ~1 second pause.
  // Pause is 1.2 seconds, plus 0.8 seconds transition.
  useEffect(() => {
    if (isHovered || isInteracting || isDragging) return;

    const interval = setInterval(() => {
      setTransitionEnabled(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2000); // 1.2s pause + 0.8s transition

    return () => clearInterval(interval);
  }, [isHovered, isInteracting, isDragging]);

  // Wrap around seamlessly when hitting clone elements boundary (e.g. at PREVIEW_ITEMS.length)
  useEffect(() => {
    if (currentIndex >= PREVIEW_ITEMS.length) {
      const resetTimeout = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(0);
      }, 700); // Trigger immediately after transition concludes

      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex]);

  const triggerManualPause = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  const handleManualNext = () => {
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleManualPrev = () => {
    setTransitionEnabled(true);
    setCurrentIndex((prev) => (prev === 0 ? PREVIEW_ITEMS.length - 1 : prev - 1));
  };

  const onPrevClick = () => {
    triggerManualPause();
    handleManualPrev();
  };

  const onNextClick = () => {
    triggerManualPause();
    handleManualNext();
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsInteracting(true);
    setIsDragging(true);
    setTransitionEnabled(false); // disable transition while dragging for real-time tracking
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX.current;
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setTransitionEnabled(true);

    const threshold = 60; // minimum swipe threshold in pixels
    if (dragOffset < -threshold) {
      handleManualNext();
    } else if (dragOffset > threshold) {
      handleManualPrev();
    }

    setDragOffset(0);

    // Resume auto-scroll after 3 seconds of perfect inactivity
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="bg-stone-50 py-16 border-b border-amber-100/60 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Core Header Grid */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center space-x-2 border border-[#D4AF37] bg-amber-50/50 px-2.5 py-1 rounded-full text-[9px] uppercase font-bold tracking-widest text-[#C5A028]">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>Small Cravings &amp; Party Packs</span>
            </div>
            <h2 className="serif text-3xl font-extrabold text-stone-900 sm:text-4xl tracking-tight">
              Daily Treats &amp; Small Individual Orders
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Passed by the shop or hosting a small Sunday high-tea? You can buy delicious single scones, triple-seed crunch rusks, individually decorated cupcakes, or custom muffin boxes!
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Manual Controls */}
            <div className="flex items-center space-x-1.5 mr-2">
              <button
                type="button"
                onClick={onPrevClick}
                className="p-2 bg-white hover:bg-stone-950 hover:text-white border border-stone-200 text-stone-700 transition-all rounded-lg cursor-pointer"
                aria-label="Previous Treat"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onNextClick}
                className="p-2 bg-white hover:bg-stone-950 hover:text-white border border-stone-200 text-stone-700 transition-all rounded-lg cursor-pointer"
                aria-label="Next Treat"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => onExplore()}
              className="bg-stone-950 hover:bg-[#D4AF37] text-white hover:text-stone-950 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-200 rounded-xl shadow-xs flex items-center space-x-2 cursor-pointer border border-stone-950 hover:border-gold"
            >
              <span>Explore All Treats</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sliding Viewport Segment */}
        <div 
          className="relative w-full overflow-hidden select-none touch-pan-y active:cursor-grabbing"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            if (isDragging) handleDragEnd();
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Fading Gradients to highlight depth */}
          <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />

          {/* Running list of cards track */}
          <div
            ref={sliderRef}
            className={`flex space-x-5 ${transitionEnabled ? "transition-transform duration-700 ease-in-out" : ""}`}
            style={{
              transform: `translateX(calc(-${currentIndex} * (280px + 20px) + ${dragOffset}px))`,
            }}
          >
            {LOOPED_ITEMS.map((item, i) => (
              <div
                key={`${item.id}-preview-${i}`}
                onClick={() => {
                  if (Math.abs(dragOffset) < 10) {
                    onExplore(item.id);
                  }
                }}
                className="w-[280px] shrink-0 bg-white border border-gold/45 hover:border-[#D4AF37] hover:shadow-lg rounded-2xl cursor-pointer overflow-hidden transform hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="aspect-[1.4] w-full bg-stone-100 overflow-hidden relative border-b border-gold/15">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                  
                  {item.badge && !item.isComingSoon && (
                    <span className="absolute top-2.5 left-2.5 bg-[#D4AF37]/90 backdrop-blur-xs text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm">
                      {item.badge}
                    </span>
                  )}

                  {item.isComingSoon && (
                    <div className="absolute inset-0 bg-stone-900/65 flex items-center justify-center p-2 text-center select-none z-10 coming-soon-banner">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-stone-100 text-stone-950 border border-gold px-2 py-1 shadow-sm rounded-xs">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {item.isOutOfStock && (
                    <div className="absolute inset-0 bg-stone-900/70 flex items-center justify-center p-2 text-center select-none z-10 coming-soon-banner">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-red-600 text-white border border-red-500 px-2 py-1 shadow-sm rounded-xs">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {item.isComingSoon ? (
                    <span className="absolute bottom-2 right-2 bg-stone-800/80 backdrop-blur-xs text-white px-2 py-0.5 text-[8px] font-bold rounded-md uppercase tracking-wide">
                      Muted
                    </span>
                  ) : item.isOutOfStock ? (
                    <span className="absolute bottom-2 right-2 bg-red-600/90 backdrop-blur-xs text-white px-2.5 py-1 text-xs font-bold font-mono rounded-md">
                      Sold Out
                    </span>
                  ) : (
                    <span className="absolute bottom-2 right-2 bg-stone-950/80 backdrop-blur-xs text-white px-2.5 py-1 text-xs font-bold font-mono rounded-md">
                      R {item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Info and Call to Action */}
                <div className="p-4 space-y-2">
                  <h3 className="serif text-sm font-extrabold text-stone-950 group-hover:text-gold transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-stone-500 leading-normal line-clamp-2 h-8">
                    {item.description}
                  </p>
                  
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-bold text-stone-400 group-hover:text-stone-950 transition-colors uppercase tracking-wider">
                    <span>{item.isComingSoon ? "Arriving Soon" : item.isOutOfStock ? "Sold Out" : "Order Daily Fresh"}</span>
                    <span className="flex items-center text-[#C5A028]">
                      <span>{item.isComingSoon ? "Unavailable" : item.isOutOfStock ? "Sold Out" : "Shop Now"}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Tip */}
        <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-6 sm:mt-8">
          💡 Drag or swipe items, click manual arrows or any card to explore.
        </p>

      </div>
    </section>
  );
}
