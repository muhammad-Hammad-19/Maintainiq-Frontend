"use client";

import { useEffect, useMemo, useState } from "react";
import { getSocket } from "../../../lib/socket.js";
import AppShell from "../../../components/AppShell";
import EmptyState from "../../../components/EmptyState";
import { PriorityBadge, StatusBadge } from "../../../components/Badges";
import { api, formatDate, getLocation } from "../../../lib/api";
import { demoWorkOrders } from "../../../lib/demo-data";
import { TableSkeleton } from "../../../components/Skeletons";
import { toast } from "react-toastify";

const statuses = [
  "OPEN",
  "PENDING_TRIAGE",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
];

const ASSIGNABLE_STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS"];

export default function AdminTicketsPage() {
  const [status, setStatus] = useState("OPEN");
  const [orders, setOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Real-time socket subscription for new tickets
  useEffect(() => {
    const socket = getSocket();

    const handleNewTicket = (newOrder) => {
      console.log("📥 New ticket received via socket:", newOrder);
      toast.info(`New work order: ${newOrder.asset?.name || "Facility Asset"}`);

      if (newOrder.status === status) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    };

    socket.on("ticket:created", handleNewTicket);

    return () => {
      socket.off("ticket:created", handleNewTicket);
    };
  }, [status]);

  // Load work orders when status filter changes
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const payload = await api.getWorkOrders(status);
        setOrders(payload.data || []);
        setNotice("");
      } catch (err) {
        setOrders(
          demoWorkOrders.filter((order) =>
            status === "OPEN" ? true : order.status === status,
          ),
        );
        setNotice(`Demo mode: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  // Fetch technicians once on page load
  useEffect(() => {
    async function loadTechnicians() {
      try {
        const payload = await api.getTechnicians();
        setTechnicians(payload.data || []);
      } catch (err) {
        console.error("Failed to load technicians:", err.message);
      }
    }
    loadTechnicians();
  }, []);

  // Handle assigning work order to technician
  const handleAssign = async (workOrderId, technicianId) => {
    if (!technicianId) return;

    setAssigningId(workOrderId);
    try {
      const result = await api.assignWorkOrder(workOrderId, technicianId);

      if (result.success) {
        toast.success("Work order assigned successfully!");
        // Instantly remove assigned order from the current filter list
        setOrders((prev) => prev.filter((o) => o._id !== workOrderId));
        if (selectedTicket?._id === workOrderId) {
          setSelectedTicket(null);
        }
      } else {
        toast.error(result.message || "Assignment failed");
      }
    } catch {
      toast.error("Something went wrong while assigning.");
    } finally {
      setAssigningId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) =>
      [
        order.asset?.name,
        order.asset?.category,
        order.reportText,
        order.aiClassification?.summary,
        order._id,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [orders, query]);

  return (
    <AppShell role="admin">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
            Maintenance Queue
          </span>
          <h1>Work Orders</h1>
          <p>Triage AI classifications, inspect reports, and dispatch technicians.</p>
        </div>

        {notice && <span className="soft-alert">{notice}</span>}
      </header>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        {statuses.map((item) => {
          const isActive = status === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`px-3 py-2 rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-teal-700 dark:border-teal-400 text-teal-800 dark:text-teal-300 font-semibold bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <span>{item.replaceAll("_", " ")}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search by asset name, category, report text, or #ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium px-2">
          {filtered.length} {filtered.length === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      {/* Main Table / Content Section */}
      <section className="panel p-0 overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tickets found"
              text={
                query
                  ? `No work orders matched "${query}". Try adjusting your search.`
                  : `There are currently no tickets in ${status.replaceAll("_", " ")} status.`
              }
              actionText={query ? "Clear Search" : undefined}
              onAction={query ? () => setQuery("") : undefined}
            />
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "26%" }}>Asset & Location</th>
                  <th style={{ width: "34%" }}>AI Triage & Issue</th>
                  <th style={{ width: "14%" }}>Status</th>
                  <th style={{ width: "12%" }}>Created</th>
                  <th style={{ width: "14%" }}>Dispatch Technician</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Asset & Location */}
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {order.asset?.name || "Unknown asset"}
                          </strong>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            #{order._id.slice(-5)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {getLocation(order.asset)}
                        </span>
                      </div>
                    </td>

                    {/* AI Triage & Issue */}
                    <td>
                      <div className="table-ai">
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge
                            priority={order.aiClassification?.priority}
                            showLabel
                          />
                          {order.aiClassification?.category && (
                            <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                              {order.aiClassification.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 mt-0.5">
                          {order.aiClassification?.summary || order.reportText}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(order)}
                          className="text-[11px] text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold text-left inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <span>Inspect details</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Created Date */}
                    <td>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Technician Dispatch Dropdown */}
                    <td>
                      {ASSIGNABLE_STATUSES.includes(order.status) ? (
                        <div className="relative">
                          <select
                            defaultValue=""
                            disabled={assigningId === order._id}
                            onChange={(e) =>
                              handleAssign(order._id, e.target.value)
                            }
                            className="text-xs py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:border-slate-400 focus:border-teal-700 disabled:opacity-50"
                          >
                            <option value="" disabled>
                              {assigningId === order._id
                                ? "Assigning..."
                                : order.assignedTechnician
                                ? `Assigned: ${order.assignedTechnician.name || "Tech"}`
                                : "Select technician..."}
                            </option>
                            {technicians.map((tech) => (
                              <option key={tech._id} value={tech._id}>
                                {tech.name} ({tech.openJobsCount} open)
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ticket Details Inspection Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded">
                  #{selectedTicket._id.slice(-6)}
                </span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                  Asset Record
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedTicket.asset?.name || "Unknown Asset"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Location: {getLocation(selectedTicket.asset)} · QR: {selectedTicket.asset?.qrId || "N/A"}
                </p>
              </div>

              {/* AI Analysis Box */}
              <div className="ai-box">
                <div className="shrink-0 mt-0.5">
                  <PriorityBadge
                    priority={selectedTicket.aiClassification?.priority}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                    </svg>
                    <span>AI Classification: {selectedTicket.aiClassification?.category || "General"}</span>
                  </div>
                  <strong className="block text-xs text-slate-900 dark:text-slate-100 mt-1 font-semibold">
                    {selectedTicket.aiClassification?.summary || "AI classification pending"}
                  </strong>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <strong>Suggested Cause:</strong>{" "}
                    {selectedTicket.aiClassification?.suggestedCause || "No cause suggested yet."}
                  </p>
                </div>
              </div>

              {/* Original Report Text */}
              <div className="report-text">
                <span>Original Public Report</span>
                <p className="text-slate-800 dark:text-slate-200">{selectedTicket.reportText}</p>
              </div>

              {/* Timestamp info */}
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>Reported: {formatDate(selectedTicket.createdAt)}</span>
                <span>Type: {selectedTicket.reporterType || "PUBLIC"}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="secondary-button compact"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
