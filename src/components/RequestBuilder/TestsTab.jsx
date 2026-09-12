import Editor from '../Editor'
import { Input } from '../ui'

// Preset checkbox assertions + one custom-JS textarea. Kept deliberately simple.
export default function TestsTab({ tests, onChange }) {
  const t = tests || { presets: {}, script: '' }
  const p = t.presets || {}
  const setPreset = (patch) =>
    onChange({ ...t, presets: { ...p, ...patch } })

  return (
    <div className="max-w-3xl space-y-5 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-600 dark:text-forge-muted">
          Quick assertions
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!p.status200}
              onChange={(e) => setPreset({ status200: e.target.checked })}
              className="accent-forge-accent"
            />
            Status code is 200
          </label>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!p.responseTimeUnder?.enabled}
              onChange={(e) =>
                setPreset({
                  responseTimeUnder: {
                    ...p.responseTimeUnder,
                    enabled: e.target.checked,
                  },
                })
              }
              className="accent-forge-accent"
            />
            Response time under
            <Input
              type="number"
              value={p.responseTimeUnder?.ms ?? 500}
              onChange={(e) =>
                setPreset({
                  responseTimeUnder: {
                    ...p.responseTimeUnder,
                    ms: Number(e.target.value),
                  },
                })
              }
              className="w-24 py-1"
            />
            ms
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!p.bodyContainsKey?.enabled}
              onChange={(e) =>
                setPreset({
                  bodyContainsKey: {
                    ...p.bodyContainsKey,
                    enabled: e.target.checked,
                  },
                })
              }
              className="accent-forge-accent"
            />
            Body contains key / text
            <Input
              value={p.bodyContainsKey?.value || ''}
              onChange={(e) =>
                setPreset({
                  bodyContainsKey: {
                    ...p.bodyContainsKey,
                    value: e.target.value,
                  },
                })
              }
              placeholder="e.g. id"
              className="w-48 py-1 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!p.headerExists?.enabled}
              onChange={(e) =>
                setPreset({
                  headerExists: { ...p.headerExists, enabled: e.target.checked },
                })
              }
              className="accent-forge-accent"
            />
            Header exists
            <Input
              value={p.headerExists?.value || ''}
              onChange={(e) =>
                setPreset({
                  headerExists: { ...p.headerExists, value: e.target.value },
                })
              }
              placeholder="e.g. Content-Type"
              className="w-48 py-1 font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-zinc-600 dark:text-forge-muted">
          Custom script (advanced)
        </h3>
        <p className="mb-2 text-xs text-zinc-500">
          Available: <code className="text-forge-accent">response</code> (status,
          time, size, body, json, headers), and helpers{' '}
          <code className="text-forge-accent">test(name, fn)</code>,{' '}
          <code className="text-forge-accent">assert(cond, msg)</code>,{' '}
          <code className="text-forge-accent">expect(x).toBe(y)</code>.
        </p>
        <div className="editor-shell h-40">
          <Editor
            value={t.script}
            onChange={(script) => onChange({ ...t, script })}
            language="text"
            placeholder={`test('status is ok', () => {\n  expect(response.status).toBe(200)\n})`}
          />
        </div>
      </div>
    </div>
  )
}
