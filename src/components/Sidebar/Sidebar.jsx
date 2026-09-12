import { useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { newRequest } from '../../lib/factories'
import { statusColor, IconButton, MethodBadge } from '../ui'
import TreeNode from './TreeNode'
import {
  importPostmanCollection,
  exportPostmanCollection,
} from '../../lib/postmanImport'

function matchNode(node, q) {
  if (!q) return true
  if (node.name?.toLowerCase().includes(q)) return true
  if (node.url?.toLowerCase().includes(q)) return true
  if (node.items) return node.items.some((c) => matchNode(c, q))
  return false
}

function filterTree(items, q) {
  if (!q) return items
  return items
    .map((it) => {
      if (it.items) {
        const kids = filterTree(it.items, q)
        if (kids.length || it.name?.toLowerCase().includes(q))
          return { ...it, items: kids }
        return null
      }
      return matchNode(it, q) ? it : null
    })
    .filter(Boolean)
}

export default function Sidebar() {
  const [view, setView] = useState('collections')
  const [query, setQuery] = useState('')
  const fileRef = useRef(null)

  const collections = useStore((s) => s.collections)
  const history = useStore((s) => s.history)
  const addCollection = useStore((s) => s.addCollection)
  const deleteCollection = useStore((s) => s.deleteCollection)
  const renameCollection = useStore((s) => s.renameCollection)
  const addRequest = useStore((s) => s.addRequest)
  const openRequest = useStore((s) => s.openRequest)
  const importCollection = useStore((s) => s.importCollection)
  const openFromHistory = useStore((s) => s.openFromHistory)
  const clearHistory = useStore((s) => s.clearHistory)

  const q = query.trim().toLowerCase()

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const collection = importPostmanCollection(text)
      importCollection(collection)
    } catch (err) {
      window.alert(`Import failed: ${err.message}`)
    }
    e.target.value = ''
  }

  const handleExport = (collection) => {
    const data = exportPostmanCollection(collection)
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collection.name.replace(/\s+/g, '_')}.postman_collection.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col bg-zinc-100 dark:bg-forge-panel">
      {/* View toggle */}
      <div className="flex items-center gap-1 border-b border-zinc-200 p-2 dark:border-forge-border">
        <button
          onClick={() => setView('collections')}
          className={`rounded px-2.5 py-1 text-sm ${
            view === 'collections'
              ? 'bg-zinc-200 font-medium dark:bg-forge-hover'
              : 'text-zinc-500'
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => setView('history')}
          className={`rounded px-2.5 py-1 text-sm ${
            view === 'history'
              ? 'bg-zinc-200 font-medium dark:bg-forge-hover'
              : 'text-zinc-500'
          }`}
        >
          History
        </button>
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-forge-accent dark:border-forge-border dark:bg-forge-input dark:text-zinc-100"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
        {view === 'collections' && (
          <>
            <div className="mb-2 flex items-center gap-1">
              <button
                onClick={() => {
                  const name = window.prompt('Collection name', 'New Collection')
                  if (name) addCollection(name)
                }}
                className="flex-1 rounded-md border border-dashed border-zinc-300 py-1.5 text-sm text-zinc-500 hover:border-forge-accent hover:text-forge-accent dark:border-forge-border"
              >
                + New Collection
              </button>
              <IconButton
                title="Import Postman collection"
                onClick={() => fileRef.current?.click()}
              >
                ⭳
              </IconButton>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImport}
              />
            </div>

            {collections.length === 0 && (
              <p className="px-1 py-4 text-center text-xs text-zinc-500">
                No collections yet. Create one or import a Postman collection.
              </p>
            )}

            {collections.map((c) => {
              const items = filterTree(c.items, q)
              return (
                <div key={c.id} className="mb-3">
                  <div className="group flex items-center gap-1.5 rounded px-1 py-1">
                    <span className="text-sm">📦</span>
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    <span className="ml-auto hidden gap-1 group-hover:flex">
                      <MiniBtn
                        title="New request"
                        onClick={() => {
                          const req = newRequest()
                          addRequest(c.id, null, req)
                          openRequest(req, c.id)
                        }}
                      >
                        +
                      </MiniBtn>
                      <MiniBtn title="Export" onClick={() => handleExport(c)}>
                        ⭱
                      </MiniBtn>
                      <MiniBtn
                        title="Rename"
                        onClick={() => {
                          const name = window.prompt('Rename collection', c.name)
                          if (name) renameCollection(c.id, name)
                        }}
                      >
                        ✎
                      </MiniBtn>
                      <MiniBtn
                        title="Delete"
                        onClick={() => {
                          if (window.confirm(`Delete collection "${c.name}"?`))
                            deleteCollection(c.id)
                        }}
                      >
                        ×
                      </MiniBtn>
                    </span>
                  </div>
                  <div>
                    {items.map((node) => (
                      <TreeNode key={node.id} node={node} collectionId={c.id} />
                    ))}
                    {c.items.length === 0 && (
                      <p className="px-2 py-1 text-xs text-zinc-500">Empty</p>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}

        {view === 'history' && (
          <>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all history?')) clearHistory()
                }}
                className="mb-2 w-full text-right text-xs text-zinc-500 hover:text-red-500"
              >
                Clear history
              </button>
            )}
            {history.length === 0 && (
              <p className="px-1 py-4 text-center text-xs text-zinc-500">
                No requests yet.
              </p>
            )}
            {history
              .filter(
                (h) =>
                  !q ||
                  h.url?.toLowerCase().includes(q) ||
                  h.name?.toLowerCase().includes(q)
              )
              .map((h) => (
                <button
                  key={h.id}
                  onClick={() => openFromHistory(h)}
                  className="mb-0.5 flex w-full items-center gap-2 rounded-[4px] px-1.5 py-1 text-left text-sm hover:bg-zinc-200 dark:hover:bg-forge-hover"
                >
                  <span className={`font-mono text-xs font-semibold ${statusColor(h.status)}`}>
                    {h.status}
                  </span>
                  <span className="truncate text-xs text-zinc-600 dark:text-forge-muted">
                    {h.method} {h.url}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-500 dark:text-forge-muted">
                    {h.time}ms
                  </span>
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  )
}

function MiniBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-5 w-5 items-center justify-center rounded text-xs text-zinc-500 hover:bg-zinc-300 hover:text-zinc-800 dark:hover:bg-[#2d333b] dark:hover:text-zinc-100"
    >
      {children}
    </button>
  )
}
