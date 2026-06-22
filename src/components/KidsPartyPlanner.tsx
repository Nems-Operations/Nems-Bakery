import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Cake, 
  Gift, 
  Palette, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus, 
  Info, 
  ShoppingBag, 
  Smile, 
  ArrowLeft,
  ToyBrick,
  GlassWater,
  PartyPopper
} from "lucide-react";
import { MenuItem, Category } from "../types";

interface KidsPartyPlannerProps {
  onAddToBag: (
    item: MenuItem,
    quantity: number,
    selectedSize?: any,
    specialInstructions?: string,
    selectedFlavor?: string
  ) => void;
  onBackToMenu: () => void;
  onOpenCart?: () => void;
}

// Custom BYO inventory items list with pricing (ZAR)
const INVENTORY_ITEMS = [
  { id: "chips", name: "Simba / NikNaks Chips Box", price: 8.5, icon: "🍿" },
  { id: "lollipop", name: "Fizz Pop Lollipop", price: 4.0, icon: "🍭" },
  { id: "candy", name: "Sour Worms & Gummy Packet", price: 7.0, icon: "🍬" },
  { id: "juice", name: "Liqui-Fruit Juice Box (200ml)", price: 12.0, icon: "🧃" },
  { id: "chocolate", name: "Mini Bar-One / Tex Bar", price: 9.0, icon: "🍫" },
  { id: "toy", name: "Party Balloon & Whistle Toy", price: 6.5, icon: "🎈" },
  { id: "biscuit", name: "Mini Choc-Kit Biscuit Packet", price: 8.0, icon: "🍪" }
];

// Predefined packages
const PREDEFINED_PACKS = [
  {
    id: "std-fun",
    name: "Standard Fun Pack",
    price: 49.0,
    badge: "Most Popular",
    description: "Perfect traditional party box filled with absolute favorites.",
    contents: [
      "Simba Fruit Chips Packet",
      "Fizz Pop Lollipop",
      "Gummy Sweet Strip",
      "Liqui-Fruit Juice (200ml)",
      "Small Toy Balloon"
    ]
  },
  {
    id: "prem-delight",
    name: "Premium Delight Pack",
    price: 79.0,
    badge: "Extra Cheerful",
    description: "An deluxe package loaded with gourmet mini bites and premium treats.",
    contents: [
      "Kettle Style Artisanal Potato Chips",
      "Mini Choc-Kit Biscuit Pack",
      "Luxury Hand-made Macaron",
      "Sparkling Apple Juice Grapetiser Box",
      "Premium Character Sticker & Whistle Toy",
      "Mini Cadbury Dairy Milk Bar"
    ]
  }
];

const THEME_OPTIONS = [
  { id: "spiderman", name: "Spider-Man Hero theme", color: "bg-red-600 border-red-700 text-white" },
  { id: "pawpatrol", name: "Paw Patrol Rescue theme", color: "bg-blue-600 border-blue-700 text-white" },
  { id: "barbie", name: "Barbie Glamour theme", color: "bg-pink-500 border-pink-600 text-white" },
  { id: "minions", name: "Minions Sunshine theme", color: "bg-yellow-400 border-yellow-500 text-stone-900" },
  { id: "frozen", name: "Frozen Winter Wonderland theme", color: "bg-cyan-200 border-cyan-300 text-stone-800" },
  { id: "safari", name: "African Safari Jungle theme", color: "bg-emerald-650 border-emerald-700 text-white" }
];

// Aesthetic Pastels for Color Palette Choice
const COLOR_PALETTES = [
  { name: "Bubblegum Pink & White", colors: ["#EC4899", "#FBCFE8", "#FFFFFF"] },
  { name: "Ocean Breeze Blue & Amber", colors: ["#1D4ED8", "#93C5FD", "#FBBF24"] },
  { name: "Safari Olive & Sun Gold", colors: ["#3F6212", "#A3E635", "#FDE047"] },
  { name: "Carnival Rainbow Burst", colors: ["#EF4444", "#3B82F6", "#F59E0B", "#10B981"] }
];

