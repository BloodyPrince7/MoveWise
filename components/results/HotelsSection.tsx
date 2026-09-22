import React from "react";
import { HotelItem } from "@/types/relocation";
import { Hotel, Star, MapPin, ExternalLink, Wifi, Sparkles, CheckCircle2 } from "lucide-react";

interface HotelsSectionProps {
  hotels: HotelItem[];
  officeLocation: string;
}

export function HotelsSection({ hotels, officeLocation }: HotelsSectionProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Hotel className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Need somewhere to stay while you search?
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            First-week transitional hotels near {officeLocation} researched via SerpApi Google Hotels engine.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          Temporary Stays
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="group rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 hover:bg-white hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Hotel title & rating */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {hotel.title}
                </h4>
                {hotel.rating && (
                  <span className="flex items-center gap-1 shrink-0 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {hotel.rating}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {hotel.priceFormatted || "Check rates"}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">avg nightly</span>
              </div>

              {/* Distance description */}
              <div className="text-[11px] text-slate-600 flex items-center gap-1 mb-3">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{hotel.distanceDescription}</span>
              </div>

              {/* Amenities */}
              {hotel.amenities && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {hotel.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Booking / Source Link */}
            {hotel.link && (
              <a
                href={hotel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-colors shadow-2xs"
              >
                <span>View Google Hotels Info</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
