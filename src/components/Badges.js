"use client";

const statusStyles = {
  PENDING_TRIAGE: "badge badge-amber",
  OPEN: "badge badge-blue",
  ASSIGNED: "badge badge-indigo",
  IN_PROGRESS: "badge badge-teal",
  RESOLVED: "badge badge-green",
  ACTIVE: "badge badge-green",
  UNDER_MAINTENANCE: "badge badge-amber",
  DECOMMISSIONED: "badge badge-slate",
};

const statusLabels = {
  PENDING_TRIAGE: "Pending Triage",
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  ACTIVE: "Active",
  UNDER_MAINTENANCE: "Under Maintenance",
  DECOMMISSIONED: "Decommissioned",
};

export function StatusBadge({ status }) {
  const normalized = status || "UNKNOWN";
  const styleClass = statusStyles[normalized] || "badge badge-slate";
  const label = statusLabels[normalized] || normalized.replaceAll("_", " ");

  return (
    <span className={styleClass}>
      <span className="badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

export function PriorityBadge({ priority = 1, showLabel = false }) {
  const level = Number(priority) || 1;
  const labels = {
    5: "Critical",
    4: "High",
    3: "Medium",
    2: "Low",
    1: "Minimal",
  };

  return (
    <span className={`priority priority-${level}`}>
      P{level}{showLabel ? ` · ${labels[level] || "Normal"}` : ""}
    </span>
  );
}
