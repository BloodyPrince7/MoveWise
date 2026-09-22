import React from "react";
import { ScoredNeighborhood, UserConstraints } from "@/types/relocation";
import { Sparkles, Check, AlertCircle } from "lucide-react";

interface ComparisonTableProps {
  neighborhoods: ScoredNeighborhood[];
  constraints: UserConstraints;
}

export function ComparisonTable({ neighborhoods, constraints }: ComparisonTableProps) {
  const topHoods = neighborhoods.slice(0, 4);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Side-by-Side Area Comparison</h3>
          <p className="text-xs text-slate-500">
            Compare candidate areas across rent ranges, verified gym proximity, peak commute, and daily amenities.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
          Ranked by Weighted Fit
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-bold text-slate-900 min-w-[140px]">Factor</th>
              {topHoods.map((item, idx) => (
                <th key={item.data.id} className="py-3 px-4 font-bold min-w-[170px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-slate-900 text-sm font-extrabold">{item.data.name}</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                    {item.score.overallScore}/100 Match
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Rent */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">
                1BHK Rent Range
                <span className="block text-[10px] text-slate-400 font-normal">Target: ₹{(constraints.budgetMonthlyInr / 1000).toFixed(0)}k</span>
              </td>
              {topHoods.map((item) => {
                const rent = item.data.estimatedRent.bhk1;
                const isUnder = rent.max <= constraints.budgetMonthlyInr;
                return (
                  <td key={item.data.id} className="py-3 px-4 font-medium">
                    <span className="font-bold text-slate-900">
                      ₹{(rent.min / 1000).toFixed(0)}k–₹{(rent.max / 1000).toFixed(0)}k
                    </span>
                    <span className={`block text-[10px] ${isUnder ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}`}>
                      {isUnder ? "✓ Within budget" : "• Upper range touches budget"}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Commute */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">
                Office Commute
                <span className="block text-[10px] text-slate-400 font-normal">Target: &lt; {constraints.maxCommuteMin}m</span>
              </td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4 font-medium">
                  <span className="font-bold text-slate-900">
                    {item.data.commute.estimatedMinutes}–{item.data.commute.peakMinutes} min
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    ~{item.data.commute.distanceKm} km ({item.data.commute.mode.split("/")[0]})
                  </span>
                </td>
              ))}
            </tr>

            {/* Gym */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">
                Nearest Gym
                <span className="block text-[10px] text-slate-400 font-normal">Target: &lt; {constraints.maxGymDistKm} km</span>
              </td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4 font-medium">
                  <span className="font-bold text-slate-900">{item.data.gyms.nearestDistanceKm} km</span>
                  <span className="block text-[10px] text-slate-500 truncate">
                    {item.data.gyms.items[0]?.title || "Local Gym"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Restaurants */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">Dining & Cafes</td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4">
                  <span className="font-bold text-slate-900">{item.data.restaurants.countFound}+ options</span>
                  <span className="block text-[10px] text-slate-500 line-clamp-1">
                    {item.data.restaurants.topHighlights[0]?.title || "Cafes & Messes"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Groceries */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">Groceries</td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4">
                  <span className="font-semibold text-slate-800">
                    {item.data.groceries.quickCommerceAvailable ? "Instant 10m Delivery" : "Supermarket"}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {item.data.groceries.items[0]?.title || "Local Mart"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Transit */}
            <tr className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-semibold text-slate-900">Public Transit</td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4">
                  <span className="font-semibold text-slate-900">
                    {item.data.transit.metroDistanceKm ? `${item.data.transit.metroDistanceKm} km to Metro` : "BMTC Buses"}
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate">
                    {item.data.transit.nearestMetroStation || "Bus Corridor"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Dynamic Custom Requirements Rows (e.g. School, Hospital, Daycare) */}
            {constraints.customRequirements && constraints.customRequirements.map((cr) => (
              <tr key={cr.id} className="hover:bg-slate-50/50 bg-teal-50/20">
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {cr.label}
                  <span className="block text-[10px] text-teal-700 font-bold">Target: &lt; {cr.targetDistanceKm} km</span>
                </td>
                {topHoods.map((item) => {
                  const ca = item.data.customAmenities?.find((a) => a.category === cr.category);
                  const dist = ca?.nearestDistanceKm !== undefined ? ca.nearestDistanceKm : 0.8;
                  const isCompliant = dist <= cr.targetDistanceKm;
                  return (
                    <td key={item.data.id} className="py-3 px-4">
                      <span className="font-bold text-slate-900">{dist} km</span>
                      <span className={`block text-[10px] font-semibold ${isCompliant ? "text-emerald-600" : "text-amber-600"}`}>
                        {isCompliant ? "✓ Within target" : "• Beyond target"}
                      </span>
                      {ca?.items[0] && (
                        <span className="block text-[10px] text-slate-400 truncate">
                          {ca.items[0].title}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Overall Score */}
            <tr className="bg-teal-50/30">
              <td className="py-3 px-4 font-extrabold text-slate-900">Overall Match Score</td>
              {topHoods.map((item) => (
                <td key={item.data.id} className="py-3 px-4 font-mono font-black text-teal-800 text-sm">
                  {item.score.overallScore} / 100
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
