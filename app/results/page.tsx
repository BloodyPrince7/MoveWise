"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { SummaryHeader } from "@/components/results/SummaryHeader";
import { NeighborhoodCard } from "@/components/results/NeighborhoodCard";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import { HotelsSection } from "@/components/results/HotelsSection";
import { NeighborhoodDetailModal } from "@/components/results/NeighborhoodDetailModal";
import { RefinementBar } from "@/components/results/RefinementBar";
import { SourceCitations } from "@/components/results/SourceCitations";
import { ReasoningAudit } from "@/components/agent/ReasoningAudit";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { MapFallback } from "@/components/maps/MapFallback";
import { AgentResearchResponse, ScoredNeighborhood } from "@/types/relocation";
import { DEFAULT_DEMO_CONSTRAINTS } from "@/lib/serpapi/demoData";
import { executeRelocationResearch } from "@/lib/agent/researcher";
import { Loader2, Sparkles, MapPin, Building2, SlidersHorizontal } from "lucide-react";

function ResultsContent() {
  const router = useRouter();
  const [response, setResponse] = useState<AgentResearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>();
  const [detailModalItem, setDetailModalItem] = useState<ScoredNeighborhood | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // Attempt to load results from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("movewise_latest_results");
      if (stored) {
        try {
          const parsed: AgentResearchResponse = JSON.parse(stored);
          setResponse(parsed);
          setSelectedNeighborhoodId(parsed.neighborhoods[0]?.data.id);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse stored results:", e);
        }
      }
    }

    // If no stored results, generate Bangalore default demo snapshot
    const runDefaultDemo = async () => {
      try {
        const demoRes = await executeRelocationResearch(DEFAULT_DEMO_CONSTRAINTS);
        setResponse(demoRes);
        setSelectedNeighborhoodId(demoRes.neighborhoods[0]?.data.id);
      } catch (err) {
        console.error("Demo load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    runDefaultDemo();
  }, []);

  const handleRefined = (refinementData: {
    updatedConstraints: any;
    updatedNeighborhoods: ScoredNeighborhood[];
  }) => {
    if (!response) return;
    const updatedResponse: AgentResearchResponse = {
      ...response,
      userConstraints: refinementData.updatedConstraints,
      neighborhoods: refinementData.updatedNeighborhoods,
    };
    setResponse(updatedResponse);
    setSelectedNeighborhoodId(refinementData.updatedNeighborhoods[0]?.data.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("movewise_latest_results", JSON.stringify(updatedResponse));
    }
  };

  if (loading || !response) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/30 mb-4 animate-bounce">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">MoveWise Agent is Loading Results</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Retrieving candidate neighborhood scores and SerpApi local places...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Summary Strip */}
        <SummaryHeader
          constraints={response.userConstraints}
          totalCandidateAreas={response.neighborhoods.length}
        />

        {/* Follow-up Refinement Bar (placed prominent for conversational agent feel) */}
        <RefinementBar currentResponse={response} onRefined={handleRefined} />

        {/* Main Grid: Shortlist Cards + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shortlist Cards */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recommended Neighborhoods ({response.neighborhoods.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by budget fit, commute duration, and verified amenity proximity.
                </p>
              </div>
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Top match: {response.neighborhoods[0]?.data.name}
              </span>
            </div>

            <div className="space-y-4">
              {response.neighborhoods.map((item, idx) => (
                <NeighborhoodCard
                  key={item.data.id}
                  item={item}
                  rank={idx + 1}
                  isSelected={item.data.id === selectedNeighborhoodId}
                  onSelect={() => setSelectedNeighborhoodId(item.data.id)}
                  onOpenDetails={() => setDetailModalItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" /> Locality Map & Amenities
              </h3>
              <span className="text-[10px] text-slate-400">Click pins to inspect</span>
            </div>

            {!mapError ? (
              <InteractiveMap
                neighborhoods={response.neighborhoods}
                selectedNeighborhoodId={selectedNeighborhoodId}
                onSelectNeighborhood={(id) => setSelectedNeighborhoodId(id)}
                officeLocationName={response.userConstraints.officeLocation}
                hotels={response.temporaryHotels}
              />
            ) : (
              <MapFallback
                neighborhoods={response.neighborhoods}
                officeLocationName={response.userConstraints.officeLocation}
              />
            )}
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <ComparisonTable
          neighborhoods={response.neighborhoods}
          constraints={response.userConstraints}
        />

        {/* First-Week Temporary Hotels */}
        <HotelsSection
          hotels={response.temporaryHotels}
          officeLocation={response.userConstraints.officeLocation}
        />

        {/* Collapsible Reasoning & Telemetry Audit */}
        <ReasoningAudit
          reasoningSteps={response.agentReasoning}
          auditLog={response.auditLog}
        />

        {/* Sources & Citations */}
        <SourceCitations neighborhoods={response.neighborhoods} />
      </main>

      {/* Deep-dive Place & Review Modal */}
      {detailModalItem && (
        <NeighborhoodDetailModal
          item={detailModalItem}
          onClose={() => setDetailModalItem(null)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading MoveWise Results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
