"use client";

export function SkeletonPulse({ className = "", height = "1rem", width = "100%" }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

export function MetricsGridSkeleton() {
  return (
    <section className="metrics-grid" aria-label="Loading metrics">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="metric">
          <div className="metric-header">
            <SkeletonPulse width="45%" height="0.85rem" />
            <SkeletonPulse width="2rem" height="2rem" className="rounded-lg" />
          </div>
          <SkeletonPulse width="35%" height="2.2rem" className="my-1" />
          <SkeletonPulse width="65%" height="0.8rem" />
        </div>
      ))}
    </section>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="responsive-table">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <SkeletonPulse width="60%" height="0.8rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <SkeletonPulse
                    width={c === 0 ? "75%" : c === 1 ? "90%" : "50%"}
                    height="1rem"
                  />
                  {c === 0 && (
                    <SkeletonPulse
                      width="50%"
                      height="0.75rem"
                      className="mt-1"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="stack">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="list-item">
          <div style={{ flex: 1 }}>
            <SkeletonPulse width="45%" height="1.05rem" />
            <SkeletonPulse width="65%" height="0.8rem" className="mt-1.5" />
          </div>
          <SkeletonPulse width="5rem" height="1.6rem" className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="public-card">
      <div className="flex items-center gap-3">
        <SkeletonPulse width="2.25rem" height="2.25rem" className="rounded-xl" />
        <SkeletonPulse width="7rem" height="1.2rem" />
      </div>

      <div className="mt-2">
        <SkeletonPulse width="30%" height="0.8rem" />
        <SkeletonPulse width="70%" height="2rem" className="mt-2" />
        <SkeletonPulse width="50%" height="1rem" className="mt-1.5" />
      </div>

      <div className="asset-facts">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="asset-fact-card">
            <SkeletonPulse width="40%" height="0.7rem" />
            <SkeletonPulse width="75%" height="1.1rem" className="mt-1" />
          </div>
        ))}
      </div>

      <SkeletonPulse width="100%" height="2.75rem" className="rounded-xl mt-2" />
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="stack">
      <div className="flex items-center justify-between">
        <div>
          <SkeletonPulse width="12rem" height="1.4rem" />
          <SkeletonPulse width="8rem" height="0.85rem" className="mt-1" />
        </div>
        <SkeletonPulse width="5.5rem" height="1.6rem" className="rounded-full" />
      </div>

      <div className="ai-box">
        <SkeletonPulse width="2rem" height="2rem" className="rounded-full" />
        <div style={{ flex: 1 }}>
          <SkeletonPulse width="40%" height="1rem" />
          <SkeletonPulse width="85%" height="0.85rem" className="mt-2" />
        </div>
      </div>

      <div className="report-text">
        <SkeletonPulse width="25%" height="0.75rem" />
        <SkeletonPulse width="95%" height="2.5rem" className="mt-1" />
      </div>

      <SkeletonPulse width="100%" height="5rem" className="rounded-xl" />

      <div className="flex gap-3 mt-2">
        <SkeletonPulse width="50%" height="2.75rem" className="rounded-xl" />
        <SkeletonPulse width="50%" height="2.75rem" className="rounded-xl" />
      </div>
    </div>
  );
}
