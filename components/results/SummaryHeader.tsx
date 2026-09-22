import React from "react";
import { UserConstraints } from "@/types/relocation";
import { Building2, Coins, Clock, Dumbbell, RotateCcw, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SummaryHeaderProps {
  constraints: UserConstraints;
  totalCandidateAreas: number;
}

export function SummaryHeader({
  constraints,
  totalCandidateAreas,
}: SummaryHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Main Header Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Autonomous Relocation Plan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your {constraints.city} Relocation Plan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            MoveWise dynamically analyzed {totalCandidateAreas} candidate localities matching your ₹{(constraints.budgetMonthlyInr / 1000).toFixed(0)}k budget and {constraints.officeLocation} workplace commute.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Adjust Constraints
          </Link>
        </div>
      </div>

      {/* Constraints KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Workplace Anchor</span>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
            <Building2 className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="truncate">{constraints.officeLocation} ({constraints.city})</span>
          </p>
        </div>

        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Monthly Budget</span>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-teal-600 shrink-0" />
            <span>₹{(constraints.budgetMonthlyInr / 1000).toFixed(0)}k / month</span>
          </p>
        </div>

        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Commute Target</span>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-teal-600 shrink-0" />
            <span>&lt; {constraints.maxCommuteMin} mins</span>
          </p>
        </div>

        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Gym Preference</span>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4 text-teal-600 shrink-0" />
            <span>{constraints.gymRequired ? `< ${constraints.maxGymDistKm} km` : "Optional"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
