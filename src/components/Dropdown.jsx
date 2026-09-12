import { useState, useRef, useEffect } from 'react'

// Lightweight custom dropdown with a fade + slight scale-up on open (menu-pop).
// Data-driven; the trigger is fully custom via renderTrigger.
export default function Dropdown({
  value,
  onChange,
  options,
  renderTrigger,
  triggerClassName = '',
  align = 'left',
  menuClassName = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {renderTrigger(current, open)}
      </button>
      {open && (
        <div
          className={`menu-pop absolute z-40 mt-1 max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-forge-border dark:bg-forge-elevated dark:shadow-ember ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-forge-hover ${
                o.value === value
                  ? 'text-zinc-900 dark:text-forge-text'
                  : 'text-zinc-500 dark:text-forge-muted'
              }`}
            >
              {o.dot && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: o.dot }}
                />
              )}
              <span className={o.labelClassName || ''}>{o.label}</span>
              {o.value === value && (
                <span className="ml-auto text-forge-accent">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
