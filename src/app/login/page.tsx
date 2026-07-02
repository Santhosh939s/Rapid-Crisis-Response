import Link from "next/link";
import { User, ShieldAlert, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="md:w-1/2 bg-background flex flex-col justify-center items-center p-8 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
        <div className="absolute animate-pulse-ring rounded-full w-96 h-96 bg-primary/10 -z-10"></div>
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 tracking-tight">
          Rapid Crisis Response
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 text-center max-w-md">
          Instant crisis coordination for hospitality venues
        </p>
      </div>

      {/* Right Panel */}
      <div className="md:w-1/2 bg-slate-50 dark:bg-slate-900 flex flex-col justify-center p-8 md:p-16">
        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-2xl font-semibold mb-8 text-center text-foreground">Select your role to continue</h2>

          <Link
            href="/guest"
            className="flex items-center p-6 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-hover hover:scale-[0.98] transition-all duration-200 group"
          >
            <div className="bg-white/20 p-4 rounded-full mr-6 group-hover:bg-white/30 transition-colors">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">I'm a Guest</h3>
              <p className="text-primary-50 opacity-90">Report an emergency</p>
            </div>
          </Link>

          <Link
            href="/staff/login"
            className="flex items-center p-6 bg-warning text-white rounded-xl shadow-lg hover:bg-warning/90 hover:scale-[0.98] transition-all duration-200 group"
          >
            <div className="bg-white/20 p-4 rounded-full mr-6 group-hover:bg-white/30 transition-colors">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">I'm Hotel Staff</h3>
              <p className="text-white/90">Respond to incidents</p>
            </div>
          </Link>

          <Link
            href="/commander/login"
            className="flex items-center p-6 bg-secondary text-white rounded-xl shadow-lg hover:bg-secondary/90 hover:scale-[0.98] transition-all duration-200 group"
          >
            <div className="bg-white/20 p-4 rounded-full mr-6 group-hover:bg-white/30 transition-colors">
              <Star size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold">I'm a Crisis Commander</h3>
              <p className="text-white/90">Coordinate and manage</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          Scan the QR code in your room to skip this screen
        </div>
      </div>
    </div>
  );
}
