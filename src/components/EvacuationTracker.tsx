"use client";

import { useState } from "react";
import { Users, CheckCircle2, AlertTriangle } from "lucide-react";

const ZONES = [
  { id: "z1", name: "Floor 1", total: 45 },
  { id: "z2", name: "Floor 2", total: 52 },
  { id: "z3", name: "Floor 3", total: 48 },
  { id: "z4", name: "Lobby", total: 20 },
  { id: "z5", name: "Restaurant", total: 35 },
  { id: "z6", name: "Pool Area", total: 12 },
];

export default function EvacuationTracker() {
  const [clearedZones, setClearedZones] = useState<Set<string>>(new Set());

  const toggleZone = (id: string) => {
    const newCleared = new Set(clearedZones);
    if (newCleared.has(id)) {
      newCleared.delete(id);
    } else {
      newCleared.add(id);
    }
    setClearedZones(newCleared);
  };

  const totalGuests = ZONES.reduce((sum, z) => sum + z.total, 0);
  const clearedGuests = ZONES.filter(z => clearedZones.has(z.id)).reduce((sum, z) => sum + z.total, 0);
  const percentage = Math.round((clearedGuests / totalGuests) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-400" />
          <h2 className="text-lg font-bold">Evacuation Headcount Tracker</h2>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm animate-pulse">
          <AlertTriangle size={16} /> Send Evacuation Order
        </button>
      </div>

      <div className="p-5">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
            <span>{clearedGuests} of {totalGuests} guests accounted for</span>
            <span className={percentage === 100 ? "text-success" : "text-primary"}>{percentage}% Cleared</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 transition-all duration-500 ease-out ${percentage === 100 ? 'bg-success' : 'bg-primary'}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ZONES.map(zone => {
            const isCleared = clearedZones.has(zone.id);
            return (
              <button
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isCleared ? 'border-success bg-success/5 text-success' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                {isCleared ? <CheckCircle2 size={24} className="mb-2" /> : <Users size={24} className="mb-2 text-slate-400" />}
                <span className="font-bold text-sm text-center">{zone.name}</span>
                <span className={`text-xs mt-1 ${isCleared ? 'text-success/80' : 'text-slate-400'}`}>
                  {zone.total} Guests
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
