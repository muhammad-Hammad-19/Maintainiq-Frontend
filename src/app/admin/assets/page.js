"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../../components/AppShell";
import EmptyState from "../../../components/EmptyState";
import { StatusBadge } from "../../../components/Badges";
import { api, formatDate, getLocation } from "../../../lib/api";
import { demoAssets } from "../../../lib/demo-data";
import { ListSkeleton } from "../../../components/Skeletons";
import Link from "next/link";
import { toast } from "react-toastify";

const categories = [
  "HVAC",
  "Elevator",
  "Electrical",
  "Plumbing",
  "Machinery",
  "Structural",
  "Other",
];

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Other",
    building: "",
    floor: "",
    area: "",
    model: "",
    manufacturer: "",
    isCritical: false,
  });

  async function loadAssets() {
    setLoading(true);
    try {
      const payload = await api.getAssets();
      setAssets(payload.data || []);
      setNotice("");
    } catch (err) {
      setAssets(demoAssets);
      setNotice(`Demo mode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function createAsset(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");

    try {
      await api.createAsset({
        name: form.name,
        category: form.category,
        location: {
          building: form.building,
          floor: form.floor,
          area: form.area,
        },
        model: form.model,
        manufacturer: form.manufacturer,
        isCritical: form.isCritical,
      });

      toast.success("Asset registered successfully with unique QR!");
      setForm({
        name: "",
        category: "Other",
        building: "",
        floor: "",
        area: "",
        model: "",
        manufacturer: "",
        isCritical: false,
      });
      setIsFormOpen(false);
      await loadAssets();
    } catch (err) {
      toast.error(err.message || "Failed to create asset.");
      setNotice(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyQr(qrId) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(qrId);
      toast.success(`Copied QR ID: ${qrId}`);
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;
    return assets.filter((asset) =>
      [asset.name, asset.category, asset.status, asset.qrId, getLocation(asset)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [assets, query]);

  return (
    <AppShell role="admin">
      {/* Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Equipment Inventory
          </span>
          <h1>Facility Assets</h1>
          <p>Register machines, manage QR codes, and monitor equipment maintenance health.</p>
        </div>

        <div className="flex items-center gap-3">
          {notice && <span className="soft-alert">{notice}</span>}
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="primary-button compact cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isFormOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </>
              )}
            </svg>
            <span>{isFormOpen ? "Close Form" : "Register New Asset"}</span>
          </button>
        </div>
      </header>

      {/* Main Asset Layout */}
      <section className="asset-layout">
        {/* Collapsible / Sticky Add Asset Form */}
        {isFormOpen && (
          <form className="panel form-panel" onSubmit={createAsset}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">New Asset Registration</h2>
              <span className="text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 font-semibold px-2 py-0.5 rounded">
                Auto-generates QR
              </span>
            </div>

            <label>
              Asset Name
              <input
                placeholder="E.g., North Lobby Chiller #2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            {/* Location details */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Location
              </span>
              <div className="form-grid">
                <label>
                  Building
                  <input
                    placeholder="Tower A"
                    value={form.building}
                    onChange={(e) => setForm({ ...form, building: e.target.value })}
                  />
                </label>
                <label>
                  Floor
                  <input
                    placeholder="Level 3"
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Area / Room
                <input
                  placeholder="Mechanical Room 302"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                />
              </label>
            </div>

            {/* Tech Specs */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Specifications
              </span>
              <div className="form-grid">
                <label>
                  Model Number
                  <input
                    placeholder="CH-5000X"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </label>
                <label>
                  Manufacturer
                  <input
                    placeholder="Carrier"
                    value={form.manufacturer}
                    onChange={(e) =>
                      setForm({ ...form, manufacturer: e.target.value })
                    }
                  />
                </label>
              </div>
            </div>

            <label className="checkbox-row py-1">
              <input
                type="checkbox"
                checked={form.isCritical}
                onChange={(e) =>
                  setForm({ ...form, isCritical: e.target.checked })
                }
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Mark as Critical Infrastructure (prioritized response)
              </span>
            </label>

            <button
              type="submit"
              className="primary-button full mt-2 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? "Registering Asset..." : "Create Asset & Generate QR"}
            </button>
          </form>
        )}

        {/* Asset Registry List */}
        <div className={`panel ${!isFormOpen ? "col-span-full" : ""}`}>
          <div className="section-title">
            <div className="flex items-center gap-2">
              <h2>Equipment Registry</h2>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {filtered.length} total
              </span>
            </div>

            <div className="search-wrap max-w-xs">
              <svg
                className="search-icon"
                width="15"
                height="15"
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
                placeholder="Search assets by name, QR, location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <ListSkeleton count={5} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No assets found"
              text={
                query
                  ? `No asset matches "${query}". Try another keyword.`
                  : "No facility assets have been registered yet."
              }
              actionText={query ? "Clear Search" : "Register First Asset"}
              onAction={query ? () => setQuery("") : () => setIsFormOpen(true)}
            />
          ) : (
            <div className="asset-list">
              {filtered.map((asset) => (
                <article
                  className="asset-row hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  key={asset._id}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {asset.name}
                      </strong>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {asset.category}
                      </span>
                      {asset.isCritical && (
                        <span className="text-[10px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
                          Critical
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{getLocation(asset)}</span>
                      {asset.model && <span>· Model: {asset.model}</span>}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => copyQr(asset.qrId)}
                        className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to copy QR ID"
                      >
                        <span>QR: {asset.qrId}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Added: {formatDate(asset.installDate)}
                      </span>
                    </div>
                  </div>

                  <div className="item-actions shrink-0">
                    <StatusBadge status={asset.status} />
                    <Link
                      className="primary-button compact text-xs"
                      href={`/asset/${asset?.qrId}`}
                      title="Open public QR page"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>View QR Page</span>
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
