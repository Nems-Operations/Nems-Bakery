/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Save, Lock, Plus, Trash2, Check, Sparkles, Tag, Eye, Info } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: any;
  onUpdateSettings: (newSettings: any) => void;
  setIsAdminModalOpen: (isOpen: boolean) => void;
}

// Default options for flavors to toggle
const FLAVORS_LIBRARY: Record<string, string[]> = {
  "scones-bucket": [
    "Classic Buttermilk Only",
    "Sweet Sultana Infusion",
    "Savory Cheese & Herbs",
    "Mixed Assortment (Sweet & Savory)"
  ],
  "muffins-bucket": [
    "Classic Chocolate Chips",
    "Double Belgian Chocolate",
    "Lemon Poppy Seed Splash",
    "Harvest Bran & Raisin",
    "Assorted Morning Feast"
  ],
  "biscuits-bucket": [
    "Signature Premium Mixture (Plain, Cherry, Choc, 100s & 1000s, Piped)",
    "Traditional Butter Swirl",
    "Cherry Crowned Mix",
    "Choc-Dipped & Sprinkles Only"
  ],
  "rusks-bucket": [
    "Classic Farm Buttermilk",
    "Roasted Almond & Seed",
    "Assorted Dip Platter"
  ]
};

// Map of friendly product names
const PRODUCT_NAMES: Record<string, string> = {
  "scones-bucket": "Buttermilk Scones (Buckets)",
  "muffins-bucket": "Gourmet Muffins (Buckets)",
  "biscuits-bucket": "Butter Biscuits (Buckets)",
  "rusks-bucket": "Handmade Rusks (Buckets)",
  "gourmet-macarons": "Pastel Macarons (Dessert)",
  "koeksisters-deluxe": "Syrupy Koeksisters (Dessert)",
  "travel-box": "Travel Catering Box (Boxes)",
  "snack-box": "Kiddies Party Snack Box (Boxes)",
  "retail-scone": "Individual Scone (Treat)",
  "retail-rusk-classic": "Classic Buttermilk Rusk (Treat)",
  "retail-biscuit-cherry": "Piped Butter Biscuit Cherry (Treat)",
  "retail-biscuit-chocolate": "Dipped Chocolate Biscuit (Treat)",
  "retail-macaron-single": "Signature Single Macaron (Treat)"
};

