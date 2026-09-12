import { Input, Select } from '../ui'

const TYPES = [
  { id: 'none', label: 'No Auth' },
  { id: 'bearer', label: 'Bearer Token' },
  { id: 'basic', label: 'Basic Auth' },
  { id: 'apikey', label: 'API Key' },
  { id: 'oauth2', label: 'OAuth 2.0 (token)' },
]

function Field({ label, children }) {
  return (
    <label className="grid grid-cols-[130px_1fr] items-center gap-3">
      <span className="text-sm text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

export default function AuthTab({ auth, onChange }) {
  const a = auth || { type: 'none' }
  const set = (patch) => onChange({ ...a, ...patch })
  const setSub = (key, patch) => set({ [key]: { ...a[key], ...patch } })

  return (
    <div className="max-w-2xl space-y-4 p-4">
      <Field label="Auth Type">
        <Select value={a.type} onChange={(e) => set({ type: e.target.value })}>
          {TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>

      {a.type === 'none' && (
        <p className="text-sm text-zinc-500">
          This request does not use authentication.
        </p>
      )}

      {a.type === 'bearer' && (
        <Field label="Token">
          <Input
            value={a.bearer?.token || ''}
            onChange={(e) => setSub('bearer', { token: e.target.value })}
            placeholder="{{token}} or paste token"
            className="font-mono"
          />
        </Field>
      )}

      {a.type === 'basic' && (
        <>
          <Field label="Username">
            <Input
              value={a.basic?.username || ''}
              onChange={(e) => setSub('basic', { username: e.target.value })}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={a.basic?.password || ''}
              onChange={(e) => setSub('basic', { password: e.target.value })}
            />
          </Field>
        </>
      )}

      {a.type === 'apikey' && (
        <>
          <Field label="Key">
            <Input
              value={a.apikey?.key || ''}
              onChange={(e) => setSub('apikey', { key: e.target.value })}
              placeholder="e.g. X-API-Key"
              className="font-mono"
            />
          </Field>
          <Field label="Value">
            <Input
              value={a.apikey?.value || ''}
              onChange={(e) => setSub('apikey', { value: e.target.value })}
              className="font-mono"
            />
          </Field>
          <Field label="Add to">
            <Select
              value={a.apikey?.addTo || 'header'}
              onChange={(e) => setSub('apikey', { addTo: e.target.value })}
            >
              <option value="header">Header</option>
              <option value="query">Query Param</option>
            </Select>
          </Field>
        </>
      )}

      {a.type === 'oauth2' && (
        <Field label="Access Token">
          <Input
            value={a.oauth2?.token || ''}
            onChange={(e) => setSub('oauth2', { token: e.target.value })}
            placeholder="Paste your OAuth2 access token"
            className="font-mono"
          />
        </Field>
      )}
    </div>
  )
}
