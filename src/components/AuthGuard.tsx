"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children, role }: { children: React.ReactNode, role?: "Staff" | "Commander" }) {
  const { currentUser, loading, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until Firebase Auth is done

    if (!currentUser) {
      if (pathname.includes("/commander")) {
        router.push("/commander/login");
      } else {
        router.push("/staff/login");
      }
      return;
    }

    // Role-based protection
    if (role && userRole && userRole !== role) {
      // User is logged in but doesn't have the correct role
      if (userRole === "Commander") {
        router.push("/commander/dashboard");
      } else {
        router.push("/staff/dashboard");
      }
    }
  }, [currentUser, loading, userRole, router, pathname, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}
