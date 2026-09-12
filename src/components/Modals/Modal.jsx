import { useEffect } from 'react'

export default function Modal({ title, onClose, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className={`menu-pop w-full ${width} overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-forge-border dark:bg-forge-elevated dark:shadow-ember`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-forge-border">
            <h2 className="text-sm font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded px-2 text-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-forge-hover"
            >
              ×
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-auto">{children}</div>
      </div>
    </div>
  )
}
