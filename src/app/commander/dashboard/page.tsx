"use client";

import { useState, useEffect } from "react";
import { Star, Map as MapIcon, PhoneCall, LogOut, ShieldAlert, Users, PlusCircle, AlertTriangle } from "lucide-react";
import GeminiAssistant from "@/components/GeminiAssistant";
import EvacuationTracker from "@/components/EvacuationTracker";
import MapWrapper from "@/components/MapWrapper";
import type { Incident, Staff } from "@/lib/types";
import { subscribeToIncidents, updateIncident, subscribeToStaff, updateStaffPresence } from "@/lib/firebaseUtils";
import AuthGuard from "@/components/AuthGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical": return "bg-red-500";
    case "High": return "bg-orange-500";
    case "Medium": return "bg-yellow-500";
    case "Resolved": return "bg-green-500";
    default: return "bg-slate-500";
  }
};

export default function CommanderDashboard() {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || "Unknown Commander";

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  useEffect(() => {
    // Request browser location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const unsubscribeIncidents = subscribeToIncidents((data) => {
      setIncidents(data);
      if (!activeIncidentId && data.length > 0) {
        setActiveIncidentId(data[0].id);
      }
    });

    const unsubscribeStaff = subscribeToStaff((data) => {
      setStaff(data);
    });

    return () => {
      unsubscribeIncidents();
      unsubscribeStaff();
    };
  }, [activeIncidentId]);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];

  const handleAssign = async (incidentId: string, staffDataStr: string) => {
    try {
      const [staffId, staffName] = staffDataStr.split('|');
      await updateIncident(incidentId, { status: "claimed", assignedTo: staffName });
      await updateStaffPresence(staffId, { status: "On Task", currentIncident: incidentId });
    } catch (e) {
      console.error("Failed to assign", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AuthGuard role="Commander">
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Nav */}
      <header className="bg-[#111827] text-white shadow-md z-20 relative">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="text-warning fill-warning" size={24} />
            <span className="font-bold text-xl tracking-tight">CrisisLink</span>
            <span className="bg-warning text-warning-foreground text-xs font-black px-2 py-1 rounded ml-2 text-slate-900">COMMANDER</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium hidden sm:block text-sm max-w-[150px] truncate">{userEmail}</span>
            <LogOut onClick={handleLogout} size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0" />
          </div>
        </div>
      </header>

      {/* CRISIS STATUS BAR */}
      <div className="bg-red-600 text-white shadow-md px-6 py-4 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full animate-pulse-ring relative">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wide uppercase">Active Crisis</h1>
            <p className="text-red-100 font-medium">1 Critical Incident • Time since alert: 2m 45s</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm text-red-200 font-bold uppercase tracking-wider mb-1">Total Deployed</div>
          <div className="text-3xl font-black">{staff.filter(s => s.status === "On Task").length} Staff</div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-x-hidden">
        
        {/* Column 1: Map Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 min-h-[400px] flex flex-col">
            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold flex items-center gap-2"><MapIcon size={18} className="text-slate-500" /> Live Map</h2>
              <select className="text-sm border-slate-300 rounded-md">
                <option>All Floors</option>
                <option>Floor 3</option>
                <option>Lobby</option>
              </select>
            </div>
            {/* Real Map Area */}
            <div className="flex-1 relative">
              <MapWrapper 
                activeIncidents={activeIncident ? [activeIncident] : []} 
                staff={staff} 
                centerLocation={mapCenter} 
              />
            </div>
          </div>
        </div>

        {/* Column 2: Incident Management & AI */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex justify-between items-center">
              Active Incident
              {activeIncident && <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${getSeverityColor(activeIncident.severity)} text-white`}>{activeIncident.severity}</span>}
            </h2>
            
            {activeIncident ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 font-medium">Type</div>
                  <div className="font-bold text-lg">{activeIncident.type}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Location</div>
                    <div className="font-semibold">Room {activeIncident.roomNumber} ({activeIncident.floor})</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 font-medium">Status</div>
                    <div className="font-semibold text-warning">{activeIncident.status}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <select 
                    id="assignSelect"
                    className="flex-1 border border-slate-300 rounded-lg text-sm px-3 py-2 font-medium focus:ring-primary outline-none"
                  >
                    <option value="">Assign Staff...</option>
                    {staff.filter(s => s.status === "Available" && s.role !== "Commander").map(s => (
                      <option key={s.id} value={`${s.id}|${s.name}`}>{s.name} ({s.floor})</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      const select = document.getElementById("assignSelect") as HTMLSelectElement;
                      if (select.value && activeIncident) {
                        handleAssign(activeIncident.id, select.value);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Assign
                  </button>
                </div>
                
                <button className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2 rounded-lg text-sm flex justify-center items-center gap-2 transition-colors">
                  <PhoneCall size={16} /> Escalate to 911
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No active incidents right now.</p>
              </div>
            )}
          </div>

          <GeminiAssistant activeIncident={activeIncident} />
        </div>

        {/* Column 3: Staff & Resources */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users size={18} className="text-slate-500" /> Staff Overview
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {staff.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">No staff online</div>
              ) : (
                staff.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role} • {member.floor || "Unknown"}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'Available' ? 'bg-success/10 text-success' : 
                        member.status === 'On Task' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3">Emergency Resources</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                  <span className="font-medium">AEDs</span>
                  <span className="text-success font-bold">3 Avail</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center">
                  <span className="font-medium">First Aid</span>
                  <span className="text-warning font-bold">2 In Use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Section: Evacuation */}
      <div className="p-4 sm:p-6 pt-0">
        <EvacuationTracker />
      </div>
    </div>
    </AuthGuard>
  );
}
