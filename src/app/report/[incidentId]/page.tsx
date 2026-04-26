"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, FileText, Download, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import type { Incident } from "@/lib/types";

// Mock Incident Data for Report
const MOCK_RESOLVED_INCIDENT: Incident = {
  id: "INC-001",
  type: "Medical Emergency",
  roomNumber: "304",
  floor: "Floor 3",
  severity: "Resolved",
  status: "resolved",
  assignedTo: "John Doe",
  createdAt: Date.now() - 3600000, // 1 hr ago
  updatedAt: Date.now() - 1800000,
  resolvedAt: Date.now() - 1800000, // resolved 30 mins ago
  timeline: [
    { action: "Alert Received via Guest SOS App", timestamp: Date.now() - 3600000 },
    { action: "Staff member John Doe assigned by Commander", timestamp: Date.now() - 3500000 },
    { action: "John Doe marked status 'On Scene'", timestamp: Date.now() - 3300000 },
    { action: "Ambulance called by Command Center", timestamp: Date.now() - 3250000 },
    { action: "Ambulance arrived", timestamp: Date.now() - 2400000 },
    { action: "Incident marked as Resolved", timestamp: Date.now() - 1800000 },
  ]
};

import { generateLessonsLearned } from "@/app/actions/gemini";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessons, setLessons] = useState<string[] | null>(null);

  const incidentId = typeof params.incidentId === 'string' ? params.incidentId : "INC-001";
  
  // MOCK: in real app, fetch based on incidentId
  const incident = MOCK_RESOLVED_INCIDENT;

  const handleGenerateLessons = async () => {
    setIsGenerating(true);
    try {
      if (!incident.timeline) return;
      const generatedLessons = await generateLessonsLearned(incident.timeline);
      setLessons(generatedLessons);
    } catch (error) {
      alert("Failed to generate insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-xl">Post-Incident Report</h1>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-slate-500 font-bold mb-1">INCIDENT {incidentId}</div>
              <h2 className="text-3xl font-black text-slate-900">{incident.type}</h2>
              <div className="text-lg text-slate-600 mt-1">Room {incident.roomNumber} ({incident.floor})</div>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 self-start font-bold">
              <CheckCircle2 size={20} /> RESOLVED
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div>
              <div className="text-sm text-slate-500 font-medium mb-1">Date</div>
              <div className="font-bold">{new Date(incident.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium mb-1">Duration</div>
              <div className="font-bold">30 mins</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium mb-1">Primary Responder</div>
              <div className="font-bold">{incident.assignedTo}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-medium mb-1">Response Time</div>
              <div className="font-bold text-success">5m 00s</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Clock size={20} className="text-slate-500" /> Incident Timeline
          </h3>
          
          <div className="space-y-6 pl-2">
            {incident.timeline?.map((item, index) => (
              <div key={index} className="relative pl-6 border-l-2 border-slate-200">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                <div className="text-sm text-slate-500 font-medium mb-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
                <div className="font-semibold text-slate-800">{item.action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Lessons Learned */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6 sm:p-8 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6 border-b border-indigo-200/50 pb-4">
            <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
              <Lightbulb size={24} className="text-indigo-600" /> AI Insights & Lessons Learned
            </h3>
          </div>

          {!lessons ? (
            <div className="text-center py-8">
              <p className="text-indigo-700 mb-4 font-medium">Use Gemini AI to analyze the timeline and generate improvement recommendations.</p>
              <button 
                onClick={handleGenerateLessons}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? "Analyzing Timeline..." : "Generate AI Insights"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-in">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="bg-white border border-indigo-100 p-4 rounded-lg flex gap-3 shadow-sm">
                  <div className="bg-indigo-100 text-indigo-700 font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 font-medium">{lesson}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
