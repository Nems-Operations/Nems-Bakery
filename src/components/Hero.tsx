/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Truck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroProps {
  onStartOrder: () => void;
  onStartCustomQuote: () => void;
  onStartDailyTreats: () => void;
  onStartPartnership: () => void;
  onStartKidsParty: () => void;
  onSelectProduct?: (itemId: string, size?: string) => void;
}

const HERO_SLIDES = [
  {
    title: "Scone Buckets From",
    priceText: "R 70",
    image: "./images/scones_bucket_new_1780975055905.png",
    alt: "Scones starting from R70",
    itemId: "scones-bucket",
    size: "10L" // Using 10L as requested for "10L scones straight to bucket scones sections"
  },
  {
    title: "Muffins starting from",
    priceText: "R 85",
    image: "./images/muffins_bucket_new_1780975069955.png",
    alt: "Muffins starting from R85",
    itemId: "muffins-bucket",
    size: "5L"
  },
  {
    title: "Premium Rusks starting from",
    priceText: "R 100",
    image: "./images/rusks_bucket_new_1780975098836.png",
    alt: "Premium Rusks starting from R100",
    itemId: "rusks-bucket",
    size: "5L"
  },
  {
    title: "Crunchy Biscuits starting from",
    priceText: "R 165",
    image: "./images/biscuits_bucket_new_1780975085698.png",
    alt: "Crunchy Biscuits starting from R165",
    itemId: "biscuits-bucket",
    size: "5L"
  }
];

export default function Hero({ onStartOrder, onStartCustomQuote, onStartDailyTreats, onStartPartnership, onStartKidsParty, onSelectProduct }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500); // Cycles every 4.5 seconds

    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section id="hero" className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-gold">
      {/* Decorative Golden Orbs in Background */}
      <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute -bottom-10 left-10 h-80 w-80 rounded-full bg-[#ECA1A6]/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 h-56 w-56 rounded-full bg-[#A6E3E9]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-8 z-10 text-ink">
            <div className="inline-flex items-center space-x-2 border border-gold bg-neutral-50/80 px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-[#C5A028]">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Gauteng's Finest Baker &amp; Caterer</span>
            </div>

            <h1 className="serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-none">
              A Tradition of <br />
              Fine Flour <span className="text-gold italic font-normal">&amp;</span> Fire
            </h1>

            <p className="text-sm text-stone-600 sm:text-base leading-relaxed max-w-xl font-normal">
              Welcome to <strong className="font-semibold text-stone-900">Nems Bakery and Catering Co.</strong> We craft magnificent South African pastries, traditional buttermilk scones packed fresh in airtight luxury buckets, and individualized allergen-safe event snack packs to celebrate your special moments.
            </p>

            {/* Quick Badges relating to South African context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gold/30 pt-6">
              <div className="flex items-start space-x-3 bg-neutral-50 border border-gold/40 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-gold text-white">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-ink">Active Nationwide</h4>
                  <p className="text-[11px] text-stone-500">Insulated long distance boxes</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-neutral-50 border border-gold/40 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-gold text-white">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-ink">Allergen Safety</h4>
                  <p className="text-[11px] text-stone-500">Separated preparation tables</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <button
                onClick={onStartOrder}
                className="flex items-center justify-center space-x-2 bg-gold px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition-colors shadow-sm group cursor-pointer"
              >
                <span>Bakery Buckets</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onStartDailyTreats}
                className="flex items-center justify-center space-x-2 bg-stone-950 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-gold transition-colors shadow-sm cursor-pointer"
              >
                <span>Order Daily Treats</span>
              </button>

              <button
                onClick={onStartCustomQuote}
                className="flex items-center justify-center space-x-2 bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-gold border-2 border-gold hover:bg-neutral-50 hover:text-ink transition-colors cursor-pointer"
              >
                <span>Custom Packages</span>
              </button>

              <button
                onClick={onStartPartnership}
                className="flex items-center justify-center space-x-2 bg-amber-50 px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#9C7A1E] border-2 border-[#D4AF37]/40 hover:bg-gold hover:border-gold hover:text-white transition-colors cursor-pointer"
              >
                <span>Partnership</span>
              </button>

              <button
                onClick={onStartKidsParty}
                className="flex items-center justify-center space-x-2 bg-[#D4AF37] px-6 py-4 text-xs font-bold uppercase tracking-widest text-stone-950 hover:bg-[#B49225] hover:text-white transition-colors cursor-pointer shadow-sm"
              >
                <span>Kids Party Packs</span>
              </button>
            </div>
          </div>

          {/* Hero Visuals Right */}
          <div className="relative lg:col-span-5 flex justify-center lg:justify-end min-h-[400px] sm:min-h-[460px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => onSelectProduct?.(slide.itemId, slide.size)}
                className="relative w-full max-w-[450px] aspect-[4/3] sm:aspect-square flex justify-center items-center cursor-pointer group"
                title={`Configure ${slide.title} now`}
              >
                <div className="relative w-full h-full border border-gold bg-white p-2 shadow-lg overflow-hidden transition-all duration-300 group-hover:border-amber-500 group-hover:shadow-2xl">
                  {/* Core generated image */}
                  <img 
                    src={slide.image} 
                    alt={slide.alt} 
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-750 group-hover:scale-[1.03]"
                  />

                  {/* Interactive Pulse / Hover Overlay */}
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-10">
                    <span className="bg-white/95 backdrop-blur-xs text-stone-950 px-4 py-2.5 border-2 border-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl hover:scale-105 transition-transform duration-200">
                      Customize {slide.size || "Scone"} Bucket →
                    </span>
                  </div>

                  {/* Decorative Macarons Overlay tag with matching colors */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 backdrop-blur-xs border border-gold p-3.5 shadow-md z-20">
                    <div className="flex items-center space-x-3">
                      {/* Two small visual circles matching the logo colors directly */}
                      <div className="flex -space-x-2">
                        <span className="h-5 w-5 rounded-full bg-[#ECA1A6] border border-white shadow-xs block" />
                        <span className="h-5 w-5 rounded-full bg-[#A6E3E9] border border-white shadow-xs block" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-gold font-bold block">Artisanal Touch</span>
                        <span className="text-xs font-bold text-stone-950 block">Inspired by our Logo</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gold border-b border-gold pb-0.5">
                      🇿🇦 South Africa
                    </div>
                  </div>
                </div>

                {/* Float Badge */}
                <div className="absolute -top-3 -left-3 bg-black border border-gold text-white p-4 shadow-lg flex flex-col items-center justify-center min-w-[140px] z-30 transition-all duration-300 group-hover:border-amber-400 group-hover:scale-105">
                  <span className="serif text-3xl italic font-normal text-gold block">{slide.priceText}</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-extrabold block text-center mt-1 leading-tight max-w-[120px]">{slide.title}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
