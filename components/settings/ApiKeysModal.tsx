"use client";

import React, { useState, useEffect } from "react";
import { Key, CheckCircle, AlertCircle, X, Shield, Sparkles, RefreshCw } from "lucide-react";

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export function ApiKeysModal({ isOpen, onClose, onKeysUpdated }: ApiKeysModalProps) {
  const [serpApiKey, setSerpApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const [testingSerpApi, setTestingSerpApi] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSerp = localStorage.getItem("movewise_serpapi_key") || "";
      const storedGemini = localStorage.getItem("movewise_gemini_key") || "";
      const storedDemo = localStorage.getItem("movewise_demo_mode");

      setSerpApiKey(storedSerp);
      setGeminiApiKey(storedGemini);
      // Default to demoMode true if not explicitly set to false
      setDemoMode(storedDemo === null ? true : storedDemo === "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("movewise_serpapi_key", serpApiKey.trim());
      localStorage.setItem("movewise_gemini_key", geminiApiKey.trim());
      localStorage.setItem("movewise_demo_mode", String(demoMode));
    }
    onKeysUpdated?.();
    onClose();
  };

  const handleTestSerpApi = async () => {
    setTestingSerpApi(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/serpapi/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: serpApiKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || "SerpApi connected successfully!" });
      } else {
        setTestResult({ success: false, message: data.message || "Connection failed. Check API key." });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || "Failed to reach test server." });
    } finally {
      setTestingSerpApi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">API Keys & Research Engine</h3>
            <p className="text-xs text-slate-500">Configure SerpApi and Google Gemini for live queries</p>
          </div>
        </div>

        {/* Quota Saver Toggle */}
        <div className="my-5 p-3.5 rounded-xl bg-teal-50 border border-teal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-teal-900">Quota Saver Mode</p>
                <p className="text-xs text-teal-700">Synthesizes dynamic neighborhood parameters without consuming API quota</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* SerpApi Key Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SerpApi API Key <span className="font-normal text-slate-500">(Google Maps, Search, Hotels)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={serpApiKey}
                onChange={(e) => setSerpApiKey(e.target.value)}
                placeholder="Enter SerpApi key (or use Demo Mode)"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="button"
                onClick={handleTestSerpApi}
                disabled={testingSerpApi || !serpApiKey}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                {testingSerpApi ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Test"}
              </button>
            </div>
            {testResult && (
              <p
                className={`mt-1.5 flex items-center gap-1 text-xs ${
                  testResult.success ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {testResult.success ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                {testResult.message}
              </p>
            )}
          </div>

          {/* Gemini API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key <span className="font-normal text-teal-600">(gemini-3.5-flash-lite)</span>
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter Gemini API key (optional, heuristic fallback built-in)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 flex items-start gap-2 border border-slate-100">
            <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Keys entered here are stored in your local browser session and passed securely via server-side headers. They are never exposed to external clients.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
