"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Map as MapIcon, PhoneCall, LogOut, Users, AlertTriangle, Clock, Activity, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import GeminiAssistant from "@/components/GeminiAssistant";
import EvacuationTracker from "@/components/EvacuationTracker";
import MapWrapper from "@/components/MapWrapper";
import type { Incident, Staff } from "@/lib/types";
import { subscribeToIncidents, updateIncident, subscribeToStaff, updateStaffPresence, setDemoMode } from "@/lib/firebaseUtils";
import AuthGuard from "@/components/AuthGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical": return "bg-red-500 text-white shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)]";
    case "High": return "bg-orange-500 text-white shadow-[0_0_15px_-3px_rgba(249,115,22,0.5)]";
    case "Medium": return "bg-yellow-500 text-slate-900";
    case "Resolved": return "bg-green-500 text-white";
    default: return "bg-slate-500 text-white";
  }
};

const mockAnalyticsData = [
  { time: '08:00', incidents: 2, responseTime: 4 },
  { time: '09:00', incidents: 5, responseTime: 3 },
  { time: '10:00', incidents: 3, responseTime: 5 },
  { time: '11:00', incidents: 7, responseTime: 2 },
  { time: '12:00', incidents: 1, responseTime: 6 },
  { time: '13:00', incidents: 4, responseTime: 3 },
  { time: '14:00', incidents: 6, responseTime: 2 },
];

export default function CommanderDashboard() {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || "Demo Commander";
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  const { alertNewIncident, permission } = useNotifications();
  const knownIncidentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.error("Geolocation error:", error)
      );
    }
  }, []);

  useEffect(() => {
    const unsubscribeIncidents = subscribeToIncidents((data) => {
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
      if (!activeIncidentId && data.length > 0) {
        setActiveIncidentId(data[0].id);
      }
    });

    const unsubscribeStaff = subscribeToStaff(setStaff);

    return () => {
      unsubscribeIncidents();
      unsubscribeStaff();
    };
  }, [activeIncidentId, alertNewIncident]);

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
      setDemoMode(false);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const criticalCount = incidents.filter(i => i.severity === "Critical" && i.status !== "resolved").length;
  const deployedStaff = staff.filter(s => s.status === "On Task").length;

  return (
    <AuthGuard role="Commander">
    <div className="min-h-screen bg-[#050B14] text-slate-300 font-sans selection:bg-primary/30 flex flex-col overflow-x-hidden">
      
      {/* Top Nav */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Star className="text-primary fill-primary" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Rapid Crisis Response</span>
            <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-black px-2 py-1 rounded ml-2 uppercase tracking-widest">Enterprise Command</span>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${permission === "granted" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
              <div className={`w-2 h-2 rounded-full ${permission === "granted" ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></div>
              {permission === "granted" ? "Alerts On" : "Alerts Off"}
            </div>
            <span className="font-medium hidden sm:block text-sm text-slate-400 max-w-[150px] truncate">{userEmail}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <LogOut size={18} /> <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI Dashboard */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-4 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/20">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Active Crises</p>
            <h3 className="text-3xl font-black text-white">{criticalCount}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/20">
            <Users className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Deployed Staff</p>
            <h3 className="text-3xl font-black text-white">{deployedStaff} <span className="text-sm font-medium text-slate-500">/ {staff.length}</span></h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20">
            <Clock className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Avg Response</p>
            <h3 className="text-3xl font-black text-white">2.4m</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/20">
            <ShieldCheck className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">System Status</p>
            <h3 className="text-3xl font-black text-white tracking-tight text-emerald-400">SECURE</h3>
          </div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <main className="px-6 pb-6 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 z-10 relative">
        
        {/* Column 1: Map & Evacuation (Span 5) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
              <h2 className="font-bold flex items-center gap-2 text-white"><MapIcon size={18} className="text-primary" /> Tactical Map</h2>
              <div className="flex gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse mt-1"></span>
                <span className="text-xs font-bold text-slate-400 tracking-wider">LIVE GPS</span>
              </div>
            </div>
            <div className="flex-1 relative z-0">
              <MapWrapper activeIncidents={activeIncident ? [activeIncident] : []} staff={staff} centerLocation={mapCenter} />
            </div>
          </motion.div>
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
            <EvacuationTracker />
          </div>
        </div>

        {/* Column 2: Incident Command (Span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex flex-col flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px]"></div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              Active Command
              {activeIncident && <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${getSeverityColor(activeIncident.severity)}`}>{activeIncident.severity}</span>}
            </h2>
            
            {activeIncident ? (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">Emergency Type</div>
                  <div className="font-black text-2xl text-white">{activeIncident.type}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">Location</div>
                    <div className="font-bold text-white">Room {activeIncident.roomNumber} <span className="text-slate-500 font-medium">({activeIncident.floor})</span></div>
                  </div>
                  <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">Status</div>
                    <div className={`font-bold ${activeIncident.status === 'resolved' ? 'text-green-400' : 'text-primary'}`}>{activeIncident.status.toUpperCase()}</div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-3">Dispatch Operations</p>
                  <div className="flex gap-2">
                    <select id="assignSelect" className="flex-1 bg-slate-800 border border-white/10 rounded-xl text-sm px-4 py-3 font-medium text-white focus:ring-2 focus:ring-primary outline-none appearance-none">
                      <option value="" className="text-slate-500">Select Responder...</option>
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
                      className="bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] flex items-center justify-center"
                    >
                      Deploy <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                  
                  <button className="w-full mt-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 transition-colors">
                    <PhoneCall size={16} /> Escalate to Emergency Services (911)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 py-12">
                <ShieldCheck size={48} className="mb-4" />
                <p className="font-medium text-lg">No Active Emergencies</p>
              </div>
            )}
          </motion.div>

          <GeminiAssistant activeIncident={activeIncident} />
        </div>

        {/* Column 3: Analytics & Fleet (Span 3) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-[300px] flex flex-col print:bg-white print:border-black print:text-black">
            
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body { background: white !important; color: black !important; }
                header, .print-hide { display: none !important; }
                .print\\:bg-white { background: white !important; }
                .print\\:text-black { color: black !important; }
                .print\\:border-black { border-color: black !important; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}} />

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2">
                <Activity size={18} className="text-blue-400" /> Response Analytics
              </h2>
              <button onClick={() => window.print()} className="print-hide text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors">
                Export PDF
              </button>
            </div>
            
            <div className="flex-1 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalyticsData}>
                  <defs>
                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="incidents" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-400" /> Fleet Overview
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {staff.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">No personnel connected</div>
                ) : (
                  staff.map(member => (
                    <motion.div 
                      key={member.id} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:bg-slate-800/50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white mb-0.5">{member.name}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest">{member.role} • {member.floor || "Unknown"}</div>
                      </div>
                      <div className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                        member.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        member.status === 'On Task' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {member.status}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
    </AuthGuard>
  );
}
