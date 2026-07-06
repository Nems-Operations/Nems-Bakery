/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { GALLERY_ITEMS } from "../data";
import { Users, Tag, Award, Heart } from "lucide-react";

interface EventGalleryProps {
  onSelectEventTemplate: (type: "platter" | "braai" | "hightea") => void;
  isModal?: boolean;
  onClose?: () => void;
}

export default function EventGallery({ onSelectEventTemplate, isModal = false, onClose }: EventGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filterTags = ["All", "Wedding", "Corporate", "Family Heritage"];

  const filteredItems = activeFilter === "All"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.tag === activeFilter);

  const mapTagToPackageType = (tag: string): "platter" | "braai" | "hightea" => {
    if (tag === "Wedding") return "hightea";
    if (tag === "Corporate") return "platter";
    return "braai"; // Family heritage
  };

  return (
    <section 
      id={isModal ? undefined : "event-gallery"} 
      className={isModal 
        ? "relative bg-white p-4 md:p-8 max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200/80 text-stone-900 shadow-2xl" 
        : "scroll-mt-20 bg-white py-16 sm:py-24"
      }
    >
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 text-stone-850 hover:text-stone-950 rounded-full transition-all z-50 cursor-pointer animate-pulse"
          aria-label="Close"
        >
          <span className="text-sm font-bold font-sans">✕</span>
        </button>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] block">Visual Event Showcase (Gauteng)</span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Event Booking & Setup Gallery
          </h2>
          <p className="text-sm text-stone-600">
            A visual glance at our beautifully styled weddings, corporate high teas, and lobola celebrations across Gauteng. Every package is coordinated with matching gold service sets and white linens to fit your custom branding.
          </p>
        </div>

        {/* Filter Tags */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-12">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border ${
                activeFilter === tag
                  ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-sm scale-102"
                  : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="group rounded-3xl overflow-hidden border border-stone-100 bg-white shadow-sm hover:shadow-xl hover:border-amber-200/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo & Sticker Row */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Visual Label */}
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs rounded-full px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#D4AF37] border border-amber-100 shadow-sm flex items-center space-x-1">
                  <Heart className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" strokeWidth={2.5} />
                  <span>{item.tag}</span>
                </span>
              </div>

              {/* Event Metadata Content */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block">
                    Style: {item.theme}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-950 group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Capacity & Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 font-medium font-mono">
                    <Users className="h-4 w-4 text-[#D4AF37] shrink-0" />
                    <span>{item.capacityRange}</span>
                  </div>

                  <button
                    onClick={() => {
                      const computedType = mapTagToPackageType(item.tag);
                      onSelectEventTemplate(computedType);
                      if (isModal && onClose) {
                        onClose();
                      } else {
                        // Scroll to builder
                        const element = document.getElementById("catering-builder");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }
                    }}
                    className="rounded-full bg-stone-950 hover:bg-[#D4AF37] hover:text-stone-950 text-white py-2 px-4 text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    Select Setup
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Safety Guarantees Footer Row */}
        <div className="mt-16 bg-stone-50 border border-stone-200/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h4 className="font-serif text-sm font-bold text-stone-950">Safety-First Certified Caterers</h4>
            <p className="text-xs text-stone-600">
              In South Africa, health regulations require rigorous testing. Our transport vehicles carry active temperature logs, and all servers are fully certified handlers of clean meals.
            </p>
          </div>
          <div className="flex -space-x-3">
            {/* Visual icons list */}
            <div className="h-10 w-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-sm shadow-[#D4AF37]/5">H</div>
            <div className="h-10 w-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-sm shadow-[#D4AF37]/5">GF</div>
            <div className="h-10 w-10 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-sm shadow-[#D4AF37]/5">V</div>
          </div>
        </div>

      </div>
    </section>
  );
}
