"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import EmptyState from "../../components/EmptyState";
import MetricCard from "../../components/MetricCard";
import { PriorityBadge, StatusBadge } from "../../components/Badges";
import { api, formatDate, getLocation } from "../../lib/api";
import { demoAssets, demoWorkOrders } from "../../lib/demo-data";
import { MetricsGridSkeleton, ListSkeleton } from "../../components/Skeletons";

export default function AdminDashboard() {
  const [assets, setAssets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [assetPayload, openPayload] = await Promise.all([
          api.getAssets(),
          api.getWorkOrders("OPEN"),
        ]);
        setAssets(assetPayload.data || []);
        setOrders(openPayload.data || []);
        setNotice("");
      } catch (err) {
        setAssets(demoAssets);
        setOrders(demoWorkOrders);
        setNotice(`Demo mode: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inProgress = orders.filter((order) => order.status === "IN_PROGRESS");
  const criticalAssets = assets.filter((asset) => asset.isCritical);

  return (
    <AppShell role="admin">
      {/* Dashboard Command Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20" />
              <path d="m17 5-5-3-5 3" />
              <path d="m17 19-5 3-5-3" />
              <path d="M2 12h20" />
            </svg>
            Operations Command Center
          </span>
          <h1>Operations Dashboard</h1>
          <p>Real-time facility status, priority work orders, and asset health.</p>
        </div>

        <div className="flex items-center gap-3">
          {notice && <span className="soft-alert">{notice}</span>}
          <Link href="/admin/assets" className="secondary-button compact">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Asset</span>
          </Link>
          <Link href="/admin/tickets" className="primary-button compact">
            <span>Review Tickets</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* KPI Metrics Strip */}
      {loading ? (
        <MetricsGridSkeleton />
      ) : (
        <section className="metrics-grid">
          <MetricCard
            label="Total Assets"
            value={assets.length}
            detail={`${criticalAssets.length} critical infrastructure`}
            tone="blue"
          />
          <MetricCard
            label="Open Work Orders"
            value={orders.length}
            detail="Active backend tickets"
            tone="amber"
          />
          <MetricCard
            label="In Progress"
            value={inProgress.length}
            detail="Technicians currently on-site"
            tone="teal"
          />
          <MetricCard
            label="Resolved (Monthly)"
            value="Active"
            detail="Backend auto-tracking"
            tone="purple"
          />
        </section>
      )}

      {/* Main Split Panels */}
      <section className="split-grid">
        {/* Priority Tickets Panel */}
        <div className="panel">
          <div className="section-title">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2>Urgent Work Orders</h2>
            </div>
            <Link href="/admin/tickets" className="text-xs">
              View all tickets ({orders.length}) &rarr;
            </Link>
          </div>

          {loading ? (
            <ListSkeleton count={4} />
          ) : orders.length === 0 ? (
            <EmptyState
              title="No open tickets"
              text="No open work orders require attention right now."
              actionText="Create asset to test"
              actionHref="/admin/assets"
            />
          ) : (
            <div className="stack">
              {orders.slice(0, 5).map((order) => (
                <article
                  className="list-item hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  key={order._id}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {order.asset?.name || "Unknown asset"}
                      </strong>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        #{order._id.slice(-5)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      {order.aiClassification?.summary || order.reportText}
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                      {getLocation(order.asset)} · {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="item-actions shrink-0">
                    <PriorityBadge
                      priority={order.aiClassification?.priority}
                    />
                    <StatusBadge status={order.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assets Panel */}
        <div className="panel">
          <div className="section-title">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <h2>Recent Facility Assets</h2>
            </div>
            <Link href="/admin/assets" className="text-xs">
              Manage inventory ({assets.length}) &rarr;
            </Link>
          </div>

          {loading ? (
            <ListSkeleton count={4} />
          ) : assets.length === 0 ? (
            <EmptyState
              title="No assets registered"
              text="Add facility equipment to generate trackable QR identifiers."
              actionText="Register first asset"
              actionHref="/admin/assets"
            />
          ) : (
            <div className="stack">
              {assets.slice(0, 5).map((asset) => (
                <article
                  className="list-item hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  key={asset._id}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {asset.name}
                      </strong>
                      {asset.isCritical && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {getLocation(asset)} · <span className="font-medium text-slate-700 dark:text-slate-300">{asset.category}</span>
                    </p>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block mt-1">
                      QR: {asset.qrId}
                    </span>
                  </div>

                  <div className="item-actions shrink-0">
                    <StatusBadge status={asset.status} />
                    <Link
                      className="ghost-button compact text-xs"
                      href={`/asset/${asset?.qrId}`}
                      title="View public QR page"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span className="hidden sm:inline">QR Page</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
