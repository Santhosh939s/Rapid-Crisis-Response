"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Cross, Flame, Lock, HelpCircle, Megaphone, Shield, ShieldAlert, PhoneCall, CheckCircle2 } from "lucide-react";
import type { Incident, IncidentType, Severity } from "@/lib/types";
import { subscribeToIncidents, updateIncident, updateStaffPresence } from "@/lib/firebaseUtils";
import AuthGuard from "@/components/AuthGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case "Critical": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    case "High": return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]";
    case "Medium": return "bg-yellow-500";
    case "Resolved": return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    default: return "bg-slate-500";
  }
};

const getTypeIcon = (type: IncidentType) => {
  switch (type) {
    case "Medical Emergency": return <Cross size={24} className="text-red-400" />;
    case "Fire / Smoke": return <Flame size={24} className="text-orange-400" />;
    case "Security Threat": return <Lock size={24} className="text-blue-400" />;
    case "Other": return <HelpCircle size={24} className="text-slate-400" />;
  }
};

const formatTimeAgo = (timestamp: number) => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h ago`;
};

export default function StaffDashboard() {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || "Unknown Staff";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<"ALL" | Severity>("ALL");
  const [, setTick] = useState(0);
  
  const { alertNewIncident, permission } = useNotifications();
  const knownIncidentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let watchId: number;

    if (currentUser) {
      updateStaffPresence(currentUser.uid, {
        name: userEmail,
        role: "Staff",
        status: "Available",
        floor: "Lobby"
      });

      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            updateStaffPresence(currentUser.uid, {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
          },
          (error) => console.error("Error watching staff location", error),
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }
    }

    const unsubscribe = subscribeToIncidents((data) => {
      if (knownIncidentIds.current.size > 0) {
        const newIncidents = data.filter(inc => !knownIncidentIds.current.has(inc.id) && inc.status === "new");
        if (newIncidents.length > 0) {
          const latest = newIncidents[0];
          alertNewIncident(
            `🚨 NEW INCIDENT: ${latest.type}`,
            `Room ${latest.roomNumber} (${latest.floor}) needs immediate attention.`
          );
        }
      }
      knownIncidentIds.current = new Set(data.map(inc => inc.id));
      setIncidents(data);
    });

    const timer = setInterval(() => setTick(t => t + 1), 60000);
    
    return () => {
      unsubscribe();
      clearInterval(timer);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [currentUser, userEmail, alertNewIncident]);

  const activeIncidents = incidents.filter(i => i.status !== "resolved");
  const myTasks = incidents.filter(i => i.assignedTo === userEmail && i.status !== "resolved");
  
  const filteredIncidents = incidents.filter(i => {
    if (filter === "ALL") return i.status !== "resolved";
    return i.severity === filter && i.status !== "resolved";
  }).sort((a, b) => b.createdAt - a.createdAt);

  const handleClaim = async (id: string) => {
    try {
      await updateIncident(id, { status: "claimed", assignedTo: userEmail });
      if (currentUser) {
        await updateStaffPresence(currentUser.uid, { status: "On Task", currentIncident: id });
      }
    } catch (e) {
      console.error("Failed to claim", e);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateIncident(id, { status: "resolved", severity: "Resolved", resolvedAt: Date.now() });
      if (currentUser) {
        await updateStaffPresence(currentUser.uid, { status: "Available", currentIncident: null });
      }
    } catch (e) {
      console.error("Failed to resolve", e);
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
    <AuthGuard role="Staff">
      <div className="min-h-screen bg-[#050B14] text-slate-300 flex flex-col font-sans selection:bg-red-500/30">
        
        {/* Top Nav */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-red-500" />
              <span className="font-bold text-lg text-white tracking-tight">CrisisLink Staff</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell size={22} className="text-slate-400" />
                {activeIncidents.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]">
                    {activeIncidents.length}
                  </span>
                )}
              </div>
              <LogOut onClick={handleLogout} size={22} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </header>

        {/* Alert Banner */}
        {activeIncidents.length > 0 ? (
          <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 py-2 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 animate-pulse">
            <ShieldAlert size={16} />
            {activeIncidents.length} ACTIVE INCIDENTS
          </div>
        ) : (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 py-2 px-4 text-center font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            ALL CLEAR
          </div>
        )}

        <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col gap-6">
          
          {/* Active Tasks Section - MASSIVE BUTTONS */}
          {myTasks.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase">My Current Task</h2>
              {myTasks.map(task => (
                <div key={task.id} className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Assigned Incident</span>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {getTypeIcon(task.type)} {task.type}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-xl p-4 mb-6">
                    <div className="text-3xl font-bold text-white text-center mb-1">Room {task.roomNumber}</div>
                    <div className="text-slate-400 text-center font-medium uppercase tracking-widest">{task.floor}</div>
                  </div>

                  <button 
                    onClick={() => handleResolve(task.id)}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={24} />
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Incident Feed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Incoming Alerts</h2>
            </div>

            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
                  No pending incidents.
                </div>
              ) : (
                filteredIncidents.map(inc => {
                  if (inc.assignedTo === userEmail) return null; // Don't show in feed if it's my task
                  
                  return (
                    <div key={inc.id} className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(inc.severity)}`} />
                      
                      <div className="p-4 pl-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(inc.type)}
                            <span className="font-bold text-white">{inc.type}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">{formatTimeAgo(inc.createdAt)}</span>
                        </div>
                        
                        <div className="text-lg font-bold text-slate-200 mb-2">
                          Room {inc.roomNumber} <span className="text-slate-500 font-medium">({inc.floor})</span>
                        </div>

                        {inc.guestDescription && (
                          <div className="bg-black/30 rounded-lg p-3 text-sm text-slate-400 italic mb-4">
                            "{inc.guestDescription}"
                          </div>
                        )}
                        
                        {!inc.assignedTo ? (
                          <button 
                            onClick={() => handleClaim(inc.id)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_0_15px_-3px_rgba(37,99,235,0.5)] active:scale-95 transition-all"
                          >
                            Claim Incident
                          </button>
                        ) : (
                          <div className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase tracking-wider text-center text-xs border border-white/5">
                            Assigned to {inc.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Quick Emergency Actions */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-colors">
              <Megaphone size={24} className="text-blue-400" />
              <span className="text-xs font-bold uppercase text-slate-400">Broadcast</span>
            </button>
            <button className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-colors">
              <PhoneCall size={24} className="text-red-400" />
              <span className="text-xs font-bold uppercase text-red-400">911 SOS</span>
            </button>
          </div>

        </main>
      </div>
    </AuthGuard>
  );
}
