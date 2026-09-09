import React from "react";

/**
 * Reliable, high-resolution Unsplash image fallbacks for bakery & catering items.
 * All URLs have been verified to return HTTP 200 OK.
 */
export const DEFAULT_BAKERY_IMAGE = 
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80";

export const BAKERY_FALLBACK_IMAGES = {
  default: DEFAULT_BAKERY_IMAGE,
  scones: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80",
  muffins: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
  biscuits: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
  rusks: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80",
  macarons: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80",
  koeksisters: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=800&q=80",
  catering: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
  cupcakes: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
  kids: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
  gift: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
  wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  corporate: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  heritage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  logoFallback: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23ffffff' stroke='%23D4AF37' stroke-width='4'/><text x='50' y='60' font-family='serif' font-size='36' font-weight='bold' fill='%23D4AF37' text-anchor='middle'>N</text></svg>"
};

/**
 * Returns a suitable fallback image URL based on the product name, ID, or description.
 */
export function getBakeryFallback(identifierOrName?: string): string {
  if (!identifierOrName) return DEFAULT_BAKERY_IMAGE;
  const lower = identifierOrName.toLowerCase();
  
  if (lower.includes("scone")) return BAKERY_FALLBACK_IMAGES.scones;
  if (lower.includes("muffin")) return BAKERY_FALLBACK_IMAGES.muffins;
  if (lower.includes("cupcake")) return BAKERY_FALLBACK_IMAGES.cupcakes;
  if (lower.includes("biscuit") || lower.includes("cookie") || lower.includes("shortbread")) return BAKERY_FALLBACK_IMAGES.biscuits;
  if (lower.includes("rusk")) return BAKERY_FALLBACK_IMAGES.rusks;
  if (lower.includes("macaron")) return BAKERY_FALLBACK_IMAGES.macarons;
  if (lower.includes("koeksister") || lower.includes("pastry") || lower.includes("donut")) return BAKERY_FALLBACK_IMAGES.koeksisters;
  if (lower.includes("kid") || lower.includes("party") || lower.includes("snack-box")) return BAKERY_FALLBACK_IMAGES.kids;
  if (lower.includes("hamper") || lower.includes("gift") || lower.includes("travel")) return BAKERY_FALLBACK_IMAGES.gift;
  if (lower.includes("wedding")) return BAKERY_FALLBACK_IMAGES.wedding;
  if (lower.includes("corporate")) return BAKERY_FALLBACK_IMAGES.corporate;
  if (lower.includes("cater") || lower.includes("event") || lower.includes("buffet")) return BAKERY_FALLBACK_IMAGES.catering;
  
  return DEFAULT_BAKERY_IMAGE;
}

/**
 * Global onError handler for HTML <img> tags to safely fallback to an Unsplash bakery image
 * without entering infinite reload loops.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
): void {
  const target = event.currentTarget;
  const fallback = fallbackUrl || DEFAULT_BAKERY_IMAGE;
  if (target.src !== fallback) {
    target.onerror = null; // Prevent infinite recursion if fallback fails
    target.src = fallback;
  }
}

/**
 * Specialized onError handler for logo images
 */
export function handleLogoError(
  event: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const target = event.currentTarget;
  if (target.src !== BAKERY_FALLBACK_IMAGES.logoFallback) {
    target.onerror = null;
    target.src = BAKERY_FALLBACK_IMAGES.logoFallback;
  }
}
