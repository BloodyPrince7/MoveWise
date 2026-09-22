"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScoredNeighborhood, HotelItem } from "@/types/relocation";
import { MapPin, Layers, Dumbbell, Utensils, ShoppingBag, Train, Hotel, Building2 } from "lucide-react";

interface InteractiveMapProps {
  neighborhoods: ScoredNeighborhood[];
  selectedNeighborhoodId?: string;
  onSelectNeighborhood?: (id: string) => void;
  officeLocationName: string;
  hotels?: HotelItem[];
}

export function InteractiveMap({
  neighborhoods,
  selectedNeighborhoodId,
  onSelectNeighborhood,
  officeLocationName,
  hotels = [],
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<"all" | "gyms" | "food" | "groceries" | "metro" | "hotels">("all");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Compute dynamic center based on candidate neighborhoods
  const centerLat =
    neighborhoods.length > 0
      ? neighborhoods.reduce((acc, curr) => acc + curr.data.coordinates.lat, 0) / neighborhoods.length
      : 12.9716;
  const centerLng =
    neighborhoods.length > 0
      ? neighborhoods.reduce((acc, curr) => acc + curr.data.coordinates.lng, 0) / neighborhoods.length
      : 77.5946;

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet only on client
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up existing instance if already created
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
      setMapLoaded(true);

      renderMarkers(L, map, markersGroup);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng]);

  // Update markers when selected neighborhood or activeLayer changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markersGroupRef.current) return;
    import("leaflet").then((L) => {
      renderMarkers(L, mapInstanceRef.current, markersGroupRef.current);
    });
  }, [selectedNeighborhoodId, activeLayer, mapLoaded, neighborhoods]);

  const renderMarkers = (L: any, map: any, group: any) => {
    group.clearLayers();

    // Dynamic Office Marker located at the center anchor
    const officeIcon = L.divIcon({
      className: "custom-office-icon",
      html: `
        <div style="background-color: #ef4444; color: white; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <span style="font-size: 9px; font-weight: bold;">OFFICE</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Office position positioned relative to dynamic center
    const officeLat = centerLat + 0.008;
    const officeLng = centerLng + 0.008;

    L.marker([officeLat, officeLng], { icon: officeIcon })
      .addTo(group)
      .bindPopup(`<strong>Workplace Anchor</strong><br/>${officeLocationName}`);

    // Neighborhood Markers
    neighborhoods.forEach((item, index) => {
      const isSelected = item.data.id === selectedNeighborhoodId;
      const rank = index + 1;

      const hoodIcon = L.divIcon({
        className: "custom-hood-icon",
        html: `
          <div style="background-color: ${isSelected ? "#0d9488" : "#334155"}; color: white; border-radius: 9999px; border: 3px solid ${isSelected ? "#99f6e4" : "white"}; box-shadow: 0 6px 12px rgba(0,0,0,0.25); display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${isSelected ? 42 : 36}px; height: ${isSelected ? 42 : 36}px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
            <span style="font-size: 11px;">#${rank}</span>
            <span style="font-size: 9px; opacity: 0.9;">${item.score.overallScore}</span>
          </div>
        `,
        iconSize: [isSelected ? 42 : 36, isSelected ? 42 : 36],
        iconAnchor: [isSelected ? 21 : 18, isSelected ? 21 : 18],
      });

      const marker = L.marker([item.data.coordinates.lat, item.data.coordinates.lng], { icon: hoodIcon })
        .addTo(group)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong style="font-size: 14px; color: #0f172a;">${item.data.name}</strong>
            <span style="background: #e6fffa; color: #0d9488; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 6px;">
              ${item.score.overallScore}/100 Match
            </span>
            <p style="margin: 4px 0; color: #475569;">Commute: ~${item.data.commute.estimatedMinutes}m | Gym: ${item.data.gyms.nearestDistanceKm}km</p>
            <p style="margin: 4px 0; font-weight: bold; color: #0d9488;">Est. Rent: ₹${(item.data.estimatedRent.bhk1.min/1000).toFixed(0)}k–₹${(item.data.estimatedRent.bhk1.max/1000).toFixed(0)}k</p>
          </div>
        `);

      marker.on("click", () => {
        onSelectNeighborhood?.(item.data.id);
      });

      // Show amenities of selected neighborhood or all
      if (isSelected || !selectedNeighborhoodId) {
        // Gyms
        if (activeLayer === "all" || activeLayer === "gyms") {
          item.data.gyms.items.forEach((gym, gIdx) => {
            const offset = (gIdx + 1) * 0.003;
            const gymIcon = L.divIcon({
              html: `<div style="background: #9333ea; color: white; border-radius: 6px; padding: 2px 5px; font-size: 9px; font-weight: bold; border: 1px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">💪 ${gym.title.split(" ")[0]}</div>`,
              iconSize: [60, 20],
            });
            L.marker([item.data.coordinates.lat + offset, item.data.coordinates.lng - offset], { icon: gymIcon })
              .addTo(group)
              .bindPopup(`<strong>${gym.title}</strong><br/>${gym.category || "Fitness"}<br/>★ ${gym.rating || "4.5"}`);
          });
        }

        // Restaurants
        if (activeLayer === "all" || activeLayer === "food") {
          item.data.restaurants.topHighlights.forEach((res, rIdx) => {
            const offset = (rIdx + 1) * 0.0025;
            const foodIcon = L.divIcon({
              html: `<div style="background: #f97316; color: white; border-radius: 6px; padding: 2px 5px; font-size: 9px; font-weight: bold; border: 1px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🍴 ${res.title.split(" ")[0]}</div>`,
              iconSize: [60, 20],
            });
            L.marker([item.data.coordinates.lat - offset, item.data.coordinates.lng + offset], { icon: foodIcon })
              .addTo(group)
              .bindPopup(`<strong>${res.title}</strong><br/>★ ${res.rating || "4.4"}`);
          });
        }

        // Metro
        if (activeLayer === "all" || activeLayer === "metro") {
          item.data.transit.transitItems.forEach((tr, tIdx) => {
            const offset = (tIdx + 1) * 0.0035;
            const metroIcon = L.divIcon({
              html: `<div style="background: #0284c7; color: white; border-radius: 6px; padding: 2px 5px; font-size: 9px; font-weight: bold; border: 1px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🚇 ${tr.title.split(" ")[0]}</div>`,
              iconSize: [60, 20],
            });
            L.marker([item.data.coordinates.lat + offset, item.data.coordinates.lng + offset], { icon: metroIcon })
              .addTo(group)
              .bindPopup(`<strong>${tr.title}</strong><br/>${tr.distanceKm ? tr.distanceKm + " km away" : "Nearby"}`);
          });
        }
      }
    });

    // Hotels
    if (activeLayer === "all" || activeLayer === "hotels") {
      hotels.slice(0, 3).forEach((hotel, hIdx) => {
        const hotelIcon = L.divIcon({
          html: `<div style="background: #059669; color: white; border-radius: 6px; padding: 2px 5px; font-size: 9px; font-weight: bold; border: 1px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏨 ${hotel.title.split(" ")[0]}</div>`,
          iconSize: [80, 20],
        });
        L.marker([centerLat - 0.005 - hIdx * 0.004, centerLng - 0.004 - hIdx * 0.003], { icon: hotelIcon })
          .addTo(group)
          .bindPopup(`<strong>${hotel.title}</strong><br/>${hotel.priceFormatted || ""}<br/>★ ${hotel.rating || ""}`);
      });
    }

    // Pan to selected neighborhood if chosen
    if (selectedNeighborhoodId) {
      const selected = neighborhoods.find((n) => n.data.id === selectedNeighborhoodId);
      if (selected) {
        map.setView([selected.data.coordinates.lat, selected.data.coordinates.lng], 14, { animate: true });
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Map Filter Strip */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-teal-600" />
          <span className="font-bold text-slate-700">Map Explorer</span>
          <span className="text-[11px] text-slate-400">| Pins: Red = Office, Teal = Neighborhoods</span>
        </div>

        {/* Layer Filter Toggles */}
        <div className="flex items-center gap-1">
          {[
            { id: "all", label: "All" },
            { id: "gyms", label: "Gyms", icon: Dumbbell },
            { id: "food", label: "Food", icon: Utensils },
            { id: "metro", label: "Metro", icon: Train },
            { id: "hotels", label: "Hotels", icon: Hotel },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveLayer(btn.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                activeLayer === btn.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[400px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 text-xs text-slate-500 font-medium">
            Loading interactive map tiles...
          </div>
        )}
      </div>

      {/* Bottom neighborhood pills */}
      <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Candidate Localities:</span>
        {neighborhoods.map((n, idx) => {
          const isSelected = n.data.id === selectedNeighborhoodId;
          return (
            <button
              key={n.data.id}
              onClick={() => onSelectNeighborhood?.(n.data.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>#{idx + 1} {n.data.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isSelected ? "bg-teal-700 text-white" : "bg-white text-teal-700 font-mono"}`}>
                {n.score.overallScore}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
