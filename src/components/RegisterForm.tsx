"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      // Give them a moment to see the success message
      setTimeout(() => {
        router.push("/staff/login"); // Redirect to login page after creation
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register account");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary mb-6">
          <UserPlus size={48} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Create Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-100">
              Account created successfully! Redirecting...
            </div>
          )}
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full bg-white text-slate-900 px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="name@hotel.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full bg-white text-slate-900 px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/staff/login" className="font-medium text-primary hover:text-primary-hover">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
