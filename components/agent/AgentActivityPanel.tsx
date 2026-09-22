"use client";

import React, { useState } from "react";
import { AgentStep } from "@/types/relocation";
import { CheckCircle2, Loader2, Circle, AlertCircle, Terminal, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface AgentActivityPanelProps {
  steps: AgentStep[];
  currentRunningIndex: number;
  totalSteps: number;
}

export function AgentActivityPanel({ steps, currentRunningIndex, totalSteps }: AgentActivityPanelProps) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-200/90 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">MoveWise Autonomous Agent</h3>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200 animate-pulse">
                Live Researching
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Multi-engine SerpApi queries executing across Google Maps, Search & Hotels
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
            {Math.min(currentRunningIndex + 1, totalSteps)} of {totalSteps} Tasks
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-teal-600 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.round(((currentRunningIndex + 1) / totalSteps) * 100)}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isCurrent = step.status === "in_progress";
          const isPending = step.status === "idle" || step.status === "pending";
          const isError = step.status === "error";

          return (
            <div
              key={step.id}
              className={`rounded-xl p-3 text-xs transition-all border ${
                isCurrent
                  ? "bg-teal-50/60 border-teal-200 shadow-xs"
                  : isDone
                  ? "bg-slate-50/70 border-slate-100 text-slate-700"
                  : "bg-white border-transparent text-slate-400"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-600 font-bold" />}
                    {isCurrent && <Loader2 className="h-4 w-4 text-teal-600 animate-spin" />}
                    {isPending && <Circle className="h-4 w-4 text-slate-300" />}
                    {isError && <AlertCircle className="h-4 w-4 text-rose-500" />}
                  </div>

                  <div>
                    <span className={`font-semibold ${isCurrent ? "text-teal-950 font-bold text-sm" : isDone ? "text-slate-900" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                    {step.detail && (
                      <p className={`mt-0.5 text-[11px] ${isCurrent ? "text-teal-700 font-medium" : "text-slate-500"}`}>
                        {step.detail}
                      </p>
                    )}
                  </div>
                </div>

                {step.queriesRun && step.queriesRun.length > 0 && (
                  <span className="shrink-0 text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {step.queriesRun.length} queries
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Query Log Drawer */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            <span>Agent Query Inspector</span>
          </span>
          {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLogs && (
          <div className="mt-2.5 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-teal-400 space-y-1.5 max-h-40 overflow-y-auto">
            <p className="text-slate-400">// Real-time SerpApi queries dispatched</p>
            {steps
              .flatMap((s) => s.queriesRun || [])
              .map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span className="text-slate-200">{q}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
