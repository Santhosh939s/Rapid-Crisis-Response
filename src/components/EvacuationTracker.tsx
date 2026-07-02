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
    <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800/50 border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Users size={18} className="text-blue-400" />
          <h2 className="text-sm font-bold tracking-wider uppercase">Evacuation Tracker</h2>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)] animate-pulse">
          <AlertTriangle size={14} /> Trigger Evacuation
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            <span>{clearedGuests} of {totalGuests} accounted for</span>
            <span className={percentage === 100 ? "text-emerald-400" : "text-primary"}>{percentage}% Cleared</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-white/5">
            <div 
              className={`h-3 transition-all duration-500 ease-out ${percentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
          {ZONES.map(zone => {
            const isCleared = clearedZones.has(zone.id);
            return (
              <button
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isCleared ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:bg-slate-700/50'}`}
              >
                {isCleared ? <CheckCircle2 size={20} className="mb-1" /> : <Users size={20} className="mb-1 opacity-50" />}
                <span className="font-bold text-xs uppercase tracking-wider text-center">{zone.name}</span>
                <span className={`text-[10px] mt-1 font-bold ${isCleared ? 'text-emerald-500/80' : 'text-slate-500'}`}>
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
