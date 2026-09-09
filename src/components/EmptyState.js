"use client";

export default function EmptyState({
  title,
  text,
  actionText,
  actionHref,
  onAction,
  icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 mb-3 shadow-2xs">
        {icon || (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {text}
      </p>
      {actionText && actionHref && (
        <a href={actionHref} className="primary-button compact">
          {actionText}
        </a>
      )}
      {actionText && onAction && (
        <button onClick={onAction} className="primary-button compact cursor-pointer">
          {actionText}
        </button>
      )}
    </div>
  );
}
