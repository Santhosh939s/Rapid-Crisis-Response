"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Cross, Flame, Lock, HelpCircle, Megaphone, Shield, ShieldAlert, PhoneCall } from "lucide-react";
import type { Incident, IncidentType, Severity } from "@/lib/types";
import { subscribeToIncidents, updateIncident, updateStaffPresence } from "@/lib/firebaseUtils";
import AuthGuard from "@/components/AuthGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case "Critical": return "bg-red-500";
    case "High": return "bg-orange-500";
    case "Medium": return "bg-yellow-500";
    case "Resolved": return "bg-green-500";
    default: return "bg-slate-500";
  }
};

const getTypeIcon = (type: IncidentType) => {
  switch (type) {
    case "Medical Emergency": return <Cross size={20} className="text-red-500" />;
    case "Fire / Smoke": return <Flame size={20} className="text-orange-500" />;
    case "Security Threat": return <Lock size={20} className="text-slate-700" />;
    case "Other": return <HelpCircle size={20} className="text-slate-500" />;
  }
};

const formatTimeAgo = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  if (!isToday) {
    return `${dateString}, ${timeString}`;
  }

  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  let agoString = "";
  if (diffMins < 1) agoString = "Just now";
  else if (diffMins < 60) agoString = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  else agoString = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;

  return `${dateString}, ${timeString} (${agoString})`;
};

export default function StaffDashboard() {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || "Unknown Staff";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<"ALL" | Severity>("ALL");
  const [, setTick] = useState(0);

  useEffect(() => {
    if (currentUser) {
      updateStaffPresence(currentUser.uid, {
        name: userEmail,
        role: "Staff",
        status: "Available",
        floor: "Lobby" // Default location
      });
    }

    // Subscribe to real-time Firebase updates
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
    });

    // Force re-render for live time updates
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const activeIncidents = incidents.filter(i => i.status !== "resolved");
  const myTasks = incidents.filter(i => i.assignedTo === userEmail && i.status !== "resolved");
  
  const filteredIncidents = incidents.filter(i => {
    if (filter === "ALL") return true;
    return i.severity === filter;
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-secondary text-white shadow-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-primary" />
            <span className="font-bold text-xl tracking-tight">CrisisLink</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={24} />
              {activeIncidents.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {activeIncidents.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden">{userInitial}</div>
              <span className="font-medium hidden sm:block text-sm max-w-[150px] truncate">{userEmail}</span>
              <LogOut onClick={handleLogout} size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {activeIncidents.length > 0 ? (
        <div className="bg-red-600 border-b border-red-700 text-white py-3 px-4 text-center font-bold flex items-center justify-center gap-2 animate-pulse-ring">
          <ShieldAlert size={20} />
          ⚠ ACTIVE CRISIS — {activeIncidents.length} incident{activeIncidents.length > 1 ? 's' : ''} require attention
        </div>
      ) : (
        <div className="bg-success/10 border-b border-success/20 text-success py-3 px-4 text-center font-bold">
          All clear — No active incidents
        </div>
      )}

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Incident Feed */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Live Incidents</h2>
            <div className="flex gap-2 bg-slate-200 p-1 rounded-lg text-sm">
              {["ALL", "Critical", "High", "Medium", "Resolved"].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${filter === f ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                No incidents match this filter.
              </div>
            ) : (
              filteredIncidents.map(inc => (
                <div key={inc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex animate-slide-in hover:shadow-md transition-shadow">
                  {/* Severity Bar */}
                  <div className={`w-3 ${getSeverityColor(inc.severity)} shrink-0`} />
                  
                  <div className="p-5 flex-1 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(inc.type)}
                        <span className="font-bold text-slate-800">{inc.type}</span>
                        <span className="text-sm font-medium text-slate-500 ml-auto">{formatTimeAgo(inc.createdAt)}</span>
                      </div>
                      <div className="font-semibold text-lg text-slate-900 mb-1">
                        Room {inc.roomNumber} — {inc.floor}
                      </div>
                      {inc.guestDescription && (
                        <p className="text-slate-600 text-sm mt-2 italic border-l-2 border-slate-200 pl-3">
                          "{inc.guestDescription}"
                        </p>
                      )}
                      
                      {inc.assignedTo && (
                        <div className="mt-3 inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                          Assigned to: {inc.assignedTo}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col justify-center gap-2 shrink-0">
                      {!inc.assignedTo && inc.status !== "resolved" && (
                        <button 
                          onClick={() => handleClaim(inc.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all"
                        >
                          CLAIM
                        </button>
                      )}
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - My Tasks & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">My Active Tasks</h2>
            
            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <div className="text-slate-500 text-sm italic">You have no active tasks.</div>
              ) : (
                myTasks.map(task => (
                  <div key={task.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(task.severity)}`} />
                      <span className="font-bold text-slate-800">{task.type}</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-4">
                      Room {task.roomNumber} ({task.floor})
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <select 
                        className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none"
                        defaultValue={task.status}
                      >
                        <option value="claimed">Responding</option>
                        <option value="on_scene">On Scene</option>
                      </select>
                      <button 
                        onClick={() => handleResolve(task.id)}
                        className="w-full py-2 bg-success text-white rounded-lg font-bold text-sm hover:bg-success/90 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors">
                <Megaphone size={20} className="text-primary" />
                Broadcast to Guests
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition-colors">
                <ShieldAlert size={20} className="text-warning" />
                Request Backup
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-semibold transition-colors">
                <PhoneCall size={20} />
                Contact Emergency Services
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
