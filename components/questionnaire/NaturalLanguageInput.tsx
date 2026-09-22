"use client";

import React, { useState } from "react";
import { Sparkles, Wand2, RefreshCw } from "lucide-react";
import { UserConstraints } from "@/types/relocation";

interface NaturalLanguageInputProps {
  onExtracted: (constraints: Partial<UserConstraints>, originalPrompt: string) => void;
  initialPrompt?: string;
}

export function NaturalLanguageInput({ onExtracted, initialPrompt }: NaturalLanguageInputProps) {
  const defaultPrompt =
    "I'm moving to Bangalore for a ₹15 LPA software job. My office is in Whitefield. My monthly housing budget is ₹25,000. I want a commute under 30 minutes and a gym within 2 km.";

  const [prompt, setPrompt] = useState(initialPrompt || defaultPrompt);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async (textToExtract?: string) => {
    const text = textToExtract || prompt;
    if (!text.trim()) return;

    setIsExtracting(true);
    try {
      const geminiKey = typeof window !== "undefined" ? localStorage.getItem("movewise_gemini_key") || "" : "";
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, apiKey: geminiKey }),
      });
      const data = await res.json();
      if (res.ok && data.constraints) {
        onExtracted(data.constraints, text);
      }
    } catch (e) {
      console.error("Extraction error:", e);
    } finally {
      setIsExtracting(false);
    }
  };

  const samplePrompts = [
    {
      label: "Bangalore / Whitefield (₹25k, <30m)",
      text: "I'm moving to Bangalore for a software job. My office is in Whitefield. My monthly housing budget is ₹25,000. I want a commute under 30 minutes and a gym within 2 km.",
    },
    {
      label: "Hyderabad / Hitec City (₹28k, Metro)",
      text: "Moving to Hyderabad for an engineering job at Hitec City. Budget ₹28k/month for a 1BHK. Need to be near the metro, good cafes, and a gym within 1.5 km.",
    },
    {
      label: "Pune / Hinjawadi (₹20k, Gym)",
      text: "Relocating to Pune for a software job in Hinjawadi. Monthly budget is ₹20,000. Want a lively neighborhood with Cult.fit and under 25 minutes commute.",
    },
    {
      label: "Bangalore / Bellandur (₹30k, 2BHK)",
      text: "Joining a company in Bellandur Ecospace Bangalore. Can spend up to ₹30,000/month for a 2BHK. Need good restaurants and under 25 mins commute.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Wand2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Describe Your Move in Plain English</h3>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
          AI Parameter Extraction
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Enter your destination city, workplace, budget, and lifestyle priorities. Gemini 3.5 Flash-Lite extracts constraints dynamically.
      </p>

      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. I'm moving to Hyderabad for a software job in Hitec City. Budget is ₹25,000/month..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all resize-none font-medium leading-relaxed"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Quick templates:</span>
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sp.text);
                  handleExtract(sp.text);
                }}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {sp.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleExtract()}
            disabled={isExtracting || !prompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs shrink-0"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-400" />
                Extracting Parameters...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                Parse Constraints
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
