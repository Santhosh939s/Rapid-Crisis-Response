"use client";

import { useState, useEffect, Suspense } from "react";
import { Cross, Flame, Lock, HelpCircle, Mic, Phone, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";

type IncidentType = "Medical Emergency" | "Fire / Smoke" | "Security Threat" | "Other" | null;
type IncidentStatus = "idle" | "sending" | "sent" | "assigned" | "dispatched" | "resolved";

import { createIncident } from "@/lib/firebaseUtils";

function GuestSOSContent() {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get("room") || "";
  
  const [currentTime, setCurrentTime] = useState("");
  const [incidentType, setIncidentType] = useState<IncidentType>(null);
  const [description, setDescription] = useState("");
  const [roomNumber, setRoomNumber] = useState(initialRoom);
  const [status, setStatus] = useState<IncidentStatus>("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  // Set current time on client side only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSOSClick = () => {
    if (!roomNumber) {
      alert("Please enter your room number.");
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSOS = async () => {
    setShowConfirmModal(false);
    setStatus("sending");
    
    let location = undefined;
    
    const sendPayload = async (loc?: {lat: number, lng: number}) => {
      try {
        const type = incidentType || "Other";
        const severity = type === "Medical Emergency" || type === "Fire / Smoke" ? "Critical" : "High";
        
        const newId = await createIncident({
          type: type,
          roomNumber: roomNumber,
          floor: "Unknown", // In real app, derived from room number
          guestDescription: description,
          severity: severity,
          status: "new",
          location: loc
        });
        
        setIncidentId(newId!);
        setStatus("sent");
      } catch (error) {
        console.error("Failed to send alert", error);
        alert("Failed to send alert. Please call 911.");
        setStatus("idle");
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendPayload({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn("Geolocation failed or denied, sending without GPS", error);
          sendPayload();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendPayload();
    }
  };

  const handleVoiceInput = () => {
    // MOCK: Web Speech API placeholder
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    setIsRecording(!isRecording);
    // Real implementation would start/stop recognition here
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-24">
      {/* Top Bar */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center z-10 relative">
        <div className="font-bold text-slate-800">Grand Plaza Hotel</div>
        <div className="text-slate-500 font-medium">{currentTime}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 space-y-8 animate-slide-in max-w-lg mx-auto w-full">
        
        {/* Massive SOS Button */}
        <div className="relative mt-8">
          {status === "idle" ? (
            <>
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-ring"></div>
              <button 
                onClick={handleSOSClick}
                className="relative z-10 w-[200px] h-[200px] bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-xl hover:bg-primary-hover active:scale-95 transition-all"
              >
                <span className="text-4xl font-black mb-2 tracking-wider">SOS</span>
                <span className="text-sm font-semibold px-4 text-center">TAP TO ALERT<br/>STAFF</span>
              </button>
            </>
          ) : (
            <div className="relative z-10 w-[200px] h-[200px] bg-success text-white rounded-full flex flex-col items-center justify-center shadow-lg transition-all">
              <span className="text-xl font-bold text-center px-4">Help is on the way</span>
              <span className="text-sm mt-2 opacity-90 text-center">Estimated 3 min</span>
            </div>
          )}
        </div>

        {status === "idle" && (
          <div className="w-full space-y-6">
            {/* Quick Type Grid */}
            <div className="grid grid-cols-2 gap-4">
              <QuickButton 
                icon={<Cross size={24} />} 
                label="Medical" 
                selected={incidentType === "Medical Emergency"}
                onClick={() => setIncidentType("Medical Emergency")} 
              />
              <QuickButton 
                icon={<Flame size={24} />} 
                label="Fire/Smoke" 
                selected={incidentType === "Fire / Smoke"}
                onClick={() => setIncidentType("Fire / Smoke")} 
              />
              <QuickButton 
                icon={<Lock size={24} />} 
                label="Security" 
                selected={incidentType === "Security Threat"}
                onClick={() => setIncidentType("Security Threat")} 
              />
              <QuickButton 
                icon={<HelpCircle size={24} />} 
                label="Other" 
                selected={incidentType === "Other"}
                onClick={() => setIncidentType("Other")} 
              />
            </div>

            {/* Description & Mic */}
            <div className="relative">
              <textarea 
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl p-4 pr-12 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24"
                placeholder="Describe what's happening (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button 
                onClick={handleVoiceInput}
                className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${isRecording ? 'bg-primary text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <Mic size={20} />
              </button>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Number / Location</label>
              <input 
                type="text" 
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl p-4 text-lg font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="e.g. 204 or Lobby"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        {status !== "idle" && (
          <div className="w-full bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">Status Tracker</h3>
            <div className="space-y-4">
              <StatusStep label="Alert Received" active={status === "sent" || status === "assigned"} />
              <StatusStep label="Staff Assigned" active={status === "assigned"} />
              <StatusStep label="Help Dispatched" active={false} />
            </div>
          </div>
        )}

      </main>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-lg mx-auto flex gap-4">
          <a href="tel:911" className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-colors">
            <Phone size={18} /> Call 911
          </a>
          <a href="tel:0" className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
            <Phone size={18} /> Front Desk
          </a>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-slide-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Send Emergency Alert?</h3>
              <p className="text-slate-600 mb-6">
                This will immediately notify all hotel staff to respond to your location.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={confirmSOS}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover active:scale-95 transition-all"
                >
                  YES, SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestSOS() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <GuestSOSContent />
    </Suspense>
  );
}

function QuickButton({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2 ${selected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
    >
      <div className={selected ? 'text-primary' : 'text-slate-400'}>{icon}</div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function StatusStep({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex items-center justify-center w-6 h-6">
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-success' : 'bg-slate-200'}`}></div>
        {active && <div className="absolute inset-0 bg-success/30 rounded-full animate-ping"></div>}
      </div>
      <span className={`font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}
