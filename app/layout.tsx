import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoveWise — AI Relocation Agent",
  description:
    "Your autonomous AI relocation agent. Researches neighborhoods, rental market ranges, commute times, gyms, restaurants and local reviews to build your personalized shortlist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
