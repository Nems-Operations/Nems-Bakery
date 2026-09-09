/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Clock, 
  BadgePercent,
  ChevronRight
} from "lucide-react";

interface PartnershipProps {
  onBackToMenu: () => void;
}

export default function Partnership({ onBackToMenu }: PartnershipProps) {
  const [activeSegment, setActiveSegment] = useState<"reseller" | "corporate">("reseller");

  const whatsappLink = "https://wa.me/27637862408?text=Hi%20Nems%20Bakery,%20I%20want%20to%20apply%20for%20the%20partnership%20program!";

  return (
    <div className="bg-[#FDFAF5] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-stone-500">
          <button 
            onClick={onBackToMenu}
            className="hover:text-gold transition-colors focus:outline-none"
          >
            Home
          </button>
          <ChevronRight className="h-3 w-3 text-stone-400" />
          <span className="text-gold">Partnerships</span>
        </div>

        {/* 1. Page Header */}
        <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-stone-500 tracking-wider">
            <span>NEMS BAKERY &amp; CATERING CO.</span>
            <span>•</span>
            <span className="text-gold font-black uppercase">PARTNERSHIP NETWORK</span>
          </div>
          
          <h1 className="serif text-4xl sm:text-5xl font-black text-stone-950 tracking-tight leading-tight uppercase">
            Partner With <span className="text-gold">Us</span>
          </h1>
          
          <p className="text-lg sm:text-xl font-medium text-stone-800 leading-relaxed">
            Grow your income by bringing the taste of premium baked goods to your community, school, or workplace.
          </p>
          
          <div className="h-0.5 w-24 bg-gold mx-auto my-6" />
          
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            At Nems Bakery, we believe in growing together. Whether you want to buy in bulk to resell or become a designated distributor in your corporate space, we have a partnership track designed for you.
          </p>
        </div>

        {/* 2. Comparison Table/Grid */}
        <div className="mb-20">
          <h2 className="serif text-center text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-8 uppercase">
            Choose Your Partnership <span className="text-gold">Track</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Track 1 Box */}
            <div className="relative flex flex-col justify-between bg-white rounded-2xl border-2 border-amber-100 hover:border-gold/60 transition-all duration-300 p-8 shadow-sm hover:shadow-lg hover:scale-[1.01]">
              <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
                Track 1
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-amber-50 rounded-xl text-gold">
                    <Users className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="serif text-lg sm:text-2xl font-extrabold text-[#D4AF37] uppercase">
                      Independent Reseller
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold tracking-wider uppercase mt-0.5">
                      Buckets Distribution
                    </p>
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Best For</span>
                    <p className="text-sm font-semibold text-stone-800 mt-1">
                      Entrepreneurs, community sellers, and school networkers.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">How it Works</span>
                    <p className="text-sm text-stone-600 mt-1">
                      You buy at a wholesale rate and sell at a retail profit. Easy scaling.
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/40 rounded-xl border border-gold/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#9C7A1E] block mb-1">
                      Minimum Commitment
                    </span>
                    <p className="text-xs font-bold text-stone-800 leading-relaxed">
                      Strictly 2 buckets per week OR 3 buckets every 2 weeks to maintain partner status.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Logistics</span>
                    <p className="text-sm text-stone-600 mt-1">
                      Arranged bulk pickup or delivery at coordinated scheduled intervals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => {
                    setActiveSegment("reseller");
                    const el = document.getElementById("detailed-tracks");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-center bg-stone-900 text-white hover:bg-gold py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors space-x-2"
                >
                  <span>Explore Track Deep Dive</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Track 2 Box */}
            <div className="relative flex flex-col justify-between bg-white rounded-2xl border-2 border-amber-100 hover:border-gold/60 transition-all duration-300 p-8 shadow-sm hover:shadow-lg hover:scale-[1.01]">
              <div className="absolute top-0 right-0 bg-stone-900 text-gold text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
                Track 2
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-stone-50 rounded-xl text-stone-900">
                    <Briefcase className="h-6 w-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="serif text-lg sm:text-2xl font-extrabold text-[#1c1917] uppercase">
                      Corporate Distributor
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase mt-0.5">
                      Office Space Authorized
                    </p>
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Best For</span>
                    <p className="text-sm font-semibold text-stone-800 mt-1">
                      Professionals looking to sell to colleagues in office parks (e.g., Midrand corporate zones).
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">How it Works</span>
                    <p className="text-sm text-stone-600 mt-1">
                      We supply the stock to your office; you earn a commission on sales.
                    </p>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-700 block mb-1">
                      Minimum Commitment
                    </span>
                    <p className="text-xs font-bold text-stone-800 leading-relaxed">
                      Managed stock levels with regular inventory check-ins &amp; counts.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block">Logistics</span>
                    <p className="text-sm text-stone-600 mt-1">
                      Convenient pickup directly from our central work location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => {
                    setActiveSegment("corporate");
                    const el = document.getElementById("detailed-tracks");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-center bg-stone-900 text-white hover:bg-gold py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors space-x-2"
                >
                  <span>Explore Track Deep Dive</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Detailed Track Sections */}
        <div id="detailed-tracks" className="mb-20 bg-white rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-sm scroll-mt-24">
          
          {/* Internal Tab Toggles */}
          <div className="flex justify-center space-x-2 border-b border-stone-100 pb-6 mb-8">
            <button
              onClick={() => setActiveSegment("reseller")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeSegment === "reseller"
                  ? "bg-gold text-white shadow-md shadow-gold/10"
                  : "bg-stone-50 text-stone-600 hover:bg-amber-50/50"
              }`}
            >
              Independent Reseller Dive
            </button>
            <button
              onClick={() => setActiveSegment("corporate")}
              className={`px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
                activeSegment === "corporate"
                  ? "bg-stone-900 text-white shadow-md"
                  : "bg-stone-50 text-stone-600 hover:bg-[#F3EFE9]"
              }`}
            >
              Corporate Office Dive
            </button>
          </div>

          {activeSegment === "reseller" ? (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-2/3 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-amber-50 text-gold px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Empowerment &amp; Profit</span>
                  </div>

                  <h3 className="serif text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase leading-snug">
                    Reseller Program: Baked to Empower
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    Nems Bakery is dedicated to helping independent entrepreneurs thrive. By purchasing our specialized 2L, 5L, 10L, and 20L catering-grade buckets in bulk, you obtain absolute wholesale discount rates. This margins allows you to structure retail portions with robust profits.
                  </p>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                      Major Benefits &amp; Core Focus Highlighting
                    </h4>
                    
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Bulk Shelf-Life Guarantee</strong>
                          <span className="text-[11px] text-stone-600">Our airtight, double-walled container configurations keep baked goods beautifully fresh for up to 7-9 days.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Marketing Materials Provided</strong>
                          <span className="text-[11px] text-stone-600">Access customizable flyer designs, visual assets, and high-quality photography to motivate local clients.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Consistent Baking Purity</strong>
                          <span className="text-[11px] text-stone-600">Receive identical high-crown shapes, golden crusts, and delicate buttermilk profiles in every batch.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Easy Scaling Paths</strong>
                          <span className="text-[11px] text-stone-600">Upgrade your ordering volume seamlessly as your network from schools or home groups increases.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="md:w-1/3 w-full bg-[#FDFAF5] p-6 rounded-2xl border border-amber-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-[#9C7A1E] text-xs font-black uppercase tracking-widest block mb-1">
                      Program Summary
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                      Ideal for turning personal baking connections into an active income generator. No upfront franchise fee.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Wholesale Pricing</span>
                      <span className="font-extrabold text-stone-900">Up to 35% Discount</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Minimum Volume</span>
                      <span className="font-extrabold text-stone-900">2 Buckets / Week</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Package Setup</span>
                      <span className="font-extrabold text-stone-900">Wholesale Containers</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-stone-500 font-medium">Startup Cost</span>
                      <span className="font-extrabold text-[#115E59]">Only Stock Cost</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn text-left">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:w-2/3 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-stone-100 text-stone-905 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Consignment &amp; Convenience</span>
                  </div>

                  <h3 className="serif text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase leading-snug">
                    Corporate Office Distributor: High Value, Zero Stress
                  </h3>

                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                    Provide your workspace with premium handcrafted treats during morning brief meetings, high-pressure tea times, or corporate birthday milestones. Our consignment model means you carry zero financial risk.
                  </p>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                      Core Distributor Program Parameters
                    </h4>
                    
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Zero Upfront Cash Needed</strong>
                          <span className="text-[11px] text-stone-600">Our corporate consignment agreements give you instant inventory stock without paying beforehand.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Consignment Model</strong>
                          <span className="text-[11px] text-stone-600">Only pay for what you actually sell. Unsold stock is regularized during collections, eliminating liability.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">4-to-5-Day Freshness Guarantee</strong>
                          <span className="text-[11px] text-stone-600">We replace any item on the 5th day to ensure your coworkers strictly get pristine premium baking.</span>
                        </div>
                      </li>

                      <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50">
                        <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs text-stone-900 block font-semibold mb-0.5">Central Hub Collections</strong>
                          <span className="text-[11px] text-stone-600">Pick up fresh weekly batches straight from our authorized work location in Midrand area zones.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="md:w-1/3 w-full bg-[#FDFAF5] p-6 rounded-2xl border border-amber-100 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-stone-900 text-xs font-black uppercase tracking-widest block mb-1">
                      Corporate Track Summary
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                      Perfect for office administrators, tea-masters, and networking staff inside major business parks.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Remuneration</span>
                      <span className="font-extrabold text-stone-900">Tiered Commissions</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Stock Control</span>
                      <span className="font-extrabold text-stone-900">Consignment Stock</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-stone-200">
                      <span className="text-stone-500 font-medium">Exchange Window</span>
                      <span className="font-extrabold text-stone-900">4-5 Days Freshness</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-stone-500 font-medium">Risk exposure</span>
                      <span className="font-extrabold text-[#115E59]">Zero Liability</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4. Call to Action Button */}
        <div className="text-center space-y-6 pt-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="serif text-xl sm:text-2xl font-extrabold text-stone-950 uppercase">
              Apply For Partnership <span className="text-gold">Today</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Submit your info instantly over WhatsApp to our distribution managers. We will review your neighborhood or office location and approve status within 24 hours.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-gold text-white hover:bg-stone-950 px-8 py-4 text-xs font-extrabold uppercase tracking-widest transition-all duration-200 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer max-w-xs w-full sm:w-auto"
            >
              <span>[ Apply to Partner Now ]</span>
            </a>

            <button
              onClick={onBackToMenu}
              className="inline-flex items-center justify-center bg-white border border-stone-200 text-stone-700 hover:text-stone-950 px-8 py-4 text-xs font-extrabold uppercase tracking-widest transition-all rounded-xl hover:bg-stone-50 max-w-xs w-full sm:w-auto"
            >
              ← Back To Ordering Menu
            </button>
          </div>

          <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase">
            ESTABLISHED IN JOHANNESBURG • FINE FLOUR &amp; FIRE • RHT HEALTH REGISTERED
          </p>
        </div>

      </div>
    </div>
  );
}
