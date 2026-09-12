import { useRef, useLayoutEffect, useState } from 'react'

// Horizontal tabs with an underline indicator that slides between tabs (120ms)
// instead of jumping. Shared by the request sub-tabs and the response tabs.
export default function SlidingTabs({ items, active, onChange, className = '' }) {
  const btnRefs = useRef({})
  const [bar, setBar] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    const el = btnRefs.current[active]
    if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
  }, [active, items])

  return (
    <div className={`relative flex items-center gap-1 ${className}`}>
      {items.map((it) => (
        <button
          key={it.id}
          ref={(el) => (btnRefs.current[it.id] = el)}
          onClick={() => onChange(it.id)}
          className={`px-3 py-2 text-[13px] transition-colors ${
            active === it.id
              ? 'font-semibold text-zinc-900 dark:text-forge-text'
              : 'font-medium text-zinc-500 hover:text-zinc-800 dark:text-forge-muted dark:hover:text-forge-text'
          }`}
        >
          {it.label}
          {it.badge != null && it.badge !== false && (
            <span className="ml-1 text-xs text-forge-accent">{it.badge}</span>
          )}
        </button>
      ))}
      <span
        className={`pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-forge-accent shadow-[0_0_8px_0_rgba(232,89,12,0.6)] transition-all duration-[120ms] ease-out ${
          bar.ready ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: bar.left, width: bar.width }}
      />
    </div>
  )
}
