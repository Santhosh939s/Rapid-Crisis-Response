"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setDemoMode } from "@/lib/firebaseUtils";
import { triggerSimulation } from "@/lib/mockData";
import { Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoLauncher() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const startDemo = () => {
    setStarting(true);
    // 1. Enable Demo Mode across the app
    setDemoMode(true);

    // 2. Start the simulation engine
    triggerSimulation();

    // 3. Redirect to the Commander Dashboard to watch it unfold
    setTimeout(() => {
      router.push("/commander/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-6 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Play className="text-primary fill-primary ml-1" size={32} />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Live Simulation</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          You are about to enter the automated Demo Mode. This will simulate a complete crisis lifecycle (SOS Trigger → AI Dispatch → Resolution) without requiring an account.
        </p>

        <button 
          onClick={startDemo}
          disabled={starting}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-full transition-all shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)] disabled:opacity-70"
        >
          {starting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Initializing Simulation...
            </>
          ) : (
            "Launch Commander Demo"
          )}
        </button>

        <p className="text-xs text-slate-500 mt-6">
          Data generated during this simulation is isolated and does not affect the production database.
        </p>
      </motion.div>
    </div>
  );
}
