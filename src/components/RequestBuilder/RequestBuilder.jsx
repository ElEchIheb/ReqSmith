import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Button, methodColor, methodTint } from '../ui'
import Dropdown from '../Dropdown'
import KeyValueTable from './KeyValueTable'
import BodyTab from './BodyTab'
import AuthTab from './AuthTab'
import TestsTab from './TestsTab'
import Editor from '../Editor'
import SlidingTabs from '../SlidingTabs'

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
      {/* URL bar — method + URL merged into one cohesive control */}
      <div className="flex items-center gap-2 border-b border-zinc-200 p-3 dark:border-forge-border">
        <div className="ember-focus flex flex-1 items-center rounded-[6px] border border-zinc-300 bg-white dark:border-forge-border dark:bg-forge-input">
          <Dropdown
            value={d.method}
            onChange={(m) => patch({ method: m })}
            options={METHODS.map((m) => ({
              value: m,
              label: m,
              labelClassName: `font-mono font-semibold ${methodColor(m)}`,
            }))}
            triggerClassName={`flex items-center gap-1.5 self-stretch rounded-l-[5px] border-r border-zinc-300 px-3 font-mono text-sm font-semibold transition-colors dark:border-forge-border ${methodTint(
              d.method
            )}`}
            renderTrigger={(cur, open) => (
              <>
                <span>{d.method}</span>
                <span
                  className={`text-[10px] opacity-60 transition-transform duration-150 ${
                    open ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </>
            )}
          />
          <input
            value={d.url}
            onChange={(e) => patch({ url: e.target.value })}
            placeholder="https://api.example.com/{{path}}"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-[14px] outline-none dark:text-forge-text dark:placeholder:text-forge-muted/60"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                sendActiveRequest()
              }
            }}
          />
        </div>

        <Button
          variant="primary"
          onClick={() => sendActiveRequest()}
          disabled={tab.sending || !d.url}
        >
          {tab.sending ? (
            <>
              <span className="h-2 w-2 animate-heartbeat rounded-full bg-white shadow-[0_0_8px_1px_rgba(255,255,255,0.7)]" />
              Sending…
            </>
          ) : (
            'Send'
          )}
        </Button>
        <Button variant="secondary" onClick={() => onSave(tab)} title="Ctrl/Cmd+S">
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
      <SlidingTabs
        className="border-b border-zinc-200 px-2 dark:border-forge-border"
        items={SUBTABS.map((name) => ({ id: name, label: name, badge: badge(name) }))}
        active={sub}
        onChange={setSub}
      />

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
            <div className="editor-shell min-h-[160px] flex-1">
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
