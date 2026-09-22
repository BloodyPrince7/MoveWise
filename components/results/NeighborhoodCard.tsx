import React from "react";
import { ScoredNeighborhood } from "@/types/relocation";
import {
  Check,
  AlertTriangle,
  Clock,
  Dumbbell,
  Utensils,
  ShoppingBag,
  Train,
  ArrowUpRight,
  Sparkles,
  Info,
} from "lucide-react";

interface NeighborhoodCardProps {
  item: ScoredNeighborhood;
  rank: number;
  isSelected?: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}

export function NeighborhoodCard({
  item,
  rank,
  isSelected,
  onSelect,
  onOpenDetails,
}: NeighborhoodCardProps) {
  const { data, score } = item;
  const bhk1Rent = data.estimatedRent.bhk1;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl bg-white p-6 transition-all border cursor-pointer ${
        isSelected
          ? "border-teal-500 shadow-md ring-2 ring-teal-500/20"
          : "border-slate-200/90 hover:border-teal-300 hover:shadow-sm"
      }`}
    >
      {/* Top row: Rank badge, Name, Match Score */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
              #{rank}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{data.name}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">{data.overview}</p>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 rounded-xl bg-teal-50 border border-teal-200/80 px-3 py-1 text-teal-800 font-extrabold text-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>{score.overallScore}</span>
            <span className="text-[10px] font-normal text-teal-600">/100</span>
          </div>
          <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">Match Score</span>
        </div>
      </div>

      {/* Rent & Commute Strip */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Estimated Rent</span>
          <span className="font-bold text-slate-800 text-sm mt-0.5 block">
            ₹{(bhk1Rent.min / 1000).toFixed(0)}k–₹{(bhk1Rent.max / 1000).toFixed(0)}k
            <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
          </span>
          <span className="text-[10px] text-teal-700 block mt-0.5">
            1BHK (Estimated area avg)
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Commute</span>
          <span className="font-bold text-slate-800 text-sm mt-0.5 block flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            {data.commute.estimatedMinutes}–{data.commute.peakMinutes} min
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {data.commute.distanceKm} km via {data.commute.mode.split("/")[0]}
          </span>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-purple-600 shrink-0" />
          <span className="truncate">
            <strong>{data.gyms.nearestDistanceKm} km</strong> to gym
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Utensils className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="truncate">
            <strong>{data.restaurants.countFound}+</strong> eateries
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Groceries nearby</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2 sm:col-span-3">
          <Train className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span className="truncate text-slate-600 text-[11px]">
            {data.transit.nearestMetroStation ? (
              <>
                <strong>{data.transit.nearestMetroStation}</strong> ({data.transit.metroDistanceKm} km)
              </>
            ) : (
              "Direct BMTC Bus Access"
            )}
          </span>
        </div>
      </div>

      {/* Dynamic Custom Requirements Badges (Schools, Hospitals, etc.) */}
      {data.customAmenities && data.customAmenities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {data.customAmenities.map((ca, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                ca.isCompliant
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <span>{ca.isCompliant ? "✓" : "•"}</span>
              <span>{ca.label}: <strong>{ca.nearestDistanceKm} km</strong></span>
              {ca.items[0] && (
                <span className="text-[10px] opacity-75 font-normal truncate max-w-[140px]">
                  ({ca.items[0].title})
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Why it matches & Trade-offs */}
      <div className="space-y-3 text-xs mb-5">
        {/* Why it matches */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1.5">
            Why this area matched
          </span>
          <ul className="space-y-1 text-slate-700">
            {score.whyMatched.slice(0, 3).map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 font-bold shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trade-offs */}
        {score.tradeOffs.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1.5">
              Trade-offs to consider
            </span>
            <ul className="space-y-1 text-slate-600">
              {score.tradeOffs.slice(0, 2).map((tradeOff, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span>{tradeOff}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
        >
          <span>Explore Verified Places & Reviews</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>

        <span className="text-[10px] text-slate-400 font-mono">
          {data.sources.length} citations
        </span>
      </div>
    </div>
  );
}
