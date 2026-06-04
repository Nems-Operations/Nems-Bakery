/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingCart, Calendar, Cake, Coffee, HelpCircle, Utensils } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  activeSection,
  setActiveSection
}: NavbarProps) {
  const navLinks = [
    { id: "hero", label: "Home", icon: Cake },
    { id: "ordering", label: "Bakery Buckets & Shop", icon: Coffee },
    { id: "catering-builder", label: "Custom Catering Quote", icon: Utensils },
    { id: "event-gallery", label: "Event Showcase", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo Wrapper */}
        <div 
          onClick={() => setActiveSection("hero")}
          className="flex cursor-pointer items-center space-x-3 group"
        >
          {/* Logo Representation reflecting the shape of the uploaded logo */}
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-white shadow-xs transition-transform group-hover:scale-105">
            {/* Pink and Blue Macarons drawn minimalistically inside a gold ring */}
            <div className="absolute -top-1 left-2 flex space-x-0.5">
              {/* Pink Macaron */}
              <div className="h-4 w-6 rounded-full bg-[#ECA1A6]/90 border border-gold/50 shadow-xs" />
              {/* Mint Blue Macaron */}
              <div className="h-4 w-6 rounded-full bg-[#A6E3E9]/90 border border-gold/50 shadow-xs -ml-2 mt-1" />
            </div>
            
            <span className="mt-4 serif text-[11px] font-bold tracking-tight text-gold">Nems</span>
          </div>
          
          <div>
            <h1 className="serif text-lg sm:text-2xl font-bold tracking-tight text-ink uppercase">
              Nems Bakery <span className="text-gold">&</span> Catering Co.
            </h1>
            <p className="hidden text-[9px] uppercase tracking-[0.2em] text-stone-500 sm:block">
              Est. Pretoria • Fine Flour & Fire
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveSection(link.id);
                  const element = document.getElementById(link.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  isActive
                    ? "text-gold border-b-2 border-gold pb-1"
                    : "text-stone-700 hover:text-gold hover:border-b hover:border-gold/40 pb-1"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions (Cart & Enquiry) */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenCart}
            id="cart-trigger"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xs transition-all hover:border-gold hover:bg-neutral-50 text-ink"
            aria-label="Open Cart"
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveSection("catering-builder");
              const element = document.getElementById("catering-builder");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            id="quote-trigger"
            className="hidden md:inline-flex items-center justify-center bg-gold text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-black border border-gold transition-colors shadow-xs"
          >
            Get Custom Quote
          </button>
        </div>

      </div>
    </header>
  );
}
