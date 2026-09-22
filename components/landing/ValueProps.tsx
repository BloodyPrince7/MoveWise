import React from "react";
import { Check, X, ShieldAlert, Sparkles, SlidersHorizontal, Scale, Eye } from "lucide-react";

export function ValueProps() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">The Difference</span>
          <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
            Search Box with Filters vs. MoveWise Autonomous Agent
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional Way */}
          <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 font-bold">
                <X className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">The Traditional Real Estate Portal</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Requires you to already know neighborhoods by name.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Flooded with fake, bait-and-switch listings and outdated pricing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Forces you to open 10 tabs to cross-check gym distance, traffic, and supermarkets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 mt-0.5">•</span>
                <span>Zero consideration for peak-hour road bottlenecks or daily lifestyle fit.</span>
              </li>
            </ul>
          </div>

          {/* MoveWise Agent */}
          <div className="rounded-2xl bg-gradient-to-b from-teal-50/50 to-white p-6 sm:p-8 border-2 border-teal-500/30 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">MoveWise AI Relocation Agent</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Autonomous Discovery:</strong> Recommends optimal neighborhoods even if you have never visited the city.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>SerpApi Ground Truth:</strong> Verifies actual gyms, restaurants, and grocery hubs on Google Maps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Transparent Scoring:</strong> Clear 100-point match breakdown with weighted budget, commute, and lifestyle factors.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 font-bold" />
                <span><strong>Explicit Trade-offs:</strong> Never hides the downsides — highlights peak traffic jams, higher rents, or water issues.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
