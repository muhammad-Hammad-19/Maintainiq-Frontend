"use client";

import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="brand p-0">
            <span className="brand-mark">M</span>
            <div>
              <strong>MaintainIQ</strong>
              <small>Enterprise Facility Intelligence</small>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login" className="ghost-button compact text-xs">
              Sign In
            </Link>
            <Link href="/register" className="primary-button compact text-xs">
              Register Technician
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Next-Gen QR Maintenance Operations</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-[1.08]">
              Intelligent asset tracking from{" "}
              <span className="text-teal-700 dark:text-teal-400">QR scan</span> to{" "}
              <span className="text-teal-800 dark:text-teal-300">resolution</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Equip your facilities with smart QR codes. Facility occupants report issues
              instantly without app downloads; MaintainIQ auto-triages with AI and dispatches
              field technicians via real-time WebSocket alerts.
            </p>

            {/* Main Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/admin" className="primary-button py-3 px-5 text-sm font-semibold shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Admin Console</span>
              </Link>

              <Link href="/technician" className="secondary-button py-3 px-5 text-sm font-semibold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span>Technician Portal</span>
              </Link>
            </div>

            {/* Quick Demo QR Direct Link */}
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Test Public QR Flow:</span>
              <Link
                href="/asset/MIQ-HVAC-1001"
                className="font-mono text-teal-700 dark:text-teal-400 hover:text-teal-900 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 transition-colors inline-flex items-center gap-1"
              >
                <span>MIQ-HVAC-1001</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Hero Right: Live Architecture Workflow Preview */}
          <div className="lg:col-span-5">
            <div className="panel p-6 shadow-xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Live Operations Stream
                  </strong>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Real-time Active
                </span>
              </div>

              {/* Sample Ticket Preview */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Lobby Air Handler AHU-500
                    </strong>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                    P5 · Critical
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  &ldquo;Airflow is weak and there is a burning smell near the vent.&rdquo;
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/60 p-2 rounded-lg border border-teal-200/60 dark:border-teal-800">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400 shrink-0">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>AI Diagnosis: Fan belt wear or blocked intake</span>
                </div>
              </div>

              {/* 4 Stage Workflow Pipeline */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">1. Scan</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">QR Code</span>
                </div>
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">2. Triage</span>
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 mt-0.5">AI Engine</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">3. Push</span>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-0.5">Socket.io</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">4. Solve</span>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Band */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="panel p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Asset Registry</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unique QR codes generated per piece of equipment. Track install dates, location hierarchy, and warranty status.
              </p>
            </article>

            <article className="panel p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Public QR Reports</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No app installation required. Facility users scan physical QR labels and submit instant fault reports directly.
              </p>
            </article>

            <article className="panel p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">AI Triage Engine</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated classification generates priority scoring (P1–P5), executive summary, and probable root causes.
              </p>
            </article>

            <article className="panel p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Real-time Dispatch</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Socket.io channels push instant dispatch alerts to on-duty technician mobile devices with live sync.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>&copy; MaintainIQ Platform · Enterprise Maintenance Operations Management</p>
      </footer>
    </main>
  );
}
