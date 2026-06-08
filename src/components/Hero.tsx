/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, Sparkles, MapPin, Truck, Award, ShieldAlert } from "lucide-react";

interface HeroProps {
  onStartOrder: () => void;
  onStartCustomQuote: () => void;
}

export default function Hero({ onStartOrder, onStartCustomQuote }: HeroProps) {
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
              <span>Gauteng's Finest Baker & Caterer</span>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onStartOrder}
                className="flex items-center justify-center space-x-2 bg-gold px-8 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-black transition-colors shadow-sm group"
              >
                <span>Store & Ordering</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onStartCustomQuote}
                className="flex items-center justify-center space-x-2 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-gold border-2 border-gold hover:bg-neutral-50 hover:text-ink transition-colors"
              >
                <span>Customize Packages</span>
              </button>
            </div>
          </div>

          {/* Hero Visuals Right */}
          <div className="relative lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-[4/3] sm:aspect-square border border-gold bg-white p-2 shadow-lg overflow-hidden group">
              
              {/* Core generated image */}
              <img 
                src="./images/bakery_hero.png" 
                alt="Nems catering pastries display" 
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Decorative Macarons Overlay tag with matching colors */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white border border-gold p-3.5 shadow-md">
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
            <div className="absolute -top-3 -left-3 bg-black border border-gold text-white p-4 shadow-lg hidden sm:block">
              <span className="serif text-3xl italic font-normal text-gold block">R 70</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-extrabold block">Scone Buckets From</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
