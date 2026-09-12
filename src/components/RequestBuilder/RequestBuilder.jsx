import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Button, Select, methodColor } from '../ui'
import KeyValueTable from './KeyValueTable'
import BodyTab from './BodyTab'
import AuthTab from './AuthTab'
import TestsTab from './TestsTab'
import Editor from '../Editor'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
const SUBTABS = ['Params', 'Headers', 'Body', 'Auth', 'Pre-request', 'Tests']

function countActive(rows) {
  return (rows || []).filter((r) => r.enabled !== false && r.key).length
}

export default function RequestBuilder({ tab, onSave, onOpenCodeGen }) {
  const [sub, setSub] = useState('Params')
  const updateDraft = useStore((s) => s.updateDraft)
  const sendActiveRequest = useStore((s) => s.sendActiveRequest)

  if (!tab) return null
  const d = tab.draft
  const patch = (p) => updateDraft(tab.id, p)

  const authActive = d.auth && d.auth.type !== 'none'

  const badge = (name) => {
    if (name === 'Params') {
      const n = countActive(d.params)
      return n ? n : null
    }
    if (name === 'Headers') {
      const n = countActive(d.headers)
      return n ? n : null
    }
    if (name === 'Body') return d.body?.mode !== 'none' ? '•' : null
    if (name === 'Auth') return authActive ? '•' : null
    if (name === 'Pre-request') return d.preRequestScript?.trim() ? '•' : null
    return null
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-forge-bg">
      {/* URL bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 p-3 dark:border-forge-border">
        <Select
          value={d.method}
          onChange={(e) => patch({ method: e.target.value })}
          className={`font-mono font-semibold ${methodColor(d.method)}`}
        >
          {METHODS.map((m) => (
            <option key={m} value={m} className="text-zinc-800 dark:text-forge-text">
              {m}
            </option>
          ))}
        </Select>

        <input
          value={d.url}
          onChange={(e) => patch({ url: e.target.value })}
          placeholder="https://api.example.com/{{path}}"
          spellCheck={false}
          className="flex-1 rounded-[5px] border border-zinc-300 bg-white px-3 py-1.5 font-mono text-sm outline-none focus:border-forge-accent dark:border-forge-border dark:bg-forge-input dark:text-forge-text dark:placeholder:text-forge-muted/60"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              sendActiveRequest()
            }
          }}
        />

        <Button
          variant="primary"
          onClick={() => sendActiveRequest()}
          disabled={tab.sending || !d.url}
        >
          {tab.sending ? (
            <>
              <span className="inline-block animate-hammer">🔨</span>
              Forging…
            </>
          ) : (
            'Send'
          )}
        </Button>
        <Button onClick={() => onSave(tab)} title="Ctrl/Cmd+S">
          Save{tab.dirty ? ' •' : ''}
        </Button>
        <Button
          variant="ghost"
          onClick={() => onOpenCodeGen(tab)}
          title="Generate code"
          className="font-mono"
        >
          {'</>'}
        </Button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 px-2 dark:border-forge-border">
        {SUBTABS.map((name) => (
          <button
            key={name}
            onClick={() => setSub(name)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              sub === name
                ? 'border-b-2 border-forge-accent text-zinc-900 dark:text-forge-text'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800 dark:text-forge-muted dark:hover:text-forge-text'
            }`}
          >
            {name}
            {badge(name) && (
              <span className="ml-1 text-xs text-forge-accent">{badge(name)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab body */}
      <div className="min-h-0 flex-1 overflow-auto">
        {sub === 'Params' && (
          <div className="p-3">
            <KeyValueTable
              rows={d.params}
              onChange={(params) => patch({ params })}
              keyPlaceholder="param"
            />
          </div>
        )}
        {sub === 'Headers' && (
          <div className="p-3">
            <KeyValueTable
              rows={d.headers}
              onChange={(headers) => patch({ headers })}
              keyPlaceholder="header"
              headerSuggestions
            />
          </div>
        )}
        {sub === 'Body' && (
          <BodyTab body={d.body} onChange={(body) => patch({ body })} />
        )}
        {sub === 'Auth' && (
          <AuthTab auth={d.auth} onChange={(auth) => patch({ auth })} />
        )}
        {sub === 'Pre-request' && (
          <div className="flex h-full flex-col p-3">
            <p className="mb-2 text-xs text-zinc-500">
              Runs before the request. Use{' '}
              <code className="text-forge-accent">setVar(key, value)</code> to set a
              dynamic variable, and read current values from{' '}
              <code className="text-forge-accent">env</code>.
            </p>
            <div className="min-h-[160px] flex-1 overflow-hidden rounded-md border border-zinc-200 dark:border-forge-border">
              <Editor
                value={d.preRequestScript}
                onChange={(preRequestScript) => patch({ preRequestScript })}
                language="text"
                placeholder={`// e.g.\nsetVar('timestamp', Date.now())`}
              />
            </div>
          </div>
        )}
        {sub === 'Tests' && (
          <TestsTab tests={d.tests} onChange={(tests) => patch({ tests })} />
        )}
      </div>
    </div>
  )
}
