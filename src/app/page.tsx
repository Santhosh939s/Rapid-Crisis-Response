"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, Play, ChevronRight, Activity, Users, MapPin, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { setDemoMode } from "@/lib/firebaseUtils";

export default function LandingPage() {
  useEffect(() => {
    setDemoMode(false);
  }, []);
  return (
    <div className="min-h-screen bg-[#020817] text-slate-50 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-orange-900/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="bg-primary p-2 rounded-lg">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">CrisisLink</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <Link href="https://github.com/Santhosh939s/Rapid-Crisis-Response" target="_blank" className="hidden sm:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
            GitHub
          </Link>
          <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all">
            Login
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Version 2.0 Enterprise Release
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 mb-6"
          >
            Rapid Crisis <br className="hidden sm:block" /> Response
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-400 mb-10 max-w-2xl font-light leading-relaxed"
          >
            Enterprise AI-Powered Emergency Coordination Platform. Protect your facility with real-time geospatial tracking, intelligent dispatch, and Gemini AI integration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/demo" className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_-5px_rgba(220,38,38,0.6)]">
              <Play size={20} className="fill-white" />
              Live Interactive Demo
            </Link>
            <Link href="/login" className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-full text-lg font-bold transition-all">
              Platform Login
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid / Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-colors group">
            <div className="bg-red-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Firebase Realtime Database. Incident updates, SOS alerts, and status changes sync across all devices in under 100ms.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-colors group">
            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Geospatial Tracking</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Live HTML5 GPS streaming plots responders dynamically on an interactive Leaflet map, enabling commanders to deploy the closest staff.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-colors group">
            <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini AI Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Context-aware artificial intelligence assists commanders with step-by-step crisis mitigation plans and automated post-incident reporting.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
