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
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 170,
      "5L": 350,
      "10L": 620,
      "20L": 1150
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
    name: "Assorted Sweet Morning Muffins",
    category: Category.BAKERY_BUCKETS,
    description: "A freshly baked premium selection of vanilla choc-chip, spiced blueberry, and decadent caramel-infusion mini muffins. Exceptionally moist and fluffy.",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=600",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 190,
      "5L": 380,
      "10L": 680,
      "20L": 1250
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
    description: "Rich melt-in-the-mouth pure butter cookies, beautifully piped and decorated with cherries, chocolate drops, or coconut flakes. Ideal for family gatherings and tea time.",
    image: "https://images.unsplash.com/photo-1558961313-112997a59e41?auto=format&fit=crop&q=80&w=600",
    isBucket: true,
    basePrice: 0,
    bucketPrices: {
      "2L": 220,
      "5L": 440,
      "10L": 800,
      "20L": 1450
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
    id: "gourmet-macarons",
    name: "Nems Signature Pastel Macarons",
    category: Category.DESSERTS,
    description: "Celebrating our brand logo! Delicate almond macarons filled with Belgian chocolate ganache and strawberry creme. Styled in stunning soft pink and mint-blue with subtle gold leafing.",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&q=80&w=600",
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
    badge: "Signature Logo Item"
  },
  {
    id: "koeksisters-deluxe",
    name: "South African Syrupy Koeksisters",
    category: Category.DESSERTS,
    description: "Traditional South African braided pastries, fried to golden perfection and instantly submerged in ice-cold ginger-and-cinnamon spiced syrup. Crispy outside, syrupy explosion inside.",
    image: "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=600",
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
    image: "/src/assets/images/catering_boxes_1780138249601.png",
    isBucket: false,
    basePrice: 750,
    badge: "Travel Specialized"
  },
  {
    id: "snack-box",
    name: "School Kiddies Party Snack Box",
    category: Category.CATERING_BOXES,
    description: "Cute, individual kid-friendly snack box perfect for classrooms, birthdays, or field trips. Standard with high allergen safety: 1 Fruit juice box, 1 Mini chocolate muffin, 1 Cheese-and-savory pastry pinwheel, 1 Apple slice pack, and a Signature gold cookie.",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=600",
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
    description: "A gorgeous 250-guest ceremony in Pretoria featuring towering macaroon pyramids, warm gold decor backdrops, and butler-served mini-scone trays for early morning guest arrivals.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800",
    capacityRange: "30 - 200 Guests",
    tag: "Family Heritage"
  }
];
