/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, Category, DietaryOption, EventGalleryItem } from "./types";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "scones-bucket",
    name: "Traditional Golden Buttermilk Scones",
    category: Category.BAKERY_BUCKETS,
    description: "Famous South African high-tea buttery scones. Soft on the inside, golden on the outside. Served plain - perfect with fresh whipped cream, jam, and grated cheddar cheese.",
    image: "./images/scones_bucket_new_1780975055905.png",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 70,
      "5L": 150,
      "10L": 260,
      "20L": 470
    },
    approxQuantity: {
      "2L": "10 - 15 mini scones",
      "5L": "25 - 30 mini scones",
      "10L": "50 - 60 mini scones",
      "20L": "100 - 120 mini scones"
    },
    badge: "Bestseller"
  },
  {
    id: "muffins-bucket",
    name: "Gourmet Morning Muffins",
    category: Category.BAKERY_BUCKETS,
    description: "A freshly baked premium selection of moist, fluffy gourmet mini muffins, dusted with fine chocolate and real cocoa powder. Pure morning indulgence.",
    image: "./images/muffins_bucket_new_1780975069955.png",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 85,
      "5L": 165,
      "10L": 275,
      "20L": 485
    },
    approxQuantity: {
      "2L": "10 - 15 mini muffins",
      "5L": "25 - 30 mini muffins",
      "10L": "50 - 60 mini muffins",
      "20L": "100 - 110 mini muffins"
    },
    badge: "Fresh Daily"
  },
  {
    id: "biscuits-bucket",
    name: "Traditional South African Butter Biscuits",
    category: Category.BAKERY_BUCKETS,
    description: "Rich melt-in-the-mouth pure butter biscuits. A special bakery assortment combining plain butter crisps, cherry-crowned stars, rich chocolate-dipped shortbreads, festive 100s & 1000s sprinkles, and elegant piped swirls.",
    image: "./images/biscuits_bucket_new_1780975085698.png",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 165,
      "5L": 390,
      "10L": 750,
      "20L": 1390
    },
    approxQuantity: {
      "2L": "approx. 40 - 50 bite-size biscuits",
      "5L": "approx. 100 - 120 bite-size biscuits",
      "10L": "approx. 200 - 240 bite-size biscuits",
      "20L": "approx. 400 - 450 bite-size biscuits"
    },
    badge: "Heritage Recipe"
  },
  {
    id: "rusks-bucket",
    name: "Traditional Handmade Buttermilk Rusks",
    category: Category.BAKERY_BUCKETS,
    description: "Traditional chunky South African double-baked buttermilk rusks. Crafted with premium farm-fresh buttermilk and healthy seeds, perfectly crunchy and ready to dunk in warm coffee or tea.",
    image: "./images/rusks_bucket_new_1780975098836.png",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 100,
      "5L": 250,
      "10L": 450,
      "20L": 800
    },
    approxQuantity: {
      "2L": "approx. 15 - 20 dunking rusks",
      "5L": "approx. 40 - 50 dunking rusks",
      "10L": "approx. 85 - 100 dunking rusks",
      "20L": "approx. 175 - 200 dunking rusks"
    },
    badge: "Dunking Classic"
  },
  {
    id: "gourmet-macarons",
    name: "Nems Signature Pastel Macarons",
    category: Category.DESSERTS,
    description: "Delicate almond macarons filled with Belgian chocolate ganache and strawberry creme. Styled in stunning soft pink and mint-blue with subtle gold leafing.",
    image: "./images/gourmet_macarons.png",
    isBucket: false,
    basePrice: 180, // For 12pcs
    bucketPrices: {
      "2L": 320, // Used here for 24 piece luxury box
      "5L": 650, // Approx 45 pieces
      "10L": 1200, // Approx 90 pieces
      "20L": 2200 // Approx 180 pieces for grand dessert tables
    },
    approxQuantity: {
      "2L": "24 Piece Luxury Gift Box",
      "5L": "45 Pieces Party Tub",
      "10L": "90 Pieces Grand Tub",
      "20L": "180 Pieces Mega Banqueting Tub"
    },
    badge: "Signature Logo Item",
    isComingSoon: true
  },
  {
    id: "koeksisters-deluxe",
    name: "South African Syrupy Koeksisters",
    category: Category.DESSERTS,
    description: "Traditional South African braided pastries, fried to golden perfection and instantly submerged in ice-cold ginger-and-cinnamon spiced syrup. Crispy outside, syrupy explosion inside.",
    image: "./images/koeksisters.png",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 150,
      "5L": 320,
      "10L": 580,
      "20L": 1050
    },
    approxQuantity: {
      "2L": "12 - 15 classic koeksisters",
      "5L": "28 - 32 classic koeksisters",
      "10L": "55 - 60 classic koeksisters",
      "20L": "110 - 120 classic koeksisters"
    }
  },
  {
    id: "travel-box",
    name: "Long Distance Travel Catering Box",
    category: Category.CATERING_BOXES,
    description: "Expertly designed, spill-proof, insulated travel box customized for long-distance transport. Keeps temperature controlled. Filled with: 6 Savory puff tarts, 6 Premium dry wors, 6 South African biltong bites, 6 Mini scones, 6 Assorted muffins, and 6 Cold pressed juice bottles.",
    image: "./images/catering_boxes.png",
    isBucket: false,
    basePrice: 750,
    badge: "Travel Specialized"
  },
  {
    id: "snack-box",
    name: "School Kiddies Party Snack Box",
    category: Category.CATERING_BOXES,
    description: "Cute, individual kid-friendly snack box perfect for classrooms, birthdays, or field trips. Standard with high allergen safety: 1 Fruit juice box, 1 Mini chocolate muffin, 1 Cheese-and-savory pastry pinwheel, 1 Apple slice pack, and a Signature gold cookie.",
    image: "./images/snack_box.png",
    isBucket: false,
    basePrice: 85,
    badge: "Kid Favorite"
  }
];

