/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-200 border-t border-[#D4AF37]/20 pt-16 pb-8 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Links Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-850">
          
          {/* Logo, branding, brand statement */}
          <div className="md:col-span-4 space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#D4AF37] bg-white">
                <img 
                  src="/images/logo.png" 
                  alt="Nems logo" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="font-serif text-md font-bold text-white">Nems Bakery and Catering Co.</h3>
                <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold">Gold & White Perfection</p>
              </div>
            </div>
            
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              We specialize in premium batches of high-tea buttermilk scones, wedding macarons, customized catering menus, and allergen-safe setups. Serving households and corporate headquarters across Gauteng, South Africa.
            </p>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Contact Channels</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Pretoria Central:</strong> 124 Francis Street, Pretoria<br />
                  <strong>Sandton Kitchen:</strong> 45 Rivonia Road, Johannesburg
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span>+27 (0) 82 456 7890 • +27 (0) 12 345 6789</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-[#D4AF37] shrink-0" />
                <span className="hover:text-amber-300">orders@nemsbakery.co.za</span>
              </li>
            </ul>
          </div>

          {/* Office hours & support Column */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Baking & Kitchen Hours</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start space-x-2.5">
                <Clock className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  <strong>Monday - Friday:</strong> 06:00 AM - 18:00 PM<br />
                  <strong>Saturday:</strong> 05:00 AM - 14:00 PM<br />
                  <strong>Sunday:</strong> 07:00 AM - 12:00 PM (Preheated & Collections Only)
                </span>
              </li>
              <li className="flex items-center space-x-2.5 text-[#A6E3E9] font-medium text-[11px]">
                <ShieldCheck className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span>RHT Certified (South African Dept of Health)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom footer bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-medium">
          <p>© {new Date().getFullYear()} Nems Bakery and Catering Co. (Pty) Ltd. Johannesburg & Pretoria. All rights reserved.</p>
          <p className="flex items-center mt-3 sm:mt-0">
            <span>Lovingly styled in colors of the macaron logo </span>
            <Heart className="h-3.5 w-3.5 text-[#ECA1A6] fill-[#ECA1A6] mx-1" />
            <span>& gold</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
