"use client";

import Link from "next/link";
import { useState, use } from "react";
import { api } from "../../../../lib/api";
import ThemeToggle from "../../../../components/ThemeToggle";

export default function ReportPage({ params }) {
  const { qrId } = use(params);

  const [reportText, setReportText] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submitReport(event) {
    event.preventDefault();
    if (!reportText.trim() || reportText.trim().length < 8) {
      setStatus("Please provide at least 8 characters describing the issue.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      await api.createReport({ qrId, reportText: reportText.trim() });
      setSent(true);
      setStatus("");
    } catch (err) {
      // Friendly, non-technical error message
      const errorMsg =
        err.message && !err.message.includes("at ") && !err.message.includes("Object.")
          ? err.message
          : "Unable to submit your report right now. Please check your network connection and try again.";
      setStatus(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setReportText("");
    setSent(false);
    setStatus("");
  }

  return (
    <main className="public-page">
      <section className="public-card">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link href={`/asset/${qrId}`} className="brand p-0">
            <span className="brand-mark">M</span>
            <div>
              <strong>MaintainIQ</strong>
              <small>Issue Reporting</small>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={`/asset/${qrId}`}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Back to Asset</span>
            </Link>
          </div>
        </div>

        {sent ? (
          /* Rich Success State */
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <span className="eyebrow justify-center">✓ Report Submitted</span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Report Received!
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-2 leading-relaxed">
                Your report has been successfully received. MaintainIQ is now executing
                automated AI triage to assign priority and dispatch a facility technician.
              </p>
            </div>

            <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Asset QR Ref:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{qrId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Initial Status:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">PENDING_TRIAGE</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
              <Link href={`/asset/${qrId}`} className="primary-button flex-1">
                View Asset Details
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="secondary-button flex-1 cursor-pointer"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        ) : (
          /* Reporting Form */
          <form className="report-form gap-4" onSubmit={submitReport}>
            <div>
              <span className="eyebrow">Public Issue Report</span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What needs attention?</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Describe the problem. Automated AI triage will prioritize and route this report to our maintenance team.
              </p>
            </div>

            {/* Target Asset Reference Pill */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400 shrink-0">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span>
                Reporting for Asset QR: <strong className="font-mono">{qrId}</strong>
              </span>
            </div>

            <label>
              <div className="flex items-center justify-between">
                <span>Issue description</span>
                <span className="text-[11px] font-normal text-slate-400">
                  {reportText.length} characters (min 8)
                </span>
              </div>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="E.g., Strange squealing noise from fan motor, water puddle forming underneath compressor..."
                minLength={8}
                rows={6}
                required
                className="resize-none"
              />
            </label>

            {status && (
              <p className="form-error text-xs flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{status}</span>
              </p>
            )}

            <button
              type="submit"
              className="primary-button full py-3 font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50"
              disabled={submitting || reportText.trim().length < 8}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting & Queueing AI Triage...</span>
                </>
              ) : (
                <>
                  <span>Submit Maintenance Report</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
