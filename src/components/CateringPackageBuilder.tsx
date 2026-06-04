/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from "react";
import { DIETARY_OPTIONS } from "../data";
import { FileText, CheckCircle, Calculator, PhoneCall, Award, Leaf, Printer, RotateCcw } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export default function CateringPackageBuilder() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState<number>(30);
  const [packageType, setPackageType] = useState<"platter" | "braai" | "hightea">("platter");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [travelBoxCount, setTravelBoxCount] = useState<number>(0);
  const [snackBoxCount, setSnackBoxCount] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [showProposal, setShowProposal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const packagesInfo = {
    platter: {
      name: "Savoury Gourmet Platters",
      pricePerGuest: 150,
      description: "Includes assorted mini meatball skewers, crispy chicken strips, savory tarts, samosas, and miniature sandwiches arranged beautifully on premium platters."
    },
    braai: {
      name: "Heritage South African Spitbraai",
      pricePerGuest: 280,
      description: "Gourmet lamb spit braai or tender flame-grilled chicken, traditional boerewors, chakalaka salad, premium pap with sweet-kernel gravy, and baked potatoes."
    },
    hightea: {
      name: "Royal High Tea & Dessert Buffet",
      pricePerGuest: 200,
      description: "Elegant selection of Nems butter scones with thick whip, sweet koeksisters, signature pink/mint macarons, and savory cocktail quiches on tiered brass stands."
    }
  };

  // Live Quote Price Calculations
  const pricingSummary = useMemo(() => {
    const basePerGuest = packagesInfo[packageType].pricePerGuest;
    
    // Accumulate selected dietary additional costs
    const dietaryAdditionPerGuest = selectedDietary.reduce((sum, currentId) => {
      const option = DIETARY_OPTIONS.find((opt) => opt.id === currentId);
      return sum + (option ? option.additionalCostPerGuest : 0);
    }, 0);

    const cateringGuestsSubtotal = (basePerGuest + dietaryAdditionPerGuest) * guestCount;
    const travelBoxesCost = travelBoxCount * 750;
    const snackBoxesCost = snackBoxCount * 85;
    const totalEstimated = cateringGuestsSubtotal + travelBoxesCost + snackBoxesCost;

    return {
      basePerGuest,
      dietaryAdditionPerGuest,
      cateringGuestsSubtotal,
      travelBoxesCost,
      snackBoxesCost,
      totalEstimated
    };
  }, [packageType, guestCount, selectedDietary, travelBoxCount, snackBoxCount]);

  const handleDietaryToggle = (id: string) => {
    setSelectedDietary((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const validateAndSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!phone.trim() || phone.length < 9) newErrors.phone = "Provide a valid active phone number";
    if (!eventDate) newErrors.eventDate = "Please choose a scheduled event date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the top of form to show validation errors
      const formEl = document.getElementById("catering-builder-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setErrors({});

    // Save custom gourmet proposal option as order entry in Firestore
    const path = "orders";
    try {
      await addDoc(collection(db, path), {
        customerName: fullName.trim(),
        phoneNumber: phone.trim(),
        product: `Catering Package: ${packagesInfo[packageType].name} (for ${guestCount} guests). ${selectedDietary.length > 0 ? "Accommodations: " + selectedDietary.join(", ") : ""}`.substring(0, 2000),
        quantity: 1,
        totalPrice: pricingSummary.totalEstimated,
        status: "Pending",
        orderDate: serverTimestamp(),
        deliveryMethod: "delivery",
        deliveryAddress: `Scheduled Event Date: ${eventDate}`
      });
      setShowProposal(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setEventDate("");
    setGuestCount(30);
    setPackageType("platter");
    setSelectedDietary([]);
    setTravelBoxCount(0);
    setSnackBoxCount(0);
    setSpecialRequests("");
    setShowProposal(false);
  };

  return (
    <section id="catering-builder" className="scroll-mt-20 bg-[#FAF9F5] py-16 sm:py-24 border-t border-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold block">Gourmet Catering Customizer</span>
          <h2 className="serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Custom Catering Package Builder
          </h2>
          <p className="text-sm text-stone-600">
            Design your ideal South African feast below. Adjust your guest count, select dietary requirements, and add specialized travel or snack packages. Get a beautiful, live custom quote instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Inquiry Form Section */}
          <div className="lg:col-span-7 bg-white border border-gold p-6 sm:p-8" id="catering-builder-form">
            {!showProposal ? (
              <form onSubmit={validateAndSubmit} className="space-y-8">
                
                {/* 1. Event Package Type */}
                <div className="space-y-4">
                  <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.15em] text-gold">
                    <Award className="h-4 w-4" />
                    <span>Sourcing Step 1: Choose Menu Type</span>
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {(["platter", "braai", "hightea"] as const).map((type) => {
                      const isActive = packageType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPackageType(type)}
                          className={`flex flex-col text-left p-4 border transition-all rounded-none ${
                            isActive
                              ? "bg-black border-black text-white shadow-xs"
                              : "bg-[#FAF9F5] border-stone-200 text-stone-900 hover:border-gold"
                          }`}
                        >
                          <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? "text-[#C5A028]" : "text-stone-500"}`}>
                            R {packagesInfo[type].pricePerGuest} / Guest
                          </span>
                          <span className="text-[14px] font-bold font-serif mb-1 mt-0.5">
                            {packagesInfo[type].name}
                          </span>
                          <span className={`text-[11px] leading-snug font-medium line-clamp-3 ${isActive ? "text-stone-300" : "text-stone-600"}`}>
                            {packagesInfo[type].description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Guest Count & Date Slider */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-gold/30">
                  <div className="md:col-span-7 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                      Number of Guests: <span className="text-lg font-bold font-serif text-[#C5A028] ml-2">{guestCount} Guests</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="5"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full h-2 bg-stone-100 rounded-none appearance-none cursor-pointer accent-gold"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-stone-500 font-bold">
                      <span>Min: 10</span>
                      <span>Mid: 250</span>
                      <span>Max: 500+</span>
                    </div>
                  </div>

                  <div className="md:col-span-5 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-900 block">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full text-sm border border-stone-200 px-4 py-2.5 focus:outline-none focus:border-gold text-stone-950 bg-neutral-50 rounded-none"
                    />
                    {errors.eventDate && <p className="text-[11px] font-semibold text-rose-500">{errors.eventDate}</p>}
                  </div>
                </div>

                {/* 3. Specific Dietary Accommodations (Requested per user) */}
                <div className="space-y-4 pt-6 border-t border-gold/30">
                  <div>
                    <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.15em] text-[#C5A028]">
                      <Leaf className="h-4 w-4" />
                      <span>Sourcing Step 2: Dietary Accommodations</span>
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Select required accommodation protocols. Upcharges cover exclusive workspace sterilizations and allergen-safe ingredient sourcing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DIETARY_OPTIONS.map((opt) => {
                      const isSelected = selectedDietary.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleDietaryToggle(opt.id)}
                          className={`flex items-start text-left p-3.5 border transition-all rounded-none ${
                            isSelected
                              ? "bg-emerald-50/40 border-gold shadow-xs"
                              : "bg-stone-50/50 border-stone-200 hover:border-gold"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="mr-3 mt-1 h-4.5 w-4.5 rounded-none text-emerald-600 focus:ring-0 accent-emerald-600"
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-950 block">
                              {opt.label}
                            </span>
                            <span className="text-[10px] text-stone-500 leading-snug block mt-0.5 mb-1">
                              {opt.description}
                            </span>
                            <span className="text-[9px] font-bold py-0.5 px-2 bg-[#FAF9F5] text-stone-700 border border-gold/30 inline-block uppercase tracking-wider">
                              +R {opt.additionalCostPerGuest} / Guest
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Travel Box & Kids Snack Box additions */}
                <div className="space-y-4 pt-6 border-t border-gold/30">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gold block">
                      Specialized Packaging Additions
                    </span>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Do you require robust specialized container boxes to complement your primary catering menu?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Travel Box Card input */}
                    <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">Long-Distance Travel Box</span>
                        <span className="text-[10px] text-gold font-bold block">R 750 apiece</span>
                        <span className="text-[10px] text-stone-500 block">Insulated, built-in protection setup</span>
                      </div>
                      <div className="flex items-center border border-stone-300 overflow-hidden bg-white h-8">
                        <button
                          type="button"
                          onClick={() => setTravelBoxCount((c) => Math.max(0, c - 1))}
                          className="px-2 text-stone-600 font-bold hover:bg-stone-50"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold text-stone-900 font-mono">{travelBoxCount}</span>
                        <button
                          type="button"
                          onClick={() => setTravelBoxCount((c) => c + 1)}
                          className="px-2 text-stone-600 font-bold hover:bg-stone-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Kids Snack Box Card input */}
                    <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200">
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">School Pack Kiddies Box</span>
                        <span className="text-[10px] text-gold font-bold block">R 85 apiece</span>
                        <span className="text-[10px] text-stone-500 block">Juice, pastry & fresh sweets</span>
                      </div>
                      <div className="flex items-center border border-stone-300 overflow-hidden bg-white h-8">
                        <button
                          type="button"
                          onClick={() => setSnackBoxCount((c) => Math.max(0, c - 1))}
                          className="px-2 text-stone-600 font-bold hover:bg-stone-50"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-semibold text-stone-900 font-mono">{snackBoxCount}</span>
                        <button
                          type="button"
                          onClick={() => setSnackBoxCount((c) => c + 1)}
                          className="px-2 text-stone-600 font-bold hover:bg-stone-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Personal Details Form Fields */}
                <div className="space-y-4 pt-6 border-t border-gold/30">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#C5A028] block">
                    Sourcing Step 3: Contact Details & Delivery Logistics
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-[#C5A028] block">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sipho Nkosi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-gold text-stone-900 placeholder-stone-400 bg-neutral-50 rounded-none"
                      />
                      {errors.fullName && <p className="text-[10px] font-semibold text-rose-500">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-[#C5A028] block">Email Address *</label>
                      <input
                        type="email"
                        placeholder="e.g. sipho@gauteng.co.za"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-gold text-stone-900 placeholder-stone-400 bg-neutral-50 rounded-none"
                      />
                      {errors.email && <p className="text-[10px] font-semibold text-rose-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-[#C5A028] block">Mobile Phone *</label>
                      <input
                        type="text"
                        placeholder="e.g. +27 82 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-gold text-stone-900 placeholder-stone-400 bg-neutral-50 rounded-none"
                      />
                      {errors.phone && <p className="text-[10px] font-semibold text-rose-500">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#C5A028] block">VENUE INSTRUCTIONS & ALLERGEN ACCOMMODATION REQUESTS</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ceremony starts at 11:30 in Midrand, please ensure strict separation of vegetarian plates..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full text-xs border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-gold text-stone-900 placeholder-stone-400 bg-neutral-50 rounded-none"
                    />
                  </div>
                </div>

                {/* Inquiry CTA */}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-black text-white py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 rounded-none"
                  >
                    <FileText className="h-4.5 w-4.5" />
                    <span>Generate Gourmet Proposal</span>
                  </button>
                </div>

              </form>
            ) : (
              // Stunning customized live proposal printable sheet
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle className="h-6 w-6 stroke-[2.5]" />
                    <span className="serif text-lg font-bold">Proposal Outline Ready</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1.5 text-xs text-stone-500 hover:text-gold transition-colors font-semibold uppercase tracking-wider"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Start New Build</span>
                  </button>
                </div>

                {/* Printable Proposal Card (reflecting logo colours gold & white & writing in black) */}
                <div className="border-[3px] border-double border-gold bg-white p-6 sm:p-8 rounded-none shadow-sm relative text-[#141414] text-left">
                  
                  {/* Watermark logo decoration based on colors */}
                  <div className="absolute top-4 right-4 flex space-x-1 opacity-70">
                    <span className="h-4 w-4 rounded-full bg-[#ECA1A6] border border-gold" />
                    <span className="h-4 w-4 rounded-full bg-[#A6E3E9] border border-gold" />
                  </div>

                  {/* Header */}
                  <div className="border-b border-gold/40 pb-4 mb-4 text-center sm:text-left">
                    <h4 className="serif text-2xl font-black text-ink">Nems Bakery and Catering Co.</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#C5A028]">
                      EST. PRETORIA • OFFICIAL INQUIRY PROPOSAL #{(Math.floor(Math.random() * 89999) + 10000)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6 pb-4 border-b border-stone-100">
                    <div className="space-y-1">
                      <span className="text-stone-400 block uppercase tracking-wider text-[8px] font-extrabold">Client Information:</span>
                      <strong className="text-stone-950 block text-sm font-semibold">{fullName}</strong>
                      <span className="block">{email}</span>
                      <span className="block">{phone}</span>
                    </div>
                    <div className="space-y-1 sm:text-right">
                      <span className="text-stone-400 block uppercase tracking-wider text-[8px] font-extrabold">Event Details:</span>
                      <strong className="text-stone-950 block text-sm font-semibold">Scheduled Date: {eventDate}</strong>
                      <span className="block">Guest Capacity: {guestCount} Guests</span>
                      <span className="block">Status: <strong className="text-emerald-700 uppercase tracking-widest text-[8px] font-extrabold">Draft Proposal Sheet</strong></span>
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  <div className="space-y-3 mb-6">
                    <span className="text-gold block uppercase tracking-widest text-[9px] font-extrabold border-b border-stone-100 pb-1">Price Calculation:</span>
                    
                    <div className="space-y-2 text-xs">
                      {/* Base Package */}
                      <div className="flex justify-between py-1.5 border-b border-stone-100 font-medium">
                        <span>Menu Type: {packagesInfo[packageType].name} (R {packagesInfo[packageType].pricePerGuest} × {guestCount} guests)</span>
                        <span className="font-semibold text-stone-900">R {packagesInfo[packageType].pricePerGuest * guestCount}</span>
                      </div>

                      {/* Dietary accommodation additions */}
                      {selectedDietary.length > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-stone-100 text-stone-700 bg-neutral-50 p-2.5 font-mono">
                          <div>
                            <span className="font-bold text-stone-900 block uppercase text-[10px] tracking-wide font-sans">Accommodations Addition:</span>
                            <span className="text-[10px] text-stone-500 font-sans">
                              ({selectedDietary.map(id => DIETARY_OPTIONS.find(o => o.id === id)?.label).join(", ")})
                            </span>
                          </div>
                          <span className="font-semibold text-stone-955">
                            +R {pricingSummary.dietaryAdditionPerGuest * guestCount}
                          </span>
                        </div>
                      )}

                      {/* Travel boxes count if requested */}
                      {travelBoxCount > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-stone-100 font-mono">
                          <span className="font-sans">Long-distance Travel Boxes (R 750 × {travelBoxCount})</span>
                          <span className="font-semibold text-stone-900 font-mono">R {pricingSummary.travelBoxesCost}</span>
                        </div>
                      )}

                      {/* Kid Snack counts */}
                      {snackBoxCount > 0 && (
                        <div className="flex justify-between py-1.5 border-b border-stone-100 font-mono">
                          <span className="font-sans">School Kiddies Snack Boxes (R 85 × {snackBoxCount})</span>
                          <span className="font-semibold text-stone-900 font-mono">R {pricingSummary.snackBoxesCost}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special instructions */}
                  {specialRequests.trim() && (
                    <div className="bg-neutral-50 p-3 text-[11px] border border-stone-200 mb-6">
                      <strong className="text-stone-800 block text-[9px] uppercase tracking-wide mb-1 font-bold">Dietary Logistics & Custom Notes:</strong>
                      <p className="text-stone-600 font-mono italic">"{specialRequests}"</p>
                    </div>
                  )}

                  {/* Final Total */}
                  <div className="flex items-center justify-between border-t border-b border-gold pt-4 pb-4 text-stone-950 bg-[#FAF9F5] px-4 py-3 rounded-none">
                    <span className="text-[10px] uppercase tracking-widest font-black text-stone-800">Total Investment Outline</span>
                    <span className="serif text-3xl font-bold text-gold font-mono italic">
                      R {pricingSummary.totalEstimated}
                    </span>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[9px] text-stone-400 text-center mt-4 tracking-wide">
                    Draft Proposal created in South African Rands (ZAR). All dietary standards apply. Our manager will connect with you via {email} to officially book.
                  </p>
                </div>

                {/* Printable and copy buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 border border-stone-300 bg-white hover:bg-stone-50 text-stone-950 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-1.5 rounded-none"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Proposal</span>
                  </button>

                  <button
                    onClick={() => {
                      alert("Excellent! Your parameters have been received. Our team will contact you on " + phone);
                    }}
                    className="flex-1 bg-gold text-white hover:bg-black py-3.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-1.5 rounded-none"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Book Delivery Review</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Live Estimation Sidebar */}
          <div className="lg:col-span-5 bg-black text-white p-6 sm:p-8 space-y-6 relative overflow-hidden border border-gold shadow-sm rounded-none">
            {/* Background design */}
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
            
            <div className="border-b border-stone-800 pb-4">
              <span className="flex items-center space-x-2 text-gold text-[10px] uppercase font-extrabold tracking-widest">
                <Calculator className="h-3.5 w-3.5" />
                <span>Live Calculator</span>
              </span>
              <h3 className="font-serif text-xl font-bold mt-1 text-white">Estimated Quote Outline</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                <span className="text-stone-400">Selected Base Menu:</span>
                <span className="font-semibold text-stone-100">{packagesInfo[packageType].name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                <span className="text-stone-400">Cost Per Guest:</span>
                <span className="font-semibold text-stone-100">R {packagesInfo[packageType].pricePerGuest} / head</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-800/60">
                <span className="text-stone-400">Guests Multiplier:</span>
                <span className="font-semibold text-stone-100">× {guestCount} guests</span>
              </div>

              {selectedDietary.length > 0 && (
                <div className="flex justify-between py-1.5 border-b border-stone-800/60 text-emerald-400 font-medium">
                  <span className="font-sans">Dietary Accommodations:</span>
                  <span>+R {pricingSummary.dietaryAdditionPerGuest} / head</span>
                </div>
              )}

              {travelBoxCount > 0 && (
                <div className="flex justify-between py-1.5 border-b border-stone-800/60 text-gold font-medium">
                  <span className="font-sans">Travel Boxes ({travelBoxCount}):</span>
                  <span>R {pricingSummary.travelBoxesCost}</span>
                </div>
              )}

              {snackBoxCount > 0 && (
                <div className="flex justify-between py-1.5 border-b border-stone-800/60 text-sky-300 font-medium font-mono">
                  <span className="font-sans">Snack Boxes ({snackBoxCount}):</span>
                  <span>R {pricingSummary.snackBoxesCost}</span>
                </div>
              )}

              <div className="bg-[#141414] p-4 flex flex-col items-center justify-center space-y-1 border border-gold/40 text-center rounded-none font-mono">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block font-sans">Estimated ZAR Rands</span>
                <span className="serif text-3xl font-extrabold text-gold italic">R {pricingSummary.totalEstimated}</span>
                <span className="text-[9px] text-stone-500 font-sans leading-relaxed">VAT inclusive • Delivery rates estimated upon review calls</span>
              </div>
            </div>

            {/* Authenticity guarantee */}
            <div className="border border-gold/40 bg-neutral-950/40 p-4 space-y-2 rounded-none">
              <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">The Nems Culinary Guarantee</span>
              <p className="text-[10.5px] text-stone-400 leading-relaxed font-normal">
                All customized packages include premium biodegradable caterplates, linen cutlery wraps, gourmet buffet warmers, and elegant gold-labeled descriptions. Zero synthetic waste.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
