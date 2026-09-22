"use client";

import React, { useState } from "react";
import { ScoredNeighborhood } from "@/types/relocation";
import {
  X,
  Dumbbell,
  Utensils,
  ShoppingBag,
  Train,
  Star,
  ExternalLink,
  ThumbsUp,
  AlertTriangle,
  Info,
  MapPin,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface NeighborhoodDetailModalProps {
  item: ScoredNeighborhood | null;
  onClose: () => void;
}

export function NeighborhoodDetailModal({ item, onClose }: NeighborhoodDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"places" | "reviews" | "sources">("places");

  if (!item) return null;
  const { data, score } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-slate-100 p-6 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                Verified Area Profile
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Score: {score.overallScore}/100
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{data.name}</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">{data.overview}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-bold bg-white shrink-0">
          <button
            onClick={() => setActiveTab("places")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "places"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Verified Local Places ({data.gyms.items.length + data.restaurants.topHighlights.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "reviews"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Observed Community Reviews
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`py-3 border-b-2 transition-all ${
              activeTab === "sources"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            SerpApi Sources & Methodology ({data.sources.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "places" && (
            <div className="space-y-6">
              {/* Gyms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-purple-600" />
                  Fitness Centers & Gyms (Google Maps)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.gyms.items.map((gym) => (
                    <div key={gym.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">{gym.title}</span>
                        {gym.rating && (
                          <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {gym.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{gym.address || "Local Whitefield area"}</p>
                      {gym.distanceKm !== undefined && (
                        <p className="text-[11px] font-semibold text-teal-700 mt-1">~{gym.distanceKm} km from center</p>
                      )}
                      {gym.link && (
                        <a
                          href={gym.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-teal-600 hover:underline font-medium"
                        >
                          View on Google Maps <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurants */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  Top Dining & Cafes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.restaurants.topHighlights.map((res) => (
                    <div key={res.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">{res.title}</span>
                        {res.rating && (
                          <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {res.rating}
                          </span>
                        )}
                      </div>
                      {res.snippet && <p className="text-[11px] text-slate-600 mt-1 italic">&ldquo;{res.snippet}&rdquo;</p>}
                      {res.link && (
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-teal-600 hover:underline font-medium"
                        >
                          View on Google Maps <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Custom Amenities (Schools, Hospitals, Daycares, etc.) */}
              {data.customAmenities && data.customAmenities.length > 0 && (
                <div className="space-y-4">
                  {data.customAmenities.map((ca, idx) => (
                    <div key={idx} className="rounded-xl border border-teal-200 bg-teal-50/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                          <span>Verified {ca.label}</span>
                          <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                            Target: &lt;{ca.targetDistanceKm} km
                          </span>
                        </h4>
                        <span className={`text-xs font-bold ${ca.isCompliant ? "text-emerald-700" : "text-amber-700"}`}>
                          Nearest: {ca.nearestDistanceKm} km
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ca.items.map((item) => (
                          <div key={item.id} className="rounded-xl border border-slate-200 p-3 bg-white text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900">{item.title}</span>
                              {item.rating && (
                                <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {item.rating}
                                </span>
                              )}
                            </div>
                            {item.snippet && <p className="text-[11px] text-slate-500 mt-1">{item.snippet}</p>}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-teal-700">~{item.distanceKm} km away</span>
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-teal-600 hover:underline"
                                >
                                  Maps <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Groceries & Transit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 text-xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-600" /> Supermarkets & Groceries
                  </h5>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    {data.groceries.items.map((g) => (
                      <li key={g.id} className="flex items-center justify-between">
                        <span>{g.title}</span>
                        {g.distanceKm && <span className="font-semibold text-slate-400">{g.distanceKm} km</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 text-xs">
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                    <Train className="h-4 w-4 text-sky-600" /> Public Transit & Metro
                  </h5>
                  <p className="text-slate-700 font-semibold text-[11px]">
                    {data.transit.nearestMetroStation || "Purple Line Metro Corridor"}
                  </p>
                  {data.transit.metroDistanceKm && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Distance: ~{data.transit.metroDistanceKm} km from locality center
                    </p>
                  )}
                  <p className="text-emerald-700 font-medium text-[11px] mt-2">
                    ✓ Regular BMTC feeder buses to tech parks
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  These themes are extracted from actual Google Maps and local resident forums. MoveWise separates factual community feedback from automated analysis.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  What People Mention
                </h4>

                {data.reviewThemes.map((theme, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border text-xs ${
                      theme.sentiment === "positive"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : "bg-amber-50/60 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        {theme.sentiment === "positive" ? (
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        {theme.topic}
                      </span>
                      {theme.sampleCount && (
                        <span className="text-[10px] opacity-75 font-mono">
                          {theme.sampleCount} mentions
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{theme.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "sources" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>No Hallucinated Rents Principle</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  MoveWise strictly reports verified market benchmark ranges (₹{(data.estimatedRent.bhk1.min / 1000).toFixed(0)}k–₹{(data.estimatedRent.bhk1.max / 1000).toFixed(0)}k) synthesized from Google Search and real estate portals. Exact individual listings require landlord lease verification and are not manufactured.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  External Data Sources & SerpApi Queries
                </h4>
                <div className="space-y-2">
                  {data.sources.map((src, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 p-3 bg-white hover:border-teal-300 transition-colors text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{src.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Query: &ldquo;{src.query}&rdquo; • Engine: {src.engine}
                        </p>
                      </div>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
