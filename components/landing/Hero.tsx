"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Building2, Dumbbell, Clock, ShieldCheck, Search, ChevronRight } from "lucide-react";

export function Hero() {
  const sampleScenarios = [
    {
      city: "Bangalore",
      office: "Whitefield",
      budget: "₹25,000",
      commute: "< 30 mins",
      gym: "< 2.0 km",
      prompt: "I'm moving to Bangalore for a ₹15 LPA software job. My office is in Whitefield. My monthly housing budget is ₹25,000. I want a commute under 30 minutes and a gym within 2 km.",
    },
    {
      city: "Hyderabad",
      office: "Hitec City",
      budget: "₹28,000",
      commute: "< 25 mins",
      gym: "< 1.5 km",
      prompt: "Relocating to Hyderabad for an engineering role at Hitec City. Budget ₹28k/month for a 1BHK/2BHK. Need good cafes, near metro and a gym within 1.5 km.",
    },
    {
      city: "Pune",
      office: "Hinjawadi",
      budget: "₹20,000",
      commute: "< 25 mins",
      gym: "< 1.0 km",
      prompt: "Moving to Pune for a tech job in Hinjawadi. Monthly budget is ₹20,000. Looking for an energetic neighborhood with Cult.fit and under 25 mins commute.",
    },
  ];

  const [activeScenario, setActiveScenario] = useState(0);
  const current = sampleScenarios[activeScenario];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-50/70 via-teal-50/20 to-transparent -z-10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-teal-800 backdrop-blur-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          <span>SerpApi Hackathon 2026 — AI Agents Track</span>
        </div>

        {/* Hero Title & Pitch */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-6xl max-w-4xl mx-auto leading-tight sm:leading-none">
          Don&apos;t just find a place. <br />
          <span className="text-teal-600">Find where you fit.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Your autonomous AI relocation agent dynamically researches neighborhoods, rental market ranges, commute times, gyms, restaurants and local community reviews for any city.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/plan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 transition-all hover:scale-[1.02]"
          >
            Start Relocation Agent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Interactive Dynamic Prompt Preview Card */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden text-left">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Dynamic Multi-City Relocation Agent</span>
            </div>
            
            {/* Scenario Switcher Tabs */}
            <div className="flex items-center gap-1">
              {sampleScenarios.map((sc, idx) => (
                <button
                  key={sc.city}
                  type="button"
                  onClick={() => setActiveScenario(idx)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    activeScenario === idx
                      ? "bg-teal-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {sc.city}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed italic">
              &ldquo;{current.prompt}&rdquo;
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Office Anchor</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 text-teal-600" /> {current.office} ({current.city})
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Monthly Budget</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <span className="text-teal-600 font-bold">₹</span> {current.budget} / mo
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Max Commute</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-teal-600" /> {current.commute}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Gym Proximity</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Dumbbell className="h-3.5 w-3.5 text-teal-600" /> {current.gym}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Zero Hallucinated Rents (Verified Ranges)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Search className="h-4 w-4 text-teal-600" />
            <span>Powered by SerpApi Multi-Engine Search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Transparent Weighted Matching Model</span>
          </div>
        </div>
      </div>
    </section>
  );
}
