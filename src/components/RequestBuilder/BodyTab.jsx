import Editor from '../Editor'
import KeyValueTable from './KeyValueTable'
import { Select } from '../ui'

const MODES = [
  { id: 'none', label: 'none' },
  { id: 'raw', label: 'raw' },
  { id: 'form-data', label: 'form-data' },
  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { id: 'binary', label: 'binary' },
]

export default function BodyTab({ body, onChange }) {
  const b = body || { mode: 'none' }

  const set = (patch) => onChange({ ...b, ...patch })

  const beautify = () => {
    try {
      set({ raw: JSON.stringify(JSON.parse(b.raw || ''), null, 2) })
    } catch {
      /* leave invalid JSON as-is */
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-3 py-2 dark:border-forge-border">
        {MODES.map((m) => (
          <label key={m.id} className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="body-mode"
              checked={b.mode === m.id}
              onChange={() => set({ mode: m.id })}
              className="accent-forge-accent"
            />
            <span className="font-mono text-[13px]">{m.label}</span>
          </label>
        ))}

        {b.mode === 'raw' && (
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={b.rawType || 'json'}
              onChange={(e) => set({ rawType: e.target.value })}
              className="py-1"
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
              <option value="html">HTML</option>
            </Select>
            {b.rawType === 'json' && (
              <button
                onClick={beautify}
                className="text-xs text-forge-accent hover:underline"
              >
                Beautify
              </button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {b.mode === 'none' && (
          <p className="py-6 text-center text-sm text-zinc-500">
            This request has no body.
          </p>
        )}

        {b.mode === 'raw' && (
          <div className="editor-shell h-full min-h-[160px]">
            <Editor
              value={b.raw}
              onChange={(raw) => set({ raw })}
              language={b.rawType === 'json' ? 'json' : 'text'}
              placeholder="Request body…"
            />
          </div>
        )}

        {b.mode === 'form-data' && (
          <KeyValueTable
            rows={b.formData || []}
            onChange={(formData) => set({ formData })}
          />
        )}

        {b.mode === 'x-www-form-urlencoded' && (
          <KeyValueTable
            rows={b.urlencoded || []}
            onChange={(urlencoded) => set({ urlencoded })}
          />
        )}

        {b.mode === 'binary' && (
          <div className="text-sm text-zinc-500">
            <input
              type="file"
              onChange={(e) =>
                set({ binaryName: e.target.files?.[0]?.name || '' })
              }
              className="text-sm"
            />
            {b.binaryName && (
              <p className="mt-2 text-xs">
                Selected: <span className="font-mono">{b.binaryName}</span> — note:
                binary bodies are not persisted between sessions.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
