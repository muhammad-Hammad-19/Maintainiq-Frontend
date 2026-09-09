"use client";

import { getSocket } from "@/lib/socket.js";
import { api } from "@/lib/api.js";
import { getStoredAuth } from "@/lib/auth.js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProtectedRoute from "./ProtectedRoute";
import ThemeToggle from "./ThemeToggle";

const navConfig = {
  admin: [
    {
      label: "Overview",
      href: "/admin",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      label: "Tickets",
      href: "/admin/tickets",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
      ),
    },
    {
      label: "Assets",
      href: "/admin/assets",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
  ],
  technician: [
    {
      label: "My Jobs",
      href: "/technician",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
  ],
};

export default function AppShell({ role, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navConfig[role] || [];
  const [isConnected, setIsConnected] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.user?.name) {
      setUserName(auth.user.name);
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      console.log("✅ Socket connected:", socket.id);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(err) {
      setIsConnected(false);
      console.error("❌ Socket connection error:", err.message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
      toast.info("Logged out successfully");
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  // Determine breadcrumb current label
  const activeItem = items.find((item) => item.href === pathname);
  const currentTitle = activeItem ? activeItem.label : role === "admin" ? "Console" : "Portal";

  return (
    <ProtectedRoute requiredRole={role.toUpperCase()}>
      <div className="app-frame">
        {/* Desktop Sidebar */}
        <aside className="sidebar">
          <Link href="/" className="brand">
            <span className="brand-mark">M</span>
            <div>
              <strong>MaintainIQ</strong>
              <small>
                {role === "admin" ? "Admin Operations" : "Technician Field App"}
              </small>
            </div>
          </Link>

          <nav className="nav-list" aria-label={`${role} navigation`}>
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  className={isActive ? "nav-link active" : "nav-link"}
                  key={item.href}
                >
                  <span className={isActive ? "text-teal-700 dark:text-teal-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
            {/* User info if available */}
            {userName && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center font-bold text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <span className="block font-semibold truncate">{userName}</span>
                </div>
              </div>
            )}

            {/* Socket status badge in sidebar */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="font-medium text-[11px]">
                {isConnected ? "Realtime sync active" : "Connecting sync..."}
              </span>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors w-full text-left cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{loggingOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <div className="app-content">
          {/* Top bar header */}
          <header className="app-topbar">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                MaintainIQ
              </Link>
              <span>/</span>
              <span className="capitalize">{role}</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">{currentTitle}</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Socket status pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                }`}
                title={isConnected ? "WebSocket connected" : "Connecting..."}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span className="hidden sm:inline">
                  {isConnected ? "Live Socket" : "Offline"}
                </span>
              </span>

              {/* Role pill */}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                {role}
              </span>

              {/* Sign out button */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="ghost-button compact text-xs"
                title="Sign out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden md:inline">Sign out</span>
              </button>
            </div>
          </header>

          {/* Content Body */}
          <main className="workspace">{children}</main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="mobile-nav" aria-label={`${role} mobile navigation`}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                className={isActive ? "mobile-link active" : "mobile-link"}
                key={item.href}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="mobile-link text-slate-500 dark:text-slate-400 hover:text-red-600 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
