import { newKV } from '../../lib/factories'
import { IconButton } from '../ui'

const COMMON_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'Cache-Control',
  'User-Agent',
  'Cookie',
  'Origin',
  'Referer',
  'Accept-Language',
  'X-Requested-With',
  'X-API-Key',
]

// Editable key/value table with per-row enable toggle. Auto-grows a trailing
// blank row so there's always somewhere to type.
export default function KeyValueTable({
  rows = [],
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  headerSuggestions = false,
}) {
  const ensureTrailingBlank = (list) => {
    const last = list[list.length - 1]
    if (!last || last.key || last.value) return [...list, newKV()]
    return list
  }

  const update = (id, patch) => {
    let next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    next = ensureTrailingBlank(next)
    onChange(next)
  }

  const remove = (id) => {
    let next = rows.filter((r) => r.id !== id)
    if (next.length === 0) next = [newKV()]
    onChange(next)
  }

  const list = rows.length ? rows : [newKV()]

  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-forge-border">
      {headerSuggestions && (
        <datalist id="common-headers">
          {COMMON_HEADERS.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-500 dark:border-forge-border dark:bg-forge-panel dark:text-forge-muted">
            <th className="w-8 px-2 py-1.5"></th>
            <th className="px-2 py-1.5 font-medium">Key</th>
            <th className="px-2 py-1.5 font-medium">Value</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr
              key={row.id}
              className="border-b border-zinc-100 last:border-0 dark:border-forge-border/50"
            >
              <td className="px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={row.enabled !== false}
                  onChange={(e) => update(row.id, { enabled: e.target.checked })}
                  className="accent-forge-accent"
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  value={row.key}
                  list={headerSuggestions ? 'common-headers' : undefined}
                  onChange={(e) => update(row.id, { key: e.target.value })}
                  placeholder={keyPlaceholder}
                  className="w-full bg-transparent px-1 py-1 font-mono text-[13px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  value={row.value}
                  onChange={(e) => update(row.id, { value: e.target.value })}
                  placeholder={valuePlaceholder}
                  className="w-full bg-transparent px-1 py-1 font-mono text-[13px] outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
              </td>
              <td className="px-1 text-center">
                <IconButton
                  title="Remove"
                  onClick={() => remove(row.id)}
                  className="h-6 w-6"
                >
                  ×
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
