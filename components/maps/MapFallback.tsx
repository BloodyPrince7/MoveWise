import React from "react";
import { ScoredNeighborhood } from "@/types/relocation";
import { MapPin, Navigation, Dumbbell, Utensils, Train } from "lucide-react";

interface MapFallbackProps {
  neighborhoods: ScoredNeighborhood[];
  officeLocationName: string;
}

export function MapFallback({ neighborhoods, officeLocationName }: MapFallbackProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <MapPin className="h-5 w-5 text-teal-600" />
        <h3 className="font-bold text-base">Location Grid (Commute Corridor)</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Target workplace: <strong>{officeLocationName}</strong>. Showing candidate areas ranked by commute proximity and amenity access:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {neighborhoods.map((n, idx) => (
          <div key={n.data.id} className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">#{idx + 1} {n.data.name}</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {n.score.overallScore}/100
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-slate-400" />
                <span>Commute: {n.data.commute.estimatedMinutes}m (~{n.data.commute.distanceKm} km)</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
                <span>Gym: {n.data.gyms.nearestDistanceKm} km ({n.data.gyms.items[0]?.title || "Cult.fit"})</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Train className="h-3.5 w-3.5 text-slate-400" />
                <span>Transit: {n.data.transit.nearestMetroStation || "Bus Connected"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
