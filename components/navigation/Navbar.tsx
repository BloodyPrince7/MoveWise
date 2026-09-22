"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Settings, ArrowRight } from "lucide-react";
import { ApiKeysModal } from "../settings/ApiKeysModal";

export function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">MoveWise</span>
                <span className="inline-flex items-center rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200/60">
                  AI Agent
                </span>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              Start Relocation Agent
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title="API Keys & Settings"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>

      <ApiKeysModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
