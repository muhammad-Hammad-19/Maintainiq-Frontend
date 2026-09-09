"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { api, formatDate, getLocation } from "../../../lib/api";
import { demoAssets } from "../../../lib/demo-data";
import { StatusBadge } from "../../../components/Badges";
import { AssetCardSkeleton } from "../../../components/Skeletons";
import ThemeToggle from "../../../components/ThemeToggle";
import { toast } from "react-toastify";

export default function PublicAssetPage({ params }) {
  const { qrId } = use(params);

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const payload = await api.getAssetByQrId(qrId);
        setAsset(payload.data);
        setNotice("");
      } catch (err) {
        setAsset(
          demoAssets.find((item) => item.qrId === qrId) || demoAssets[0],
        );
        setNotice(`Demo mode: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [qrId]);

  function copyQrId() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(asset?.qrId || qrId);
      setCopied(true);
      toast.success("Asset QR ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading && !asset) {
    return (
      <main className="public-page">
        <AssetCardSkeleton />
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="public-page">
        <div className="public-card text-center items-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Asset Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We could not find an equipment record matching QR: <strong>{qrId}</strong>.
          </p>
          <Link href="/" className="primary-button mt-4">
            Return to MaintainIQ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="public-page">
      <section className="public-card">
        {/* Header with Brand & Public Indicator */}
        <div className="flex items-center justify-between">
          <Link href="/" className="brand p-0">
            <span className="brand-mark">M</span>
            <div>
              <strong>MaintainIQ</strong>
              <small>Public Facility Portal</small>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Verified Asset
            </span>
          </div>
        </div>

        {notice && <span className="soft-alert">{notice}</span>}

        {/* Critical Infrastructure Warning Banner */}
        {asset.isCritical && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-medium">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400 shrink-0">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <strong className="block font-semibold">Critical Facility Equipment</strong>
              <span>High priority asset with expedited response protocol.</span>
            </div>
          </div>
        )}

        {/* Asset Header Information */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="eyebrow">Asset QR Details</span>
            <button
              onClick={copyQrId}
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Click to copy QR ID"
            >
              <span>{asset.qrId}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{asset.name}</h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{getLocation(asset)}</span>
          </div>
        </div>

        {/* Fact Cards Grid */}
        <div className="asset-facts">
          <div className="asset-fact-card">
            <span>Category</span>
            <strong>{asset.category || "General"}</strong>
          </div>

          <div className="asset-fact-card">
            <span>Status</span>
            <div>
              <StatusBadge status={asset.status} />
            </div>
          </div>

          <div className="asset-fact-card">
            <span>Model</span>
            <strong>{asset.model || "Standard unit"}</strong>
          </div>

          <div className="asset-fact-card">
            <span>Installed</span>
            <strong>{formatDate(asset.installDate)}</strong>
          </div>
        </div>

        {/* Extra specifications if available */}
        {(asset.manufacturer || asset.warrantyExpiry) && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
            {asset.manufacturer && (
              <span>Mfg: <strong className="text-slate-700 dark:text-slate-200">{asset.manufacturer}</strong></span>
            )}
            {asset.warrantyExpiry && (
              <span>Warranty: <strong className="text-slate-700 dark:text-slate-200">{formatDate(asset.warrantyExpiry)}</strong></span>
            )}
          </div>
        )}

        {/* Primary CTA Button */}
        <Link
          href={`/asset/${asset.qrId}/report`}
          className="primary-button full py-3 font-semibold text-sm shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Report an issue with this asset</span>
        </Link>
      </section>
    </main>
  );
}
