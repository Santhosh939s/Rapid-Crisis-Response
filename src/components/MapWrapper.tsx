"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Incident, Staff } from "@/lib/types";

// Dynamic import of the MapPanel with ssr disabled
const DynamicMapPanel = dynamic(() => import("./MapPanel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-b-xl">
      <div className="flex flex-col items-center text-slate-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <span className="font-medium">Loading Map...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  activeIncidents?: Incident[];
  staff?: Staff[];
  centerLocation?: { lat: number; lng: number };
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicMapPanel {...props} />;
}
