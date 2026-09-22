import React from "react";
import { BrainCircuit, Search, Database, BarChart3, Scale, Award, MapPin, Building, Hotel, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Plan",
      icon: BrainCircuit,
      desc: "Decomposes your lifestyle requirements and workplace anchor into distinct research sub-tasks.",
      tag: "Gemini 3.5 Flash-Lite",
    },
    {
      step: "02",
      title: "Search",
      icon: Search,
      desc: "Executes concurrent queries across Google Maps, Google Search, and Google Hotels.",
      tag: "SerpApi Multi-Engine",
    },
    {
      step: "03",
      title: "Collect",
      icon: Database,
      desc: "Harvests real-time rental listings, verified gyms, restaurants, supermarkets, and metro stops.",
      tag: "Verified Facts Only",
    },
    {
      step: "04",
      title: "Analyze",
      icon: BarChart3,
      desc: "Evaluates commute times, transit feasibility, and reviews sentiment (pros vs bottlenecks).",
      tag: "No Fabricated Commutes",
    },
    {
      step: "05",
      title: "Compare",
      icon: Scale,
      desc: "Calculates a transparent weighted multi-factor match score against your specific constraints.",
      tag: "Customizable Weights",
    },
    {
      step: "06",
      title: "Recommend",
      icon: Award,
      desc: "Produces an actionable shortlist with explicit trade-offs and first-week temporary hotels.",
      tag: "Actionable Shortlist",
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">The Agentic Research Loop</span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            From Constraints to Decisions in Seconds
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            MoveWise replaces hours of manual browsing across real estate portals, map tabs, and commute calculators with an autonomous research workflow.
          </p>
        </div>

        {/* 6 Stage Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl bg-slate-50/70 p-5 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                      {item.step}
                    </span>
                    <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-teal-600 shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="inline-block text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SerpApi Material Contribution Spotlight */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
                SerpApi Deep Integration
              </span>
              <h3 className="mt-2 text-xl sm:text-2xl font-bold">
                Why SerpApi is the Backbone of MoveWise
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rather than relying on static training data or fabricated listings, MoveWise queries SerpApi live to inspect current local reality on the ground:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-1">
                  <MapPin className="h-4 w-4" /> Google Maps
                </div>
                <p className="text-[11px] text-slate-200">
                  Exact gym distances, opening hours, verified ratings & transit stops
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-1">
                  <Building className="h-4 w-4" /> Google Search
                </div>
                <p className="text-[11px] text-slate-200">
                  Current locality rent averages, infrastructure news & resident forums
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-1">
                  <Hotel className="h-4 w-4" /> Google Hotels
                </div>
                <p className="text-[11px] text-slate-200">
                  Nightly rates, amenities & booking links for first-week transitional stay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