export default function KidsPartyPlanner({ onAddToBag, onBackToMenu, onOpenCart }: KidsPartyPlannerProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Profile Selection (Step 1)
  const [profile, setProfile] = useState<"boy" | "girl" | "unisex" | "skip">("skip");
  
  // Visual Themes & Color Palette (Step 2)
  const [selectedTheme, setSelectedTheme] = useState<string>("none"); // "none" is skip
  const [selectedPalette, setSelectedPalette] = useState<string>("none");
  const [customThemeText, setCustomThemeText] = useState("");

  // Step 3: Selection Strategy (Package vs Custom)
  const [packStrategy, setPackStrategy] = useState<"predefined" | "custom">("predefined");
  const [selectedPredefinedPack, setSelectedPredefinedPack] = useState<string>("std-fun");
  
  // Custom BYO counts per 1 party pack
  const [customItemsConfig, setCustomItemsConfig] = useState<Record<string, number>>(
    INVENTORY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );

  // Number of kids packages required
  const [kidsCount, setKidsCount] = useState<number>(10);

  // Step 4: Cakes & Cupcakes
  const [cupcakeChoice, setCupcakeChoice] = useState<"none" | "mini" | "standard" | "character">("none");
  const [cupcakeDozens, setCupcakeDozens] = useState<number>(1);
  const [addBirthdayCake, setAddBirthdayCake] = useState<boolean>(false);
  const [birthdayCakeTier, setBirthdayCakeTier] = useState<"single" | "character-double">("single");

  // Helper toggle / increment for BYO custom items
  const handleModifyCustomItem = (itemId: string, direction: "inc" | "dec") => {
    setCustomItemsConfig(prev => {
      const current = prev[itemId] || 0;
      let next = direction === "inc" ? current + 1 : current - 1;
      if (next < 0) next = 0;
      return { ...prev, [itemId]: next };
    });
  };

  // Pricing calculations
  const pricePerPack = useMemo(() => {
    if (packStrategy === "predefined") {
      const pack = PREDEFINED_PACKS.find(p => p.id === selectedPredefinedPack);
      return pack ? pack.price : 49.0;
    } else {
      // Custom BYO summation
      return INVENTORY_ITEMS.reduce((acc, item) => {
        const qty = customItemsConfig[item.id] || 0;
        return acc + (item.price * qty);
      }, 0);
    }
  }, [packStrategy, selectedPredefinedPack, customItemsConfig]);

  const cupcakesTotal = useMemo(() => {
    if (cupcakeChoice === "none") return 0;
    let singleDozenPrice = 180; // mini
    if (cupcakeChoice === "standard") singleDozenPrice = 220;
    if (cupcakeChoice === "character") singleDozenPrice = 320;
    return singleDozenPrice * cupcakeDozens;
  }, [cupcakeChoice, cupcakeDozens]);

  const cakeTotal = useMemo(() => {
    if (!addBirthdayCake) return 0;
    return birthdayCakeTier === "single" ? 650 : 1250;
  }, [addBirthdayCake, birthdayCakeTier]);

  const grandTotal = useMemo(() => {
    const packsCost = pricePerPack * kidsCount;
    return packsCost + cupcakesTotal + cakeTotal;
  }, [pricePerPack, kidsCount, cupcakesTotal, cakeTotal]);

  // Validation
  const isStep3Valid = useMemo(() => {
    if (packStrategy === "custom") {
      // Ensure at least one item is loaded
      return Object.keys(customItemsConfig).some(key => {
        const qty = customItemsConfig[key];
        return typeof qty === "number" && qty > 0;
      });
    }
    return true;
  }, [packStrategy, customItemsConfig]);

  // Add the consolidated plan to bag
  const handleAddPlanToBag = () => {
    // Generate description
    const profileLabels: Record<string, string> = {
      boy: "Boy Profile",
      girl: "Girl Profile",
      unisex: "Unisex/Joint Profile",
      skip: "No Specific Profile"
    };

    const chosenThemeObj = THEME_OPTIONS.find(t => t.id === selectedTheme);
    const themeLabel = chosenThemeObj ? chosenThemeObj.name : (customThemeText ? `Custom Theme: ${customThemeText}` : "No Selected Theme");
    const paletteLabel = selectedPalette !== "none" ? `Color palette: ${selectedPalette}` : "No specific palette";

    let packDetails = "";
    if (packStrategy === "predefined") {
      const pack = PREDEFINED_PACKS.find(p => p.id === selectedPredefinedPack);
      packDetails = `${pack?.name} (R ${pricePerPack.toFixed(2)} each)`;
    } else {
      const filled = INVENTORY_ITEMS.filter(it => customItemsConfig[it.id] > 0)
        .map(it => `${customItemsConfig[it.id]}x ${it.name}`)
        .join(", ");
      packDetails = `Custom BYO Pack containing (${filled}) - (R ${pricePerPack.toFixed(2)} each)`;
    }

    let cupcakeDetails = "";
    if (cupcakeChoice !== "none") {
      const cupcakeNames: Record<string, string> = {
        mini: "Mini Buttercream Cupcakes",
        standard: "Standard Fresh Muffins",
        character: "Premium Character Thicker Iced Cupcakes"
      };
      cupcakeDetails = `${cupcakeDozens} Dozen ${cupcakeNames[cupcakeChoice]}`;
    }

    let cakeDetails = "";
    if (addBirthdayCake) {
      cakeDetails = birthdayCakeTier === "single" 
        ? "Matching 1-Tier Themed Centerpiece Cake"
        : "Matching 2-Tier Premium Character Centerpiece Cake";
    }

    // Build overall summary instructions
    const instructions = [
      `GUEST PROFILE: ${profileLabels[profile]}`,
      `VISUAL THEME: ${themeLabel}`,
      `PALETTE: ${paletteLabel}`,
      `PACK TYPE: ${packDetails}`,
      `PACK QUANTITY: ${kidsCount} packs`,
      cupcakeDetails ? `BAKING ADD-ON: ${cupcakeDetails}` : null,
      cakeDetails ? `CENTERPIECE CAKE: ${cakeDetails}` : null
    ].filter(Boolean).join(" | ");

    // Create a special custom MenuItem to inject
    const partyPackMenuItem: MenuItem = {
      id: `partyplan-${Date.now()}`,
      name: `🎨 Custom Kids Party Kit (for ${kidsCount} Kids)`,
      category: Category.CATERING_BOXES,
      description: `Tailored children's birthday setup with custom thematic styling. Includes selected snack packs, optional centerpiece cupcake towers or character cakes.`,
      image: "https://images.unsplash.com/photo-1530101121876-8386b60bb353?auto=format&fit=crop&q=80&w=800", // Colorful gorgeous celebratory image
      isBucket: false,
      basePrice: grandTotal
    };

    // Inject 1 premium bundle item to cart
    onAddToBag(
      partyPackMenuItem,
      1, // 1 bundle plan
      undefined, // no bucket size
      instructions,
      "Kids Party Special Service"
    );

    // Prompt user to inspect summary
    if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 bg-[#FDFAF5]">
      
      {/* Header Back Button & Intro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-amber-100 pb-8 mb-10">
        <div className="space-y-2">
          <button
            onClick={onBackToMenu}
            className="group inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brown-600 hover:text-gold transition-colors mb-2 focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Main Menu</span>
          </button>
          
          <h1 className="serif text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight uppercase">
            🎉 Kids Party Planner Station
          </h1>
          <p className="text-sm text-stone-605 max-w-2xl leading-relaxed">
            Create an unforgettable experience for your little ones! Custom theme matching, gourmet children snack boxes, 
            hand-decorated cupcakes, and magical centerpiece designer birthday cakes baked by Johannesburg's family favorite.
          </p>
        </div>

        {/* Floating Grand Total Card for Desktop */}
        <div className="mt-6 md:mt-0 bg-white border border-amber-100 p-5 rounded-2xl shadow-sm text-center md:text-right shrink-0 min-w-[220px]">
          <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">Estimated Setup Invoice</span>
          <span className="text-3xl font-black font-mono text-stone-950 block mt-1">
            R {grandTotal.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#A6841C] font-semibold mt-1 block">
            Covers {kidsCount} Kids ({packStrategy === "custom" ? "Custom BYO" : "Ready Packs"})
          </span>
        </div>
      </div>

      {/* Grid: Left Wizard, Right Blueprint Receipt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* WIZARD CONTAINER */}
        <div className="lg:col-span-2 space-y-8 bg-white border border-amber-100/60 p-6 sm:p-8 rounded-3xl shadow-sm">
          
          {/* STEPPER LOGO RAIL */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            {[
              { nr: 1, label: "Profile" },
              { nr: 2, label: "Theme" },
              { nr: 3, label: "Packs" },
              { nr: 4, label: "Cakes" }
            ].map((st) => (
              <button
                key={st.nr}
                onClick={() => {
                  // Only allow navigation to Step 3 if Step 3 isn't empty, or to other steps freely
                  if (st.nr === 4 && !isStep3Valid) return;
                  setCurrentStep(st.nr);
                }}
                className="flex items-center space-x-2 group focus:outline-none focus:ring-0 cursor-pointer"
              >
                <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  currentStep === st.nr 
                    ? "bg-stone-950 text-white shadow-md scale-105" 
                    : currentStep > st.nr 
                    ? "bg-emerald-500 text-white" 
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}>
                  {st.nr}
                </span>
                <span className={`hidden md:inline text-xs font-black uppercase tracking-wider ${
                  currentStep === st.nr ? "text-stone-900 border-b-2 border-gold pb-0.5" : "text-stone-400 group-hover:text-stone-600"
                }`}>
                  {st.label}
                </span>
              </button>
            ))}
          </div>

          {/* STEP 1: GUEST PROFILE SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest block">Step 1 of 4</span>
                <h2 className="serif text-xl sm:text-2xl font-black text-stone-950">Who is the celebration for?</h2>
                <p className="text-xs text-stone-550">
                  This helps our decoration designers tailor individual sticker shapes, box ribbons, and card accents.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { id: "boy", label: "Boy's Birthday", sub: "Bold ribbons & graphics", icon: "👦" },
                  { id: "girl", label: "Girl's Birthday", sub: "Bright labels & pastels", icon: "👧" },
                  { id: "unisex", label: "Joint / Unisex", sub: "Cheerful colors for both", icon: "👫" },
                  { id: "skip", label: "Skip Recommendation", sub: "Standard elegant box style", icon: "✨" }
                ].map((pOpt) => (
                  <button
                    key={pOpt.id}
                    onClick={() => {
                      setProfile(pOpt.id as any);
                      // Auto-transition to Step 2 for high productivity UX
                      setTimeout(() => setCurrentStep(2), 200);
                    }}
                    className={`flex flex-col items-center justify-between p-5 text-center rounded-2xl border transition-all duration-200 cursor-pointer ${
                      profile === pOpt.id 
                        ? "bg-amber-50/40 border-gold/70 ring-2 ring-[#D4AF37]/20 shadow-md transform -translate-y-0.5"
                        : "bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/50"
                    }`}
                  >
                    <span className="text-3xl mb-3 block">{pOpt.icon}</span>
                    <div>
                      <strong className="text-xs font-bold text-stone-900 block uppercase tracking-wider">{pOpt.label}</strong>
                      <span className="text-[10px] text-stone-500 mt-1 block leading-tight">{pOpt.sub}</span>
                    </div>
                    {profile === pOpt.id && (
                      <span className="mt-2 text-xs text-[#9C7A1E] font-black flex items-center space-x-0.5 bg-yellow-105 border border-amber-200/50 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Selected</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-1 border border-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#2c220f] hover:bg-stone-950 hover:text-white transition-all duration-200 rounded-lg cursor-pointer"
                >
                  <span>Continue to Theme</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MULTI-LEVEL VISUAL THEMES & DESIGN PALETTE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest block">Step 2 of 4</span>
                <h2 className="serif text-xl sm:text-2xl font-black text-stone-950">Visual Theme &amp; Decor Aesthetics</h2>
                <p className="text-xs text-stone-550">
                  Select a classic children's brand theme or custom color codes to map across scone boxes, labels, stickers, cupcakes and optional tier cakes.
                </p>
              </div>

              {/* Theme Grid */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wide text-stone-450 block">Popular Character and Concept Themes:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setSelectedTheme("none");
                      setSelectedPalette("none");
                    }}
                    className={`p-4 border rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer ${
                      selectedTheme === "none" ? "bg-[#FFFBF2] border-amber-400 ring-2 ring-amber-100" : "bg-white border-stone-200"
                    }`}
                  >
                    🚫 Skip theme (Neutral Pastel Kraft)
                  </button>

                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedTheme(theme.id);
                        setCustomThemeText("");
                      }}
                      className={`p-4 border rounded-xl font-bold text-xs text-left flex flex-col justify-between cursor-pointer transition-all ${
                        selectedTheme === theme.id 
                          ? "bg-amber-50/20 border-amber-400 ring-2 ring-amber-100 shadow-sm" 
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-xs text-stone-950 font-bold block">{theme.name.split(" theme")[0]}</span>
                      <div className="flex items-center space-x-1.5 mt-2">
                        <span className={`h-3 w-6 rounded border ${theme.color}`}></span>
                        <span className="text-[10px] text-stone-500">Decor Matches</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input for Theme */}
              <div className="border-t border-stone-100 pt-4">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  OR: Type Custom Thematic Requirement (e.g. "Space Astronaut", "Princess Castle", "Safari Cheetah"):
                </label>
                <input
                  type="text"
                  placeholder="Enter custom theme name..."
                  value={customThemeText}
                  onChange={(e) => {
                    setCustomThemeText(e.target.value);
                    setSelectedTheme("custom");
                  }}
                  className="w-full text-xs font-serif bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-gold duration-150 text-stone-900"
                />
              </div>

              {/* Color Pastels Picker Block */}
              <div className="border-t border-stone-100 pt-6 space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wide text-stone-450 block">Optionally Select Color Palette:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.name}
                      onClick={() => setSelectedPalette(pal.name)}
                      className={`p-3.5 border rounded-xl flex items-center justify-between text-left cursor-pointer transition-all ${
                        selectedPalette === pal.name 
                          ? "bg-amber-50/20 border-amber-400 ring-2 ring-amber-100" 
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-xs font-semibold text-stone-900">{pal.name}</span>
                      <div className="flex -space-x-1">
                        {pal.colors.map((c, i) => (
                          <span 
                            key={i} 
                            style={{ backgroundColor: c }} 
                            className="h-4.5 w-4.5 rounded-full border border-stone-200 shadow-sm"
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between border-t border-stone-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-1 px-4 py-2 text-xs font-bold uppercase text-stone-500 hover:text-stone-800 focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-1 border border-stone-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#2c220f] hover:bg-stone-950 hover:text-white transition-all duration-200 rounded-lg cursor-pointer"
                >
                  <span>Continue to Packs</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREDEFINED PACKS VS BUILD YOUR OWN */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest block">Step 3 of 4</span>
                <h2 className="serif text-xl sm:text-2xl font-black text-stone-950">Select or Build Kids Snack Boxes</h2>
                <p className="text-xs text-stone-550">
                  Select a ready-made luxury party pack prepared by our kitchen, or select your own items to set up tailored budgets.
                </p>
              </div>

              {/* PACKS STRATEGY SELECTOR */}
              <div className="flex bg-stone-100 p-1 rounded-xl">
                <button
                  onClick={() => setPackStrategy("predefined")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    packStrategy === "predefined" 
                      ? "bg-white text-stone-950 shadow-sm" 
                      : "text-stone-505 hover:text-stone-800"
                  }`}
                >
                  🎒 Ready-Made Premium Packs
                </button>
                <button
                  onClick={() => setPackStrategy("custom")}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    packStrategy === "custom" 
                      ? "bg-white text-stone-950 shadow-sm" 
                      : "text-stone-505 hover:text-stone-800"
                  }`}
                >
                  ⚙️ Custom: Build-Your-Own Pack
                </button>
              </div>

              {/* Option A: PREDEFINED LIST */}
              {packStrategy === "predefined" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PREDEFINED_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPredefinedPack(pack.id)}
                      className={`p-5 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        selectedPredefinedPack === pack.id
                          ? "bg-amber-50/10 border-gold ring-2 ring-gold/20 shadow-md"
                          : "bg-white border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest bg-yellow-101 border border-amber-200 text-[#AC8214] px-2.5 py-0.5 rounded-full">
                            {pack.badge}
                          </span>
                          <span className="text-lg font-black font-mono text-stone-900">R {pack.price.toFixed(2)}</span>
                        </div>

                        <h3 className="serif text-base font-black text-stone-950 mt-3">{pack.name}</h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{pack.description}</p>

                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 block mb-1">Each pack contains:</span>
                          {pack.contents.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-[11px] text-stone-700">
                              <Check className="h-3 w-3 text-emerald-500 shrink-0 stroke-[3.5]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <span className={`w-full py-2 flex items-center justify-center space-x-1 rounded-lg text-xs font-bold uppercase ${
                          selectedPredefinedPack === pack.id 
                            ? "bg-stone-950 text-white" 
                            : "bg-stone-150 text-stone-700 group-hover:bg-stone-250"
                        }`}>
                          {selectedPredefinedPack === pack.id && <Check className="h-3.5 w-3.5" />}
                          <span>{selectedPredefinedPack === pack.id ? "Selected Pack Type" : "Select Package"}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Option B: CUSTOM BUILT CHECKLIST */}
              {packStrategy === "custom" && (
                <div className="space-y-4 border border-amber-100 bg-amber-50/5 p-5 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4.5 w-4.5 text-gold shrink-0" />
                    <p className="text-xs text-[#876F32] font-medium">
                      Design your own children scone boxes! Toggle counts for what will be placed in <strong>EACH</strong> of the boxes. We compile the pricing proportionately.
                    </p>
                  </div>

                  <div className="divide-y divide-stone-100 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    {INVENTORY_ITEMS.map((invItem) => {
                      const count = customItemsConfig[invItem.id] || 0;
                      return (
                        <div key={invItem.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-all">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl h-10 w-10 flex items-center justify-center bg-stone-100 rounded-lg">{invItem.icon}</span>
                            <div>
                              <strong className="text-xs font-black text-stone-900 block">{invItem.name}</strong>
                              <span className="text-[10px] text-[#A28224] font-bold font-mono">R {invItem.price.toFixed(2)} each</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <button
                              onClick={() => handleModifyCustomItem(invItem.id, "dec")}
                              className="h-7 w-7 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-250 flex items-center justify-center focus:outline-none transition-colors cursor-pointer"
                              aria-label={`Reduce count of ${invItem.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-bold font-mono text-sm text-stone-900">{count}</span>
                            <button
                              onClick={() => handleModifyCustomItem(invItem.id, "inc")}
                              className="h-7 w-7 rounded-full bg-stone-900 text-white hover:bg-gold flex items-center justify-center focus:outline-none transition-colors cursor-pointer"
                              aria-label={`Increase count of ${invItem.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#FDFAF5] p-4 rounded-xl border border-amber-200/50 text-right">
                    <span className="text-[11px] text-stone-500 block uppercase font-bold">Sum per one CUSTOM Box</span>
                    <strong className="text-lg font-black font-mono text-stone-950 block mt-0.5">R {pricePerPack.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              {/* REQUIRED NUMBER OF PACKAGES COUNTER */}
              <div className="border-t border-stone-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-stone-955 uppercase tracking-wide">
                      Number of Children Packages (Quantity):
                    </label>
                    <span className="text-[10px] text-stone-500">Minimum 5 packs recommended for custom orders</span>
                  </div>
                  
                  <div className="flex items-center space-x-3.5 select-none bg-stone-200/50 p-1 px-2 rounded-xl">
                    <button
                      onClick={() => setKidsCount(prev => Math.max(5, prev - 5))}
                      className="h-8 w-8 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold font-mono shadow-sm cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => setKidsCount(prev => Math.max(1, prev - 1))}
                      className="h-8 w-8 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold font-mono shadow-sm cursor-pointer"
                    >
                      -1
                    </button>
                    <span className="w-12 text-center text-base font-black font-mono text-stone-900">{kidsCount}</span>
                    <button
                      onClick={() => setKidsCount(prev => prev + 1)}
                      className="h-8 w-8 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold font-mono shadow-sm cursor-pointer"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => setKidsCount(prev => prev + 5)}
                      className="h-8 w-8 rounded-lg bg-white text-stone-800 hover:bg-stone-100 flex items-center justify-center font-bold font-mono shadow-sm cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Subtotal of packages */}
                <div className="text-right text-xs text-stone-500">
                  Total for Pack boxes: <strong className="font-mono text-stone-950 font-bold text-sm">R {(pricePerPack * kidsCount).toFixed(2)}</strong>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between border-t border-stone-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-1 px-4 py-2 text-xs font-bold uppercase text-stone-500 hover:text-stone-800 focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!isStep3Valid}
                  className={`flex items-center space-x-1 border px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-lg cursor-pointer ${
                    isStep3Valid
                      ? "border-stone-900 text-[#2c220f] hover:bg-stone-950 hover:text-white"
                      : "border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed"
                  }`}
                >
                  <span>Continue to Add-ons</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: THE CAKE & CUPCAKE STATION */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold tracking-widest block">Step 4 of 4</span>
                <h2 className="serif text-xl sm:text-2xl font-black text-stone-950">Grand Cakes &amp; Cupcakes Station</h2>
                <p className="text-xs text-stone-550">
                  Level up your children's party setups by adding certified fresh baking additions matching the visual theme.
                </p>
              </div>

              {/* Part A: Cupcakes Choice */}
              <div className="space-y-3 border border-amber-100/70 p-5 rounded-2xl bg-amber-50/5">
                <label className="block text-xs font-black text-stone-900 uppercase tracking-widest flex items-center space-x-1">
                  <span>🧁</span>
                  <span>Match Matching Cupcake Towers / Scones?</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { id: "none", label: "No Cupcakes", badge: "Free", sub: "Skip this add-on option" },
                    { id: "mini", label: "Mini Buttercream", badge: "R 180 / doz", sub: "Delicate frosted mini cupcakes" },
                    { id: "standard", label: "Standard Muffins", badge: "R 220 / doz", sub: "Farmhouse chocolate/custard" },
                    { id: "character", label: "Prem. Character", badge: "R 320 / doz", sub: "Decorated topper character theme" }
                  ].map((cupOpt) => (
                    <button
                      key={cupOpt.id}
                      onClick={() => setCupcakeChoice(cupOpt.id as any)}
                      className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                        cupcakeChoice === cupOpt.id 
                          ? "bg-amber-10/10 border-gold ring-1 ring-gold" 
                          : "bg-white border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-xs font-extrabold text-stone-950 block leading-tight">{cupOpt.label}</strong>
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 block">{cupOpt.badge}</span>
                      <span className="text-[8.5px] text-stone-400 mt-1 block leading-tight">{cupOpt.sub}</span>
                    </button>
                  ))}
                </div>

                {cupcakeChoice !== "none" && (
                  <div className="pt-3 flex items-center justify-between border-t border-amber-100 animate-slide-up">
                    <span className="text-xs font-bold text-stone-704">Specify Cupcake Quantity (Dozens):</span>
                    <div className="flex items-center space-x-3 bg-white p-1 rounded-lg border border-stone-200 select-none">
                      <button
                        onClick={() => setCupcakeDozens(prev => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded bg-stone-100 text-stone-700 flex items-center justify-center font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black font-mono text-stone-900">{cupcakeDozens}</span>
                      <button
                        onClick={() => setCupcakeDozens(prev => prev + 1)}
                        className="h-6 w-6 rounded bg-stone-900 text-white flex items-center justify-center font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Part B: Centerpiece Birthday Cake Choice */}
              <div className="space-y-4 border border-stone-200 p-5 rounded-2xl bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Cake className="h-5 w-5 text-gold shrink-0" />
                    <div>
                      <span className="block text-xs font-black text-stone-901 uppercase tracking-widest">
                        Match Birthday Centerpiece Cake?
                      </span>
                      <span className="text-[10px] text-stone-500 block">Custom-designed cake that anchors the entire dessert table.</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={addBirthdayCake}
                    onChange={(e) => setAddBirthdayCake(e.target.checked)}
                    className="h-5.5 w-5.5 text-gold focus:ring-[#D4AF37] border-stone-300 rounded cursor-pointer accent-[#D4AF37]"
                    id="add-match-cake"
                  />
                </div>

                {addBirthdayCake && (
                  <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
                    {[
                      { id: "single", label: "Deluxe Single-Tier Cake", priceValue: 650, description: "Perfect theme-color icing with character cake boards (serves 12-15)" },
                      { id: "character-double", label: "Premium Double-Tier Cake", priceValue: 1250, description: "Grand 2-tier statement cake topped by 3D characters matching the birthday theme (serves 25-30)" }
                    ].map((cakeOpt) => (
                      <div
                        key={cakeOpt.id}
                        onClick={() => setBirthdayCakeTier(cakeOpt.id as any)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          birthdayCakeTier === cakeOpt.id 
                            ? "bg-amber-50/20 border-gold ring-1 ring-gold" 
                            : "bg-stone-50 border-stone-100 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-xs font-bold text-stone-900">{cakeOpt.label}</strong>
                          <span className="text-xs font-mono font-black text-stone-950">R {cakeOpt.priceValue}</span>
                        </div>
                        <p className="text-[10px] text-stone-600 leading-normal">{cakeOpt.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Back */}
              <div className="pt-4 flex justify-between border-t border-stone-100">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-1 px-4 py-2 text-xs font-bold uppercase text-stone-505 hover:text-stone-800 focus:outline-none cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-[10.5px] font-semibold text-[#876F32] bg-yellow-105 border border-amber-100 px-3 py-1.5 rounded-full hidden sm:inline-block">
                     Complete Blueprint Below ⬇
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RECEIPT / BILLING SUMMARY CARD */}
        <div className="bg-stone-950 text-stone-100 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between border border-[#D4AF37]/25">
          <div className="space-y-5">
            <div className="flex items-center space-x-2 border-b border-[#D4AF37]/20 pb-4">
              <PartyPopper className="h-5 w-5 text-[#D4AF37] stroke-[2.5]" />
              <h3 className="serif text-lg font-black uppercase tracking-wider text-[#D4AF37]">
                Kit Setup Summary
              </h3>
            </div>

            {/* Profile badge detail */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Core Profile:</span>
                <span className="text-[#D4AF37] font-semibold uppercase">
                  {profile === "boy" ? "👦 Boy celebrate" : profile === "girl" ? "👧 Girl celebrate" : profile === "unisex" ? "👫 Unisex" : "🍃 Neutral Pastel"}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Thematic Style:</span>
                <span className="text-stone-100 font-medium">
                  {selectedTheme === "none" ? "Pastel Kraft" : selectedTheme === "custom" ? customThemeText || "Custom Specific" : selectedTheme.toUpperCase()}
                </span>
              </div>

              {selectedPalette !== "none" && (
                <div className="flex justify-between text-[11px] text-stone-400 decoration-amber-100">
                  <span>Palette Selected:</span>
                  <span className="text-stone-100">{selectedPalette}</span>
                </div>
              )}

              <div className="border-t border-stone-800 pt-3 space-y-2">
                <div className="flex justify-between text-[#D4AF37] font-black uppercase tracking-wider text-[10px]">
                  <span>1. Snack Packs:</span>
                  <span>{kidsCount} Boxes</span>
                </div>

                <div className="bg-stone-900 border border-[#D4AF37]/10 p-3 rounded-xl space-y-1 leading-relaxed text-[11px]">
                  <strong className="text-stone-100 block">
                    {packStrategy === "predefined" 
                      ? (selectedPredefinedPack === "std-fun" ? "Standard Fun Pack" : "Premium Delight Pack")
                      : "Custom Build-Your-Own Box"
                    }
                  </strong>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    R {pricePerPack.toFixed(2)} per pack x {kidsCount} children
                  </span>
                  {packStrategy === "custom" && (
                    <div className="text-[10px] text-stone-400 mt-1 list-none pl-1 border-l border-amber-900/30">
                      {INVENTORY_ITEMS.filter(it => customItemsConfig[it.id] > 0).map(it => (
                        <span key={it.id} className="block">• {customItemsConfig[it.id]}x {it.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cupcake Selection rendering */}
              <div className="border-t border-stone-800 pt-3 space-y-2">
                <div className="flex justify-between text-[#D4AF37] font-black uppercase tracking-wider text-[10px]">
                  <span>2. Cupcakes / Scones:</span>
                  <span>{cupcakeChoice === "none" ? "None" : `${cupcakeDozens} Dozen`}</span>
                </div>

                {cupcakeChoice !== "none" && (
                  <div className="bg-stone-900 border border-[#D4AF37]/10 p-3 rounded-xl leading-relaxed text-[11px]">
                    <strong className="text-stone-100">
                      {cupcakeChoice === "mini" ? "Mini Buttercream Cupcakes" : cupcakeChoice === "standard" ? "Standard Baked Muffins" : "Premium Character Cupcakes"}
                    </strong>
                    <span className="text-[10px] text-amber-101/60 block font-mono">
                      R {cupcakeChoice === "mini" ? "180" : cupcakeChoice === "standard" ? "220" : "320"} / doz x {cupcakeDozens} Dozen
                    </span>
                  </div>
                )}
              </div>

              {/* Birthday Designer Cake rendering */}
              <div className="border-t border-stone-800 pt-3 space-y-2">
                <div className="flex justify-between text-[#D4AF37] font-black uppercase tracking-wider text-[10px]">
                  <span>3. Centerpiece Cake:</span>
                  <span>{addBirthdayCake ? "Requested" : "No Cake"}</span>
                </div>

                {addBirthdayCake && (
                  <div className="bg-stone-900 border border-[#D4AF37]/10 p-3 rounded-xl leading-relaxed text-[11px]">
                    <strong className="text-stone-100">
                      {birthdayCakeTier === "single" ? "Matching Theme 1-Tier Cake" : "Grand 3D Characters 2-Tier Cake"}
                    </strong>
                    <span className="text-[10px] text-amber-101/64 block font-mono">
                      R {birthdayCakeTier === "single" ? "650.00" : "1250.00"} (Serves 15-30 guests)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#D4AF37]/30">
            <div className="flex items-center justify-between font-mono font-bold text-stone-100">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37]">Total Sum:</span>
              <span className="text-2xl text-stone-50 font-black">R {grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleAddPlanToBag}
              disabled={!isStep3Valid}
              className={`w-full py-4 text-xs font-black uppercase tracking-widest transition-all duration-200 rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 ${
                isStep3Valid
                  ? "bg-[#D4AF37] text-stone-950 hover:bg-white"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              }`}
            >
              <ShoppingBag className="h-4 w-4 stroke-[2.5]" />
              <span>Add Party Plan to Bag</span>
            </button>

            <p className="text-[9px] text-stone-450 text-center leading-normal">
              Securely bundles your theme parameters and inventories into single line items in the global drawer folder. Settle securely via PayFast or Cash on Delivery.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
