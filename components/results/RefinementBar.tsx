"use client";

import React, { useState } from "react";
import { Sparkles, Send, RefreshCw, MessageSquare } from "lucide-react";
import { AgentResearchResponse, RefinementResult } from "@/types/relocation";

interface RefinementBarProps {
  currentResponse: AgentResearchResponse;
  onRefined: (result: any) => void;
}

export function RefinementBar({ currentResponse, onRefined }: RefinementBarProps) {
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAgentMessage, setLastAgentMessage] = useState<string | null>(null);

  const quickPrompts = [
    "Increase my budget to ₹30k",
    "I don't care about gyms anymore",
    "I want something closer to the metro",
    "Show me cheaper areas (under ₹20k)",
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || message;
    if (!text.trim()) return;

    setIsProcessing(true);
    setLastAgentMessage(null);

    try {
      const geminiKey = typeof window !== "undefined" ? localStorage.getItem("movewise_gemini_key") || "" : "";
      const res = await fetch("/api/agent/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResponse,
          userMessage: text,
          geminiApiKey: geminiKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        setLastAgentMessage(data.data.agentResponse);
        onRefined(data.data);
        setMessage("");
      }
    } catch (e) {
      console.error("Refinement error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Refine Your Move With Agent</h3>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
          Interactive Agent Chat
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Changed your mind? Tell MoveWise in plain language. The agent re-evaluates candidate rankings and updates the trade-off matrix instantly.
      </p>

      {/* Agent Response Toast */}
      {lastAgentMessage && (
        <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-950 flex items-start gap-2.5 animate-fadeIn">
          <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-teal-900 mb-0.5">MoveWise Agent:</span>
            <p className="leading-relaxed">{lastAgentMessage}</p>
          </div>
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Increase my budget to ₹30k, or I don't care about gyms..."
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all font-medium"
        />

        <button
          type="submit"
          disabled={isProcessing || !message.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition-all shrink-0"
        >
          {isProcessing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <span>Refine</span>
              <Send className="h-3 w-3" />
            </>
          )}
        </button>
      </form>

      {/* Quick chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 mr-1">Try saying:</span>
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(promptText)}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
}
