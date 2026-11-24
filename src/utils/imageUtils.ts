import React from "react";

/**
 * Reliable, high-resolution Unsplash image fallbacks for bakery & catering items.
 * All URLs have been verified to return HTTP 200 OK.
 */
export const DEFAULT_BAKERY_IMAGE = "/images/scones_bucket_new_1780975055905.png";

export const BAKERY_FALLBACK_IMAGES = {
  default: DEFAULT_BAKERY_IMAGE,
  scones: "/images/scones_bucket_new_1780975055905.png",
  muffins: "/images/muffins_bucket_new_1780975069955.png",
  biscuits: "/images/biscuits_bucket_new_1780975085698.png",
  rusks: "/images/rusks_bucket_new_1780975098836.png",
  macarons: "/images/gourmet_macarons.png",
  koeksisters: "/images/koeksisters.png",
  catering: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1200&q=80",
  cupcakes: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1200&q=80",
  kids: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1200&q=80",
  gift: "https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=1200&q=80",
  wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  corporate: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  heritage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
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
 * Global onError handler for HTML <img> tags to safely fallback to a bakery image
 * without entering infinite reload loops.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string
): void {
  const target = event.currentTarget;
  const fallback = fallbackUrl || DEFAULT_BAKERY_IMAGE;
  const resolvedFallback = typeof window !== "undefined"
    ? new URL(fallback, window.location.origin).href
    : fallback;
  if (target.src !== resolvedFallback && target.src !== fallback) {
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