export const DIETARY_OPTIONS: DietaryOption[] = [
  {
    id: "gluten-free",
    label: "Strictly Gluten-Free (GF)",
    description: "Prepared in specialized isolated kitchen zones with premium gluten-free flour replacements.",
    additionalCostPerGuest: 30
  },
  {
    id: "halal",
    label: "Halal Friendly Kitchen Configuration",
    description: "All meats, gelatins, and flavorings sourced from certified Halal local suppliers. Absolutely alcohol-free preparation.",
    additionalCostPerGuest: 20
  },
  {
    id: "vegan",
    label: "100% Plant-Based (Vegan)",
    description: "Delicious bakery elements built using high-quality local plant milks, flax-seeds, and coconut oil instead of eggs and butter.",
    additionalCostPerGuest: 35
  },
  {
    id: "diabetic",
    label: "Diabetic-Friendly & Low Sugar",
    description: "Utilizes monk fruit or stevia natural substitutes for sweetened elements, keeping blood sugar spikes safe.",
    additionalCostPerGuest: 25
  },
  {
    id: "nut-free",
    label: "Severe Nut-Allergy Kitchen Isolation",
    description: "Complete physical barrier sanitization of prep surfaces to ensure 0% cross-contamination with peanuts or tree nuts.",
    additionalCostPerGuest: 15
  }
];

export const GALLERY_ITEMS: EventGalleryItem[] = [
  {
    id: "event-1",
    title: "Elegant Gold Wedding Banquets",
    theme: "Gold & White Premium Royalty",
    description: "A gorgeous 250-guest ceremony in Johannesburg featuring towering macaroon pyramids, warm gold decor backdrops, and butler-served mini-scone trays for early morning guest arrivals.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    capacityRange: "100 - 450 Guests",
    tag: "Wedding"
  },
  {
    id: "event-2",
    title: "Corporate High Tea Summits",
    theme: "Minimalist Modern Excellence",
    description: "Professional events catering with luxury 10L bucket assortments, customized snack boxes for attendees, and hot-beverage servicing at the Johannesburg convention centers.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
    capacityRange: "50 - 300 Guests",
    tag: "Corporate"
  },
  {
    id: "event-3",
    title: "Vibrant Lobola & Graduation Feasts",
    theme: "Traditional Celebration Styling",
    description: "South African celebratory gatherings utilizing 20L mega-buckets of scones and koeksisters alongside custom-braai platters, transporting food safely using our travel box fleet.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    capacityRange: "30 - 200 Guests",
    tag: "Family Heritage"
  }
];
