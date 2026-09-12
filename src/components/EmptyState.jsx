// Branded empty states — a low-opacity line-art forge mark plus a two-line
// message, instead of a lone centered sentence.

export function AnvilIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      {/* anvil silhouette */}
      <path d="M12 22 H40 L54 26 L42 28 H38 L36 36 L46 38 V46 H18 V38 L28 36 L26 28 H12 Z" />
      {/* ground line */}
      <path d="M14 52 H50" opacity="0.5" />
    </svg>
  )
}

export function FolderForgeIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 20 H26 L30 25 H54 V46 H10 Z" />
      {/* small ember spark inside */}
      <path d="M32 32 l3 5 -3 2 -3 -2 z" opacity="0.6" />
    </svg>
  )
}

export default function EmptyState({ icon, title, subtitle, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 text-center ${className}`}
    >
      <div className="text-forge-accent/25 dark:text-forge-accent/30">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-600 dark:text-forge-text/80">
          {title}
        </p>
        {subtitle && (
          <p className="text-[13px] text-zinc-500 dark:text-forge-muted">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
