"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { NaturalLanguageInput } from "@/components/questionnaire/NaturalLanguageInput";
import { StructuredForm } from "@/components/questionnaire/StructuredForm";
import { AgentActivityPanel } from "@/components/agent/AgentActivityPanel";
import { DEFAULT_DEMO_CONSTRAINTS } from "@/lib/serpapi/demoData";
import { AgentStep, UserConstraints } from "@/types/relocation";
import { Sparkles } from "lucide-react";

function PlanContent() {
  const router = useRouter();

  const [constraints, setConstraints] = useState<UserConstraints>(DEFAULT_DEMO_CONSTRAINTS);
  const [isResearching, setIsResearching] = useState(false);
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleExtracted = (extracted: Partial<UserConstraints>, originalPrompt: string) => {
    setConstraints((prev) => ({
      ...prev,
      ...extracted,
      additionalNotes: originalPrompt,
    }));
  };

  const handleLaunchAgent = async () => {
    setIsResearching(true);

    const serpKey = typeof window !== "undefined" ? localStorage.getItem("movewise_serpapi_key") || "" : "";
    const geminiKey = typeof window !== "undefined" ? localStorage.getItem("movewise_gemini_key") || "" : "";

    const payloadConstraints = {
      ...constraints,
      demoMode: false,
    };

    // Step progression
    const initialSteps: AgentStep[] = [
      { id: "1", label: "Understanding your requirements", detail: `Parsing constraints for ${constraints.city}`, status: "in_progress" },
      { id: "2", label: `Finding suitable candidate areas around ${constraints.officeLocation}`, detail: `Dynamically evaluating residential hubs in ${constraints.city}`, status: "pending" },
      { id: "3", label: "Researching local housing & rental market", detail: `Querying ${constraints.accommodationType} market benchmarks via SerpApi`, status: "pending" },
      { id: "4", label: "Checking commute options & peak-hour traffic", detail: "Assessing transit lines and arterial road bottlenecks", status: "pending" },
      { id: "5", label: `Searching gyms within ${constraints.maxGymDistKm} km`, detail: "Scanning Google Maps for verified gyms and fitness studios", status: "pending" },
      { id: "6", label: "Comparing restaurants & grocery walkability", detail: "Evaluating dining density and quick-commerce availability", status: "pending" },
      { id: "7", label: "Searching first-week temporary hotels", detail: `Finding short-term stays near ${constraints.officeLocation}`, status: "pending" },
      { id: "8", label: "Analyzing local community reviews & sentiment", detail: "Synthesizing resident feedback and neighborhood trade-offs", status: "pending" },
      { id: "9", label: "Building your personalized shortlist", detail: "Applying weighted multi-factor scoring model", status: "pending" },
    ];

    setActiveSteps(initialSteps);

    // Dynamic animation
    const progressInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        setActiveSteps((steps) =>
          steps.map((s, idx) => {
            if (idx < next) return { ...s, status: "completed" };
            if (idx === next) return { ...s, status: "in_progress" };
            return s;
          })
        );
        return next;
      });
    }, 450);

    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          constraints: payloadConstraints,
          serpApiKey: serpKey,
          geminiApiKey: geminiKey,
        }),
      });

      const data = await res.json();
      clearInterval(progressInterval);

      if (res.ok && data.data) {
        setActiveSteps((steps) => steps.map((s) => ({ ...s, status: "completed" })));
        if (typeof window !== "undefined") {
          sessionStorage.setItem("movewise_latest_results", JSON.stringify(data.data));
        }
        setTimeout(() => {
          router.push("/results");
        }, 500);
      } else {
        alert(data.error || "Research could not be completed. Please retry.");
        setIsResearching(false);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Agent execution error:", err);
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 text-xs font-semibold text-teal-800 mb-2">
            <Sparkles className="h-3 w-3 text-teal-600" />
            <span>AI Relocation Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tell MoveWise Where You&apos;re Moving
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Describe your preferences in plain language or use the sliders below. MoveWise will dynamically discover candidate areas for any city.
          </p>
        </div>

        {isResearching ? (
          <div className="mt-8">
            <AgentActivityPanel
              steps={activeSteps}
              currentRunningIndex={currentStepIndex}
              totalSteps={activeSteps.length || 9}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <NaturalLanguageInput onExtracted={handleExtracted} />
            <StructuredForm
              constraints={constraints}
              onChange={setConstraints}
              onSubmit={handleLaunchAgent}
              isLoading={isResearching}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading MoveWise Planner...</div>}>
      <PlanContent />
    </Suspense>
  );
}
