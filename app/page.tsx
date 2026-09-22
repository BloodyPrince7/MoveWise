import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ValueProps } from "@/components/landing/ValueProps";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ValueProps />

        {/* Bottom CTA section */}
        <section className="py-16 bg-white border-t border-slate-200/80 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Ready to find your ideal neighborhood?
            </h2>
            <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
              Give MoveWise your relocation constraints. Watch the agent plan, search, analyze, and build your personalized shortlist dynamically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition-all hover:scale-[1.02]"
              >
                Start Relocation Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white">
              <Compass className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-800">MoveWise</span>
            <span>— AI Relocation Agent</span>
          </div>
          <p>
            Built for SerpApi India Hackathon 2026 (AI Agents Track) • Powered by SerpApi & Google Gemini
          </p>
          <div className="flex gap-4">
            <Link href="/plan" className="hover:text-slate-800 underline">
              Plan My Move
            </Link>
            <a
              href="https://serpapi.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-800 underline"
            >
              SerpApi.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
