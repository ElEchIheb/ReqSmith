import { useMemo, useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { methodColor } from '../ui'

// Flatten all requests across all collections for quick search.
function collectRequests(collections) {
  const out = []
  const walk = (items, collectionId, path) => {
    for (const it of items) {
      if (it.type === 'folder') walk(it.items || [], collectionId, `${path}${it.name}/`)
      else out.push({ node: it, collectionId, path })
    }
  }
  for (const c of collections) walk(c.items, c.id, `${c.name}/`)
  return out
}

export default function CommandPalette({ onClose }) {
  const collections = useStore((s) => s.collections)
  const openRequest = useStore((s) => s.openRequest)
  const openNewTab = useStore((s) => s.openNewTab)
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const all = useMemo(() => collectRequests(collections), [collections])
  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!q) return all.slice(0, 50)
    return all
      .filter(
        (r) =>
          r.node.name?.toLowerCase().includes(q) ||
          r.node.url?.toLowerCase().includes(q) ||
          r.path.toLowerCase().includes(q)
      )
      .slice(0, 50)
  }, [all, q])

  useEffect(() => setSel(0), [query])

  const choose = (r) => {
    if (!r) return
    openRequest(r.node, r.collectionId)
    onClose()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[sel])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="elevated-surface menu-pop w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 dark:border-forge-border"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search requests…"
          className="w-full border-b border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-forge-border"
        />
        <div className="max-h-80 overflow-auto py-1">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">
              No matching requests.
              <div className="mt-2">
                <button
                  onClick={() => {
                    openNewTab()
                    onClose()
                  }}
                  className="text-forge-accent hover:underline"
                >
                  + Open a new blank request
                </button>
              </div>
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.node.id}
              onMouseEnter={() => setSel(i)}
              onClick={() => choose(r)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${
                i === sel ? 'bg-zinc-100 dark:bg-forge-hover' : ''
              }`}
            >
              <span className={`font-mono text-[10px] font-bold ${methodColor(r.node.method)}`}>
                {r.node.method}
              </span>
              <span className="truncate">{r.node.name}</span>
              <span className="ml-auto truncate text-xs text-zinc-500">{r.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
