"use client";

import { useState } from "react";
import { Sparkles, Loader2, Languages, Send } from "lucide-react";
import type { Incident } from "@/lib/types";
import { generateResponsePlan, generateGuestAnnouncement } from "@/app/actions/gemini";

export default function GeminiAssistant({ activeIncident }: { activeIncident?: Incident }) {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingAnnounce, setIsGeneratingAnnounce] = useState(false);
  const [responsePlan, setResponsePlan] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!activeIncident) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await generateResponsePlan(activeIncident);
      setResponsePlan(plan);
    } catch (error) {
      alert("Failed to generate plan.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateAnnouncement = async () => {
    if (!activeIncident) return;
    setIsGeneratingAnnounce(true);
    try {
      const ann = await generateGuestAnnouncement(activeIncident);
      setAnnouncement(ann);
    } catch (error) {
      alert("Failed to generate announcement.");
    } finally {
      setIsGeneratingAnnounce(false);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 mt-6 relative overflow-hidden flex-1">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Sparkles size={120} className="text-blue-400" />
      </div>
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="bg-blue-500/20 text-blue-400 p-2 rounded-xl border border-blue-500/20">
          <Sparkles size={20} />
        </div>
        <h2 className="text-xl font-bold text-white">Gemini AI Command</h2>
      </div>

      <div className="space-y-4 relative z-10 flex flex-col h-full">
        <div>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan || !activeIncident}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white border border-white/10 font-bold py-3 rounded-xl hover:bg-slate-700 hover:border-white/20 disabled:opacity-50 transition-all"
          >
            {isGeneratingPlan && !responsePlan ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <Sparkles size={18} className="text-blue-400" />}
            Generate Strategy Plan
          </button>
          
          {responsePlan && (
            <div className="mt-4 bg-slate-800/80 border border-blue-500/20 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap animate-slide-in">
              <h4 className="font-bold text-blue-400 mb-2 uppercase tracking-widest text-xs">AI Recommended Strategy:</h4>
              <div className="leading-relaxed">{responsePlan}</div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/5">
          <button 
            onClick={handleGenerateAnnouncement}
            disabled={isGeneratingAnnounce || !activeIncident}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white border border-white/10 font-bold py-3 rounded-xl hover:bg-slate-700 hover:border-white/20 disabled:opacity-50 transition-all"
          >
            {isGeneratingAnnounce && !announcement ? <Loader2 size={18} className="animate-spin text-emerald-400" /> : null}
            Draft Public Broadcast
          </button>

          {announcement && (
            <div className="mt-4 space-y-3 animate-slide-in">
              <div className="bg-slate-800/80 border border-emerald-500/20 rounded-xl p-4 text-sm text-slate-300 italic">
                "{announcement}"
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all">
                  <Languages size={14} /> Translate
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl text-xs font-bold transition-all">
                  <Send size={14} /> Broadcast
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
