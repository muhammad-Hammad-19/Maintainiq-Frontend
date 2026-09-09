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

export default function TechnicianPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileTab, setMobileTab] = useState("list"); // 'list' | 'detail'

  // Socket.io real-time dispatch subscription
  useEffect(() => {
    const socket = getSocket();

    const handleNewDispatch = (newJob) => {
      console.log("📥 New job assigned:", newJob);
      setJobs((prev) => [newJob, ...prev]);
      toast.info(`🔔 New job dispatched: ${newJob.asset?.name || "Equipment"}`);
    };

    socket.on("dispatch:new", handleNewDispatch);

    return () => {
      socket.off("dispatch:new", handleNewDispatch);
    };
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const payload = await api.getMyJobs();
      const data = payload.data || [];
      setJobs(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0]._id);
      }
      setNotice("");
    } catch (err) {
      const demo = demoWorkOrders.filter((order) => order.status !== "OPEN");
      setJobs(demo);
      if (demo.length > 0 && !selectedId) {
        setSelectedId(demo[0]._id);
      }
      setNotice(`Demo mode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const selected = useMemo(
    () => jobs.find((job) => job._id === selectedId),
    [jobs, selectedId],
  );

  async function updateStatus(status) {
    if (!selected) return;

    setUpdating(true);
    const friendlyName = status.replace("_", " ").toLowerCase();
    setNotice(`Updating job to ${friendlyName}...`);

    try {
      await api.updateWorkOrderStatus(selected._id, { status, notes });
      toast.success(`Job marked as ${status.replace("_", " ")}!`);
      setNotes("");
      setNotice("");
      await loadJobs();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
      setNotice(err.message);
    } finally {
      setUpdating(false);
    }
  }

  function handleSelectJob(id) {
    setSelectedId(id);
    setMobileTab("detail");
  }

  return (
    <AppShell role="technician">
      {/* Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Field Technician Console
          </span>
          <h1>Assigned Work Orders</h1>
          <p>Review assigned maintenance jobs, triage AI guidance, and log service updates.</p>
        </div>

        {notice && <span className="soft-alert">{notice}</span>}
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileTab === "list"
              ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          My Jobs ({jobs.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("detail")}
          disabled={!selected}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileTab === "detail"
              ? "bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50"
          }`}
        >
          Job Details
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <section className="tech-layout">
        {/* Left Column: Jobs List */}
        <div
          className={`panel job-list ${
            mobileTab === "detail" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Job Queue</h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {jobs.length} assigned
            </span>
          </div>

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
              return (
                <button
                  key={job._id}
                  className={`job-card cursor-pointer ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectJob(job._id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 pr-1">
                      <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
                        {job.asset?.name || "Unknown asset"}
                      </strong>
                      <small className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{getLocation(job.asset)}</span>
                      </small>
                    </div>

                    <PriorityBadge priority={job.aiClassification?.priority} />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <StatusBadge status={job.status} />
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      #{job._id.slice(-5)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Job Detail */}
        <div
          className={`panel job-detail ${
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
              <div className="flex md:hidden items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMobileTab("list")}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span>Back to all jobs</span>
                </button>
                <StatusBadge status={selected.status} />
              </div>

              {/* Title & Asset Metadata */}
              <div className="section-title items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {selected.asset?.name || "Facility Equipment"}
                    </h2>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      #{selected._id.slice(-6)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {getLocation(selected.asset)} · Dispatched: {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className="hidden md:block">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* AI Intelligence Card */}
              <div className="ai-box">
                <div className="shrink-0 mt-0.5">
                  <PriorityBadge
                    priority={selected.aiClassification?.priority}
                    showLabel
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                    </svg>
                    <span>AI Triage Diagnosis</span>
                  </div>
                  <strong className="block text-xs text-slate-900 dark:text-slate-100 font-semibold mt-1">
                    {selected.aiClassification?.summary || "AI classification pending queue processing."}
                  </strong>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <strong>Suggested Cause:</strong>{" "}
                    {selected.aiClassification?.suggestedCause || "Diagnostics will update when background worker completes."}
                  </p>
                </div>
              </div>

              {/* Original Reporter Description */}
              <div className="report-text">
                <span>Public Issue Report</span>
                <p className="text-slate-800 dark:text-slate-200">{selected.reportText}</p>
              </div>

              {/* Technician Service Notes */}
              <label>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Service Notes / Action Log
                </span>
                <textarea
                  rows={4}
                  placeholder="Record parts replaced, multimeter readings, root cause confirmation, or completion notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </label>

              {/* Action Buttons */}
              <div className="status-actions pt-2">
                <button
                  type="button"
                  className="secondary-button flex-1 py-2.5 font-semibold text-sm cursor-pointer"
                  disabled={updating || selected.status === "IN_PROGRESS"}
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>
                    {selected.status === "IN_PROGRESS"
                      ? "Work In Progress"
                      : "Start Work (In Progress)"}
                  </span>
                </button>

                <button
                  type="button"
                  className="primary-button flex-1 py-2.5 font-semibold text-sm cursor-pointer"
                  disabled={updating || selected.status === "RESOLVED"}
                  onClick={() => updateStatus("RESOLVED")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>
                    {selected.status === "RESOLVED"
                      ? "Job Resolved"
                      : "Complete & Mark Resolved"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
