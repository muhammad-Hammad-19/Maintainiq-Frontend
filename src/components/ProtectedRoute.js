"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredAuth, getUserRole, clearStoredAuth } from "../lib/auth";
import { api } from "../lib/api";

export default function ProtectedRoute({ requiredRole, children }) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState("CHECKING"); // 'CHECKING' | 'AUTHORIZED' | 'UNAUTHENTICATED' | 'FORBIDDEN'
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const auth = getStoredAuth();
    const role = getUserRole();
    setCurrentRole(role);

    if (!auth || !auth.token) {
      setAuthStatus("UNAUTHENTICATED");
      router.replace("/login");
      return;
    }

    const normalizedRequired = (requiredRole || "").toUpperCase();
    const normalizedCurrent = (role || "").toUpperCase();

    if (normalizedRequired && normalizedCurrent !== normalizedRequired) {
      setAuthStatus("FORBIDDEN");
      return;
    }

    setAuthStatus("AUTHORIZED");
  }, [requiredRole, router]);

  async function handleSignOut() {
    try {
      await api.logout();
    } catch {
      clearStoredAuth();
    }
    router.replace("/login");
  }

  // 1. Checking state: Clean, branded loading animation (No UI Flash!)
  if (authStatus === "CHECKING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <span className="brand-mark w-14 h-14 text-xl shadow-lg">M</span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Verifying Security Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Checking role permissions for MaintainIQ...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: redirected to login, render empty view
  if (authStatus === "UNAUTHENTICATED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-xs text-slate-400">Redirecting to login...</div>
      </div>
    );
  }

  // 3. Forbidden: Wrong role (e.g. Technician trying to open /admin)
  if (authStatus === "FORBIDDEN") {
    const isTech = currentRole === "TECHNICIAN";
    const recommendedPath = isTech ? "/technician" : "/admin";
    const recommendedLabel = isTech ? "Go to Technician Portal" : "Go to Admin Console";

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="panel max-w-md w-full p-6 text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div>
            <span className="eyebrow justify-center text-amber-600 dark:text-amber-400">
              403 Forbidden · Access Denied
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              Restricted Area
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              You are signed in as{" "}
              <strong className="text-slate-900 dark:text-slate-200 uppercase font-mono">
                {currentRole || "User"}
              </strong>
              , but this section requires{" "}
              <strong className="text-teal-700 dark:text-teal-400 uppercase font-mono">
                {requiredRole}
              </strong>{" "}
              authorization.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <Link href={recommendedPath} className="primary-button full">
              {recommendedLabel}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="ghost-button full text-xs text-slate-500"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized: Render protected children
  return <>{children}</>;
}
