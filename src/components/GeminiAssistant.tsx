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
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-5 mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={64} />
      </div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
          <Sparkles size={18} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">AI Response Planner</h2>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <button 
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan || !activeIncident}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isGeneratingPlan && !responsePlan ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Generate Response Plan
          </button>
          
          {responsePlan && (
            <div className="mt-3 bg-white border border-indigo-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap animate-slide-in shadow-inner">
              <h4 className="font-bold text-indigo-800 mb-2">Recommended Actions:</h4>
              {responsePlan}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-indigo-200/50">
          <button 
            onClick={handleGenerateAnnouncement}
            disabled={isGeneratingAnnounce || !activeIncident}
            className="w-full flex items-center justify-center gap-2 bg-white text-indigo-700 border border-indigo-200 font-bold py-2.5 rounded-lg shadow-sm hover:bg-indigo-50 disabled:opacity-50 transition-colors"
          >
            {isGeneratingAnnounce && !announcement ? <Loader2 size={18} className="animate-spin" /> : null}
            Draft Guest Announcement
          </button>

          {announcement && (
            <div className="mt-3 space-y-2 animate-slide-in">
              <div className="bg-white border border-indigo-100 rounded-lg p-3 text-sm text-slate-700 italic shadow-inner">
                "{announcement}"
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md text-xs font-bold transition-colors">
                  <Languages size={14} /> Translate
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary-hover text-white py-2 rounded-md text-xs font-bold transition-colors shadow-sm">
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
