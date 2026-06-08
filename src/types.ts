/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Category {
  BAKERY_BUCKETS = "Bakery Buckets",
  DESSERTS = "Desserts & Pastries",
  CATERING_BOXES = "Catering Boxes"
}

export type BucketSize = "2L" | "5L" | "10L" | "20L";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  image?: string;
  isBucket: boolean;
  basePrice: number; // For single box or standard item
  bucketPrices?: Record<BucketSize, number>; // Mapping size to price
  approxQuantity?: Record<BucketSize, string>; // e.g., "12-15 pieces"
  badge?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedSize?: BucketSize; // For buckets
  selectedFlavor?: string; // Selected Common Flavor for custom items
  quantity: number;
  specialInstructions?: string;
  unitPrice: number;
}

export interface DietaryOption {
  id: string;
  label: string;
  description: string;
  additionalCostPerGuest: number;
}

export interface CustomCateringPackage {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  packageType: "platter" | "braai" | "hightea";
  dietaryRequirements: string[]; // dietary option ids
  boxTypes: {
    travelBoxCount: number;
    snackBoxCount: number;
  };
  specialRequests: string;
  totalEstimatedPrice: number;
}

export interface EventGalleryItem {
  id: string;
  title: string;
  theme: string;
  description: string;
  image: string;
  capacityRange: string;
  tag: string;
}
