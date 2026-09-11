"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import EmptyState from "../../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../../components/Badges";
import { api, formatDate, getLocation } from "../../lib/api";
import { demoWorkOrders } from "../../lib/demo-data";
import { getSocket } from "../../lib/socket";
import { ListSkeleton, JobDetailSkeleton } from "../../components/Skeletons";
import { toast } from "react-toastify";

// Priority → accent stripe / diagnosis-card color. Falls back to neutral
// for unknown/missing priority values so we never render an unstyled card.
const PRIORITY_ACCENT = {
  P1: "border-l-red-500",
  P2: "border-l-amber-500",
  P3: "border-l-slate-400 dark:border-l-slate-600",
};

const PRIORITY_DIAGNOSIS_BG = {
  P1: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/60",
  P2: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50",
  P3: "bg-slate-100 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
};

export default function TechnicianPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null); // status in-flight, or null
  const [notice, setNotice] = useState("");
  const [mobileTab, setMobileTab] = useState("list"); // 'list' | 'detail'
  const [confirmResolve, setConfirmResolve] = useState(false);

  const updating = updatingStatus !== null;

  useEffect(() => {
    const socket = getSocket();
    const handleNewDispatch = (newJob) => {
      setJobs((prev) => [newJob, ...prev]);
      toast.info(`New job dispatched: ${newJob.asset?.name || "Equipment"}`);
    };
    socket.on("dispatch:new", handleNewDispatch);
    return () => socket.off("dispatch:new", handleNewDispatch);
  }, []);

  async function loadJobs(preserveSelection = true) {
    setLoading(true);
    try {
      const payload = await api.getMyJobs();
      const data = payload.data || [];
      setJobs(data);
      setNotice("");
      if (!preserveSelection || !data.some((job) => job._id === selectedId)) {
        setSelectedId(data[0]?._id || "");
      }
    } catch (err) {
      const demo = demoWorkOrders.filter((order) => order.status !== "OPEN");
      setJobs(demo);
      setNotice(`Demo mode: ${err.message}`);
      if (!preserveSelection || !demo.some((job) => job._id === selectedId)) {
        setSelectedId(demo[0]?._id || "");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotes("");
    setConfirmResolve(false);
  }, [selectedId]);

  const selected = useMemo(
    () => jobs.find((job) => job._id === selectedId),
    [jobs, selectedId],
  );

  async function updateStatus(status) {
    if (!selected) return;
    if (status === "RESOLVED" && !confirmResolve) {
      setConfirmResolve(true);
      return;
    }
    setUpdatingStatus(status);
    setNotice("");
    try {
      await api.updateWorkOrderStatus(selected._id, { status, notes });
      toast.success(`Job marked as ${status.replace("_", " ").toLowerCase()}.`);
      setConfirmResolve(false);
      await loadJobs();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
      setNotice(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  }

  function handleSelectJob(id) {
    setSelectedId(id);
    setMobileTab("detail");
  }

  return (
    <AppShell role="technician">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-3 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Field Technician Console
            </span>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              Assigned Work Orders
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Review assigned maintenance jobs, triage AI guidance, and log service updates.
            </p>
          </div>

          {notice && (
            <span
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 w-fit"
            >
              {notice}
            </span>
          )}
        </header>

        {/* Mobile Tab Switcher */}
        <div
          role="tablist"
          aria-label="Technician view"
          className="flex md:hidden items-center gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "list"}
            onClick={() => setMobileTab("list")}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mobileTab === "list"
                ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            My Jobs ({jobs.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "detail"}
            onClick={() => setMobileTab("detail")}
            disabled={!selected}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 ${
              mobileTab === "detail"
                ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Job Details
          </button>
        </div>

        {/* Main Two-Column Layout */}
        <section className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5 items-start">
          {/* Left Column: Jobs List */}
          <div
            className={`flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm dark:shadow-none ${
              mobileTab === "detail" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Job Queue</h2>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {jobs.length} assigned
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {loading ? (
                <ListSkeleton count={4} />
              ) : jobs.length === 0 ? (
                <EmptyState
                  title="No jobs assigned"
                  text="You currently have no open dispatches in your queue. Enjoy your shift!"
                />
              ) : (
                jobs.map((job) => {
                  const isSelected = job._id === selectedId;
                  const shortId = job._id ? job._id.slice(-5) : "-----";
                  const accent =
                    PRIORITY_ACCENT[job.aiClassification?.priority] ||
                    "border-l-slate-300 dark:border-l-slate-700";

                  return (
                    <button
                      key={job._id}
                      type="button"
                      aria-current={isSelected}
                      onClick={() => handleSelectJob(job._id)}
                      className={`w-full text-left rounded-lg border border-l-4 px-3 py-2.5 transition-colors ${accent} ${
                        isSelected
                          ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
                            {job.asset?.name || "Unknown asset"}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="truncate">{getLocation(job.asset)}</span>
                          </span>
                        </div>
                        <PriorityBadge priority={job.aiClassification?.priority} />
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <StatusBadge status={job.status} />
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                          #{shortId}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Job Detail */}
          <div
            className={`flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 min-h-[420px] shadow-sm dark:shadow-none ${
              mobileTab === "list" ? "hidden md:flex" : "flex"
            }`}
          >
            {loading ? (
              <JobDetailSkeleton />
            ) : !selected ? (
              <EmptyState
                title="Select a job"
                text="Choose an assigned work order from the queue to inspect AI triage recommendations and execute work."
              />
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {/* Back to list on mobile */}
                <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMobileTab("list")}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to all jobs
                  </button>
                  <StatusBadge status={selected.status} />
                </div>

                {/* Title & Asset Metadata */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                        {selected.asset?.name || "Facility Equipment"}
                      </h2>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        #{selected._id ? selected._id.slice(-6) : "------"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {getLocation(selected.asset)} · Dispatched {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  <div className="hidden md:block shrink-0">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                {/* AI Intelligence Card */}
                <div
                  className={`flex gap-3 rounded-lg border p-3 ${
                    PRIORITY_DIAGNOSIS_BG[selected.aiClassification?.priority] ||
                    "bg-slate-100 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <PriorityBadge priority={selected.aiClassification?.priority} showLabel />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                      </svg>
                      AI Triage Diagnosis
                    </div>
                    <strong className="block text-sm text-slate-900 dark:text-slate-100 font-medium mt-1">
                      {selected.aiClassification?.summary || "AI classification pending queue processing."}
                    </strong>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Suggested cause: </span>
                      {selected.aiClassification?.suggestedCause || "Diagnostics will update when background worker completes."}
                    </p>
                  </div>
                </div>

                {/* Original Reporter Description */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-500">Public issue report</span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">{selected.reportText}</p>
                </div>

                {/* Technician Service Notes */}
                <label htmlFor="service-notes" className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Service notes / action log
                  </span>
                  <textarea
                    id="service-notes"
                    rows={4}
                    placeholder="Record parts replaced, multimeter readings, root cause confirmation, or completion notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60"
                  />
                </label>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updating || selected.status === "IN_PROGRESS"}
                    onClick={() => updateStatus("IN_PROGRESS")}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingStatus === "IN_PROGRESS" ? (
                      <Spinner />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                    {selected.status === "IN_PROGRESS" ? "Work in progress" : "Start work"}
                  </button>

                  <button
                    type="button"
                    disabled={updating || selected.status === "RESOLVED"}
                    onClick={() => updateStatus("RESOLVED")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmResolve
                        ? "bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-400/50"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {updatingStatus === "RESOLVED" ? (
                      <Spinner />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {selected.status === "RESOLVED"
                      ? "Job resolved"
                      : confirmResolve
                        ? "Tap again to confirm"
                        : "Complete & mark resolved"}
                  </button>
                </div>
                {confirmResolve && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 -mt-2">
                    This closes the job out. Tap &quot;Tap again to confirm&quot;, or edit notes to cancel.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}