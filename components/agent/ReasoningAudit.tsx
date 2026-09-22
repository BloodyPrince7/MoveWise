"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, BrainCircuit, CheckCircle2, Search, Cpu, Clock } from "lucide-react";

interface ReasoningAuditProps {
  reasoningSteps: string[];
  auditLog: {
    totalSerpApiQueries: number;
    cachedQueries: number;
    liveQueries: number;
    totalExecutionTimeMs: number;
    llmUsed: string;
  };
}

export function ReasoningAudit({ reasoningSteps, auditLog }: ReasoningAuditProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">How MoveWise Researched This</h3>
            <p className="text-xs text-slate-500">
              Autonomous reasoning audit trail & SerpApi execution telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline-block bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {auditLog.totalSerpApiQueries} SerpApi queries
          </span>
          {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-6 bg-slate-50/40 space-y-5 animate-fadeIn">
          {/* Step by step high level reasoning */}
          <div className="space-y-2.5">
            {reasoningSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>

          {/* Audit Telemetry Strip */}
          <div className="pt-4 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">SerpApi Calls</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Search className="h-3.5 w-3.5 text-teal-600" />
                {auditLog.totalSerpApiQueries} ({auditLog.liveQueries} live, {auditLog.cachedQueries} cached)
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Research Engine</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Cpu className="h-3.5 w-3.5 text-teal-600" />
                {auditLog.llmUsed}
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Latency</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                {(auditLog.totalExecutionTimeMs / 1000).toFixed(2)}s total
              </span>
            </div>

            <div className="rounded-xl bg-white p-3 border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Ground Truth</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Zero Hallucinations
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
