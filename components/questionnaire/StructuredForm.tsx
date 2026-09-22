"use client";

import React, { useState } from "react";
import { UserConstraints, AccommodationType, FurnishedPreference, CustomRequirement } from "@/types/relocation";
import {
  MapPin,
  Building2,
  Coins,
  Clock,
  Home,
  Dumbbell,
  UtensilsCrossed,
  Train,
  ShoppingBag,
  Sliders,
  Plus,
  X,
  GraduationCap,
  HeartPulse,
  Baby,
  Dog,
  Briefcase,
  Trophy,
  Sparkles,
} from "lucide-react";

interface StructuredFormProps {
  constraints: UserConstraints;
  onChange: (updated: UserConstraints) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function StructuredForm({ constraints, onChange, onSubmit, isLoading }: StructuredFormProps) {
  const [customInputText, setCustomInputText] = useState("");
  const [customDistanceKm, setCustomDistanceKm] = useState(1.0);

  const updateField = <K extends keyof UserConstraints>(field: K, value: UserConstraints[K]) => {
    onChange({
      ...constraints,
      [field]: value,
    });
  };

  const accommodationOptions: AccommodationType[] = ["1BHK", "2BHK", "1RK", "Coliving"];
  const furnishedOptions: { label: string; value: FurnishedPreference }[] = [
    { label: "Furnished", value: "furnished" },
    { label: "Semi-Furnished", value: "semi-furnished" },
    { label: "Unfurnished", value: "unfurnished" },
  ];

  const customPresets = [
    { category: "school", label: "School / Education", icon: GraduationCap, defaultDist: 1.0 },
    { category: "hospital", label: "Hospital / Healthcare", icon: HeartPulse, defaultDist: 2.0 },
    { category: "daycare", label: "Daycare / Preschool", icon: Baby, defaultDist: 1.0 },
    { category: "pet_park", label: "Dog / Pet Park", icon: Dog, defaultDist: 2.0 },
    { category: "coworking", label: "Coworking Space", icon: Briefcase, defaultDist: 1.5 },
    { category: "sports", label: "Sports / Badminton", icon: Trophy, defaultDist: 2.0 },
  ];

  const handleAddPreset = (preset: typeof customPresets[0]) => {
    const existing = constraints.customRequirements || [];
    if (existing.some((r) => r.category === preset.category)) return;

    const newReq: CustomRequirement = {
      id: `req-${preset.category}-${Date.now()}`,
      category: preset.category,
      label: preset.label,
      targetDistanceKm: preset.defaultDist,
      queryKeyword: preset.label.toLowerCase(),
      priority: "essential",
    };

    updateField("customRequirements", [...existing, newReq]);
  };

  const handleAddCustomText = () => {
    if (!customInputText.trim()) return;
    const existing = constraints.customRequirements || [];
    const cat = customInputText.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const newReq: CustomRequirement = {
      id: `req-custom-${Date.now()}`,
      category: cat,
      label: customInputText.trim(),
      targetDistanceKm: customDistanceKm,
      queryKeyword: customInputText.trim(),
      priority: "essential",
    };

    updateField("customRequirements", [...existing, newReq]);
    setCustomInputText("");
  };

  const handleRemoveCustomReq = (id: string) => {
    const existing = constraints.customRequirements || [];
    updateField("customRequirements", existing.filter((r) => r.id !== id));
  };

  const handleUpdateReqDistance = (id: string, dist: number) => {
    const existing = constraints.customRequirements || [];
    updateField(
      "customRequirements",
      existing.map((r) => (r.id === id ? { ...r, targetDistanceKm: dist } : r))
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      <div className="rounded-2xl bg-white p-6 sm:p-7 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Sliders className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Relocation Parameters</h3>
          </div>
          <span className="text-xs text-slate-500">Fine-tune your constraints</span>
        </div>

        {/* Row 1: City & Office Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-600" /> Destination City
            </label>
            <input
              type="text"
              value={constraints.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="e.g. Bangalore, Hyderabad, Pune, Mumbai..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-teal-600" /> Workplace / Office Anchor
            </label>
            <input
              type="text"
              value={constraints.officeLocation}
              onChange={(e) => updateField("officeLocation", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="e.g. Whitefield, Hitec City, Hinjawadi, BKC..."
              required
            />
          </div>
        </div>

        {/* Row 2: Monthly Budget & Max Commute */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Monthly Budget */}
          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-teal-600" /> Monthly Rent Budget
              </label>
              <span className="text-sm font-bold text-teal-700 font-mono">
                ₹{constraints.budgetMonthlyInr.toLocaleString("en-IN")} / mo
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={75000}
              step={1000}
              value={constraints.budgetMonthlyInr}
              onChange={(e) => updateField("budgetMonthlyInr", Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>₹15k</span>
              <span className="font-bold text-teal-800">₹{Math.round(constraints.budgetMonthlyInr/1000)}k</span>
              <span>₹75k</span>
            </div>
          </div>

          {/* Commute */}
          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-600" /> Maximum Commute Time
              </label>
              <span className="text-sm font-bold text-teal-700 font-mono">
                &lt; {constraints.maxCommuteMin} mins
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={5}
              value={constraints.maxCommuteMin}
              onChange={(e) => updateField("maxCommuteMin", Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>15m (Short)</span>
              <span className="font-bold text-teal-800">{constraints.maxCommuteMin}m</span>
              <span>60m (Max)</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DYNAMIC CUSTOM REQUIREMENTS (Schools, Hospitals, etc.)   */}
        {/* ======================================================== */}
        <div className="rounded-xl bg-teal-50/40 p-4 border border-teal-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <label className="text-xs font-bold text-slate-900">
                Dynamic Custom Requirements (e.g. School within 1 km, Hospital, Daycare)
              </label>
            </div>
            <span className="text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
              AI Dynamic Evaluator
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            MoveWise will formulate SerpApi Google Maps queries specifically for each requirement and verify distances for every candidate neighborhood.
          </p>

          {/* Active Custom Requirements List */}
          {constraints.customRequirements && constraints.customRequirements.length > 0 ? (
            <div className="space-y-2">
              {constraints.customRequirements.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-teal-200 shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="font-bold text-slate-800">{req.label}</span>
                    <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                      Within {req.targetDistanceKm} km
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Target radius:</span>
                      <input
                        type="range"
                        min={0.5}
                        max={4.0}
                        step={0.5}
                        value={req.targetDistanceKm}
                        onChange={(e) => handleUpdateReqDistance(req.id, Number(e.target.value))}
                        className="w-24 accent-teal-600 cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomReq(req.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remove requirement"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic bg-white/60 p-2.5 rounded-lg border border-dashed border-slate-200">
              No custom requirements added yet. Click a preset below or type &quot;school nearby 1km&quot; in the text prompt above.
            </div>
          )}

          {/* Quick Presets */}
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              + Add Quick Requirement:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {customPresets.map((preset) => {
                const Icon = preset.icon;
                const isAdded = constraints.customRequirements?.some((r) => r.category === preset.category);
                return (
                  <button
                    key={preset.category}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      isAdded
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                        : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700 shadow-2xs"
                    }`}
                  >
                    <Icon className="h-3 w-3 text-teal-600" />
                    <span>{preset.label}</span>
                    <span className="text-[10px] opacity-70">(&lt;{preset.defaultDist}km)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Input for arbitrary custom parameter */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="e.g. Montessori School, Organic Supermarket, Lake View..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">&lt; {customDistanceKm} km:</span>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.5}
                value={customDistanceKm}
                onChange={(e) => setCustomDistanceKm(Number(e.target.value))}
                className="w-20 accent-teal-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={handleAddCustomText}
                disabled={!customInputText.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Accommodation Type & Furnishing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-teal-600" /> Accommodation Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {accommodationOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("accommodationType", type)}
                  className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                    constraints.accommodationType === type
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Furnishing Level</label>
            <div className="grid grid-cols-3 gap-2">
              {furnishedOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("furnishedPreference", opt.value)}
                  className={`rounded-xl py-2 text-xs font-semibold border transition-all ${
                    constraints.furnishedPreference === opt.value
                      ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Gym Requirement */}
        <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gym-toggle"
                checked={constraints.gymRequired}
                onChange={(e) => updateField("gymRequired", e.target.checked)}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600 cursor-pointer"
              />
              <label htmlFor="gym-toggle" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-teal-600" /> Must have rated gym / fitness center nearby
              </label>
            </div>
            {constraints.gymRequired && (
              <span className="text-xs font-bold text-teal-700 font-mono">
                Within {constraints.maxGymDistKm} km radius
              </span>
            )}
          </div>

          {constraints.gymRequired && (
            <div className="mt-3 pt-2 border-t border-slate-200/60">
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.5}
                value={constraints.maxGymDistKm}
                onChange={(e) => updateField("maxGymDistKm", Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>0.5 km (Walking)</span>
                <span className="font-bold text-teal-800">{constraints.maxGymDistKm} km</span>
                <span>4.0 km (Driving)</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 5: Food, Transit & Groceries Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <UtensilsCrossed className="h-3.5 w-3.5 text-teal-600" /> Food & Dining
            </label>
            <select
              value={constraints.foodPreference}
              onChange={(e) => updateField("foodPreference", e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="diverse">Diverse Dining & Cafes</option>
              <option value="vegetarian">Pure Vegetarian Hubs</option>
              <option value="budget_friendly">Budget Messes & Daily Eats</option>
              <option value="cafes">Artisanal Cafes & Workspaces</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Train className="h-3.5 w-3.5 text-teal-600" /> Public Transit
            </label>
            <select
              value={constraints.transitPreference}
              onChange={(e) => updateField("transitPreference", e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="metro_priority">Rapid Metro Priority</option>
              <option value="bus_ok">Frequent Buses Ok</option>
              <option value="cab_commute">Cab / Two-Wheeler Commute</option>
              <option value="walkable">Strictly Walkable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-teal-600" /> Groceries & Essentials
            </label>
            <select
              value={constraints.groceryPreference}
              onChange={(e) => updateField("groceryPreference", e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium bg-white focus:border-teal-500 focus:outline-none"
            >
              <option value="walkable_supermarket">Walkable Supermarkets</option>
              <option value="instant_delivery">10-Min Quick Delivery (Blinkit/Zepto)</option>
              <option value="any">Any Grocery Stores Nearby</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          MoveWise will orchestrate SerpApi searches across all your standard and custom parameters.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          Launch MoveWise Agent →
        </button>
      </div>
    </form>
  );
}
