import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRentRange(min: number, max: number): string {
  if (!min && !max) return "Market estimate pending";
  if (min === max) return `~${formatInr(min)}`;
  return `₹${(min / 1000).toFixed(0)}k–₹${(max / 1000).toFixed(0)}k/mo`;
}

export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return "Unknown";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatCommuteTime(mins?: number, peakMins?: number): string {
  if (!mins) return "Check route";
  if (peakMins && peakMins > mins) {
    return `${mins}–${peakMins} min`;
  }
  return `~${mins} min`;
}