export default function AdminPortalModal({
  isOpen,
  onClose,
  siteSettings,
  onUpdateSettings,
  setIsAdminModalOpen
}: AdminPortalModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"inventory" | "flavors" | "contact" | "coupons">("inventory");
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Coupon Form State
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newExpiry, setNewExpiry] = useState("2026-12-31");

  // Sync siteSettings to local edit state when values loaded
  useEffect(() => {
    if (siteSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(siteSettings)));
    }
  }, [siteSettings, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPasscode("");
      setIsAuthenticated(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "NemsAdmin2026") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasscode("");
      setPasswordError("Invalid Administrative Code. Access Denied.");
    }
  };

  // Safe deep property updates of local state
  const updatePrice = (itemId: string, field: string, value: number) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    if (!nextSettings.prices[itemId]) {
      nextSettings.prices[itemId] = {};
    }
    
    if (typeof nextSettings.prices[itemId] === "object" && !nextSettings.prices[itemId].base) {
      nextSettings.prices[itemId][field] = value;
    } else if (typeof nextSettings.prices[itemId] === "number" || field === "base") {
      nextSettings.prices[itemId] = value;
    }
    setLocalSettings(nextSettings);
  };

  const updateInventory = (itemId: string, value: number) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    nextSettings.inventory[itemId] = Math.max(0, value);
    setLocalSettings(nextSettings);
  };

  const updateContact = (field: string, value: string) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    nextSettings.contact[field] = value;
    setLocalSettings(nextSettings);
  };

  // Toggle active status of a specific flavor
  const toggleFlavor = (itemId: string, flavor: string) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    if (!nextSettings.flavors) {
      nextSettings.flavors = {};
    }
    if (!nextSettings.flavors[itemId]) {
      nextSettings.flavors[itemId] = [...FLAVORS_LIBRARY[itemId]];
    }

    const currentList = nextSettings.flavors[itemId] as string[];
    if (currentList.includes(flavor)) {
      // Must keep at least one active flavor to prevent empty selections
      if (currentList.length <= 1) {
        return;
      }
      nextSettings.flavors[itemId] = currentList.filter(f => f !== flavor);
    } else {
      nextSettings.flavors[itemId] = [...currentList, flavor];
    }
    setLocalSettings(nextSettings);
  };

  // Coupon Operations
  const addCoupon = () => {
    if (!newCode.trim()) return;
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    if (!nextSettings.coupons) {
      nextSettings.coupons = [];
    }

    // Prevent duplicates
    const upperCode = newCode.trim().toUpperCase();
    if (nextSettings.coupons.some((c: any) => c.code === upperCode)) {
      alert("A coupon with this code already exists!");
      return;
    }

    nextSettings.coupons.push({
      code: upperCode,
      discount: Number(newDiscount),
      isActive: true,
      expiresAt: newExpiry
    });

    setLocalSettings(nextSettings);
    setNewCode("");
  };

  const toggleCouponActive = (code: string) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    nextSettings.coupons = nextSettings.coupons.map((c: any) => {
      if (c.code === code) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    setLocalSettings(nextSettings);
  };

  const deleteCoupon = (code: string) => {
    if (!localSettings) return;
    const nextSettings = { ...localSettings };
    nextSettings.coupons = nextSettings.coupons.filter((c: any) => c.code !== code);
    setLocalSettings(nextSettings);
  };

  // DB update trigger
  const handleSaveChanges = async () => {
    if (!localSettings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const docRef = doc(db, "site_settings", "store_config");
      await updateDoc(docRef, {
        prices: localSettings.prices,
        inventory: localSettings.inventory,
        flavors: localSettings.flavors || {},
        contact: localSettings.contact,
        coupons: localSettings.coupons || []
      });
      onUpdateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update site_settings database node:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 p-4 sm:p-6 md:p-10 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-gold shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-stone-950 text-white px-6 py-4 flex items-center justify-between border-b border-gold">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gold/15 p-1 border border-gold">
              <img src="./images/logo.png" alt="logo seal" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="serif text-lg font-bold uppercase tracking-wider text-white">Nems Admin Dashboard</h2>
              <p className="text-[10px] text-gold uppercase tracking-widest leading-none">Security Zone &bull; Realtime Settings</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setPasscode("");
              setIsAdminModalOpen(false);
            }}
            className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Auth validation view */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="h-16 w-16 bg-gold/10 border border-gold flex items-center justify-center rounded-full text-gold">
              <Lock className="h-8 w-8 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="serif text-2xl font-bold text-stone-900">Enter Security Code</h3>
              <p className="text-xs text-stone-500">Provide the master administrative passcode to toggle inventory stock counts, active daily flavors, and manage active coupons.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="w-full max-w-xs space-y-4">
              <input
                type="password"
                placeholder="Passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full border border-stone-200 focus:outline-none focus:border-gold px-4 py-3 rounded-lg text-center text-sm tracking-widest font-mono text-stone-950 bg-stone-50"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-red-600 font-bold tracking-wide">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-stone-950 border border-gold text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-gold hover:text-stone-950 transition-all shadow-md cursor-pointer"
              >
                Authenticate Guard →
              </button>
            </form>
          </div>
        ) : !localSettings ? (
          <div className="p-12 text-center text-stone-500 animate-pulse flex-1">
            Synchronizing custom database parameters...
          </div>
        ) : (
          <>
            {/* Dashboard Sidebar + Content Layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Tab options bar */}
              <div className="w-full md:w-56 bg-stone-50 border-r border-stone-100 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
                {[
                  { id: "inventory", label: "Stock Control", icon: Eye },
                  { id: "flavors", label: "Active Flavors", icon: Sparkles },
                  { id: "contact", label: "Contact & Info", icon: Info },
                  { id: "coupons", label: "Coupon Engine", icon: Tag }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 md:flex-initial py-3 md:py-4 px-4 flex items-center justify-center md:justify-start space-x-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b md:border-b-0 md:border-l-4 ${
                        activeTab === tab.id
                          ? "bg-white text-gold border-gold md:-mr-[1px]"
                          : "text-stone-600 border-transparent hover:bg-stone-100/50 hover:text-stone-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gold" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Central Settings Forms Container */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[50vh] md:max-h-none">
                
                {/* 1. STOCK CONTROL */}
                {activeTab === "inventory" && (
                  <div className="space-y-6">
                    <div className="border-b border-stone-100 pb-3">
                      <h4 className="serif font-bold text-stone-950 text-base">Active Stock levels &amp; Pricing limits</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Toggle stock quantities. Setting a product to 0 instantly triggers an "Out of Stock" notification, rendering adding disable.</p>
                    </div>

                    <div className="space-y-4">
                      {Object.keys(PRODUCT_NAMES).map((id) => {
                        const stock = localSettings.inventory[id] ?? 0;
                        const prices = localSettings.prices[id];
                        const isBucketItem = typeof prices === "object" && prices !== null;

                        return (
                          <div key={id} className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-stone-950 block">{PRODUCT_NAMES[id] || id}</span>
                              <span className="text-[10px] uppercase font-mono text-stone-500 tracking-wider">ID: {id}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                              {/* Stock selector count counters */}
                              <div className="flex items-center space-x-2 bg-white border border-stone-200 rounded px-2 py-1">
                                <span className="text-[9px] uppercase font-extrabold text-stone-500 tracking-widest">Stock:</span>
                                <button
                                  type="button"
                                  onClick={() => updateInventory(id, stock - 1)}
                                  className="h-6 w-6 font-bold flex items-center justify-center bg-stone-100 rounded text-stone-700 hover:bg-stone-200"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={stock}
                                  onChange={(e) => updateInventory(id, parseInt(e.target.value) || 0)}
                                  className="w-12 text-center text-xs font-bold text-stone-950 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateInventory(id, stock + 1)}
                                  className="h-6 w-6 font-bold flex items-center justify-center bg-stone-100 rounded text-stone-700 hover:bg-stone-200"
                                >
                                  +
                                </button>
                              </div>

                              {/* Price overview adjustments */}
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] uppercase font-extrabold text-stone-500 tracking-widest">Price Override (R):</span>
                                {isBucketItem ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.keys(prices).map((sz) => (
                                      <div key={sz} className="flex items-center bg-white border border-stone-200 rounded px-1.5 py-1">
                                        <span className="text-[9px] font-bold text-gold mr-1">{sz}:</span>
                                        <input
                                          type="number"
                                          value={prices[sz] || 0}
                                          onChange={(e) => updatePrice(id, sz, parseFloat(e.target.value) || 0)}
                                          className="w-10 text-center font-mono text-xs font-semibold text-stone-900 bg-transparent focus:outline-none"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-white border border-stone-200 rounded px-2 py-1">
                                    <input
                                      type="number"
                                      value={typeof prices === "object" ? prices.base : prices}
                                      onChange={(e) => updatePrice(id, "base", parseFloat(e.target.value) || 0)}
                                      className="w-16 text-center font-mono text-xs font-semibold text-stone-900 bg-transparent focus:outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. ACTIVE FLAVORS */}
                {activeTab === "flavors" && (
                  <div className="space-y-6">
                    <div className="border-b border-stone-100 pb-3">
                      <h4 className="serif font-bold text-stone-950 text-base">Ingredients active flavor selection</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Toggle checkboxes below to filter what muffin, scone, rusk or biscuit options are available for customer checkouts inside the online shop.</p>
                    </div>

                    <div className="space-y-6">
                      {Object.keys(FLAVORS_LIBRARY).map((itemId) => {
                        const availableFlavors = FLAVORS_LIBRARY[itemId];
                        const activeList = localSettings.flavors?.[itemId] || availableFlavors;

                        return (
                          <div key={itemId} className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-3">
                            <span className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                              {PRODUCT_NAMES[itemId] || itemId} Daily Flavors
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {availableFlavors.map((flavor) => {
                                const isActive = activeList.includes(flavor);
                                return (
                                  <label
                                    key={flavor}
                                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                      isActive
                                        ? "bg-white border-gold text-stone-950 font-medium"
                                        : "bg-stone-100/40 border-stone-200 text-stone-400"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isActive}
                                      onChange={() => toggleFlavor(itemId, flavor)}
                                      className="accent-[#D4AF37] h-4 w-4"
                                    />
                                    <span className="text-xs">{flavor}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. CONTACT INFO */}
                {activeTab === "contact" && (
                  <div className="space-y-6">
                    <div className="border-b border-stone-100 pb-3">
                      <h4 className="serif font-bold text-stone-950 text-base">Contact Information defaults</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Primary email address, phone contact and workstation physical details referenced during checkouts and email generation.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A028] block mb-1">Bakery Order Notification Target Email</label>
                        <input
                          type="email"
                          value={localSettings.contact.email}
                          onChange={(e) => updateContact("email", e.target.value)}
                          className="w-full text-xs border border-stone-200 focus:outline-none focus:border-gold px-3.5 py-2.5 rounded-lg text-stone-950 bg-[#FDFBF7]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A028] block mb-1">Direct Contact Mobile telephone</label>
                        <input
                          type="text"
                          value={localSettings.contact.phone}
                          onChange={(e) => updateContact("phone", e.target.value)}
                          className="w-full text-xs border border-stone-200 focus:outline-none focus:border-gold px-3.5 py-2.5 rounded-lg text-stone-950 bg-[#FDFBF7]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#C5A028] block mb-1">Midrand Pickup/Baking Facility Address</label>
                        <textarea
                          rows={3}
                          value={localSettings.contact.address}
                          onChange={(e) => updateContact("address", e.target.value)}
                          className="w-full text-xs border border-stone-200 focus:outline-none focus:border-gold px-3.5 py-2.5 rounded-lg text-stone-950 bg-[#FDFBF7]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. COUPONS */}
                {activeTab === "coupons" && (
                  <div className="space-y-6">
                    <div className="border-b border-stone-100 pb-3">
                      <h4 className="serif font-bold text-stone-950 text-base">Promo &amp; Coupon Codes Engine</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">Activate or create percentage-based coupons for Midrand ceremonies. Coupons apply during Cart checkout.</p>
                    </div>

                    {/* New Coupon Creator */}
                    <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl space-y-4">
                      <span className="text-xs font-black text-stone-950 uppercase tracking-wider block">Create New Promo Code</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] uppercase text-stone-500 font-bold tracking-widest mb-1 block">Coupon Code</label>
                          <input
                            type="text"
                            placeholder="e.g. MIDRAND20"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            className="w-full text-xs uppercase border border-stone-200 focus:outline-none focus:border-gold p-2.5 bg-white text-stone-950 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-stone-500 font-bold tracking-widest mb-1 block">Discount (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={newDiscount}
                            onChange={(e) => setNewDiscount(parseInt(e.target.value) || 0)}
                            className="w-full text-xs border border-stone-200 focus:outline-none focus:border-gold p-2.5 bg-white text-stone-950 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-stone-500 font-bold tracking-widest mb-1 block">Expires On</label>
                          <input
                            type="date"
                            value={newExpiry}
                            onChange={(e) => setNewExpiry(e.target.value)}
                            className="w-full text-xs border border-stone-200 focus:outline-none focus:border-gold p-2 bg-white text-stone-950 font-mono"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addCoupon}
                        className="bg-gold text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded shadow hover:bg-black transition-colors"
                      >
                        Add to Coupon List
                      </button>
                    </div>

                    {/* Coupon list */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-stone-900 block">Existing Promo Codes</span>
                      {(localSettings.coupons || []).length === 0 ? (
                        <p className="text-xs text-stone-400 italic">No coupons configured in system settings.</p>
                      ) : (
                        <div className="space-y-2">
                          {(localSettings.coupons || []).map((cp: any, idx: number) => {
                            const isExpired = cp.expiresAt && new Date(cp.expiresAt) < new Date();
                            return (
                              <div key={`${cp.code}-${idx}`} className="p-3.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <strong className="text-xs font-mono text-stone-950 bg-stone-100 px-2 py-0.5 rounded border">
                                      {cp.code}
                                    </strong>
                                    {isExpired && (
                                      <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 uppercase tracking-wider font-extrabold font-sans">Expired</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-stone-500">
                                    Discount: <strong className="text-stone-900 font-semibold">{cp.discount}%</strong> &bull; Expires: {cp.expiresAt || "Never"}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => toggleCouponActive(cp.code)}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded ${
                                      cp.isActive 
                                        ? "bg-emerald-100 text-emerald-800" 
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {cp.isActive ? "Active" : "Inactive"}
                                  </button>
                                  <button
                                    onClick={() => deleteCoupon(cp.code)}
                                    className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-stone-50 px-6 py-4 flex items-center justify-between border-t border-stone-100">
              <span className="text-[10px] text-stone-400">
                Double-check updates before writing parameters.
              </span>
              
              <div className="flex items-center space-x-3">
                {saveSuccess && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="h-4 w-4" />
                    <span>Database parameters synchronized!</span>
                  </span>
                )}
                
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-gold text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3 border border-gold hover:bg-stone-950 shadow-md flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
