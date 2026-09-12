import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Button, statusColor } from '../ui'
import Editor from '../Editor'
import JsonTree from './JsonTree'
import EmptyState, { AnvilIcon } from '../EmptyState'
import SlidingTabs from '../SlidingTabs'

const TABS = ['Pretty', 'Raw', 'Preview', 'Headers', 'Cookies']

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function parseCookies(headers) {
  const out = []
  for (const [k, v] of Object.entries(headers || {})) {
    if (k.toLowerCase() === 'set-cookie') {
      const parts = v.split(';')
      const [name, ...val] = parts[0].split('=')
      out.push({ name: name.trim(), value: val.join('='), raw: v })
    }
  }
  return out
}

export default function ResponseViewer({ tab }) {
  const [active, setActive] = useState('Pretty')
  const [copied, setCopied] = useState(false)
  const sendActiveRequest = useStore((s) => s.sendActiveRequest)

  if (!tab) return null

  // Error state (network/CORS)
  if (tab.error) {
    return (
      <div className="panel-surface flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-2xl">⚠️</div>
        <p className="max-w-md text-sm text-err">{tab.error}</p>
        {tab.corsLike && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-500 dark:text-forge-muted">
              This API likely blocks direct browser requests (CORS).
            </p>
            <Button
              variant="primary"
              onClick={() => sendActiveRequest({ useProxy: true })}
            >
              Retry via Proxy
            </Button>
          </div>
        )}
      </div>
    )
  }

  const res = tab.response
  if (!res) {
    return (
      <div className="panel-surface flex h-full items-center justify-center">
        {tab.sending ? (
          <div className="flex flex-col items-center gap-3 text-sm text-zinc-500 dark:text-forge-muted">
            <span className="h-3 w-3 animate-heartbeat rounded-full bg-forge-accent shadow-[0_0_12px_2px_rgba(232,89,12,0.6)]" />
            Forging request…
          </div>
        ) : (
          <EmptyState
            icon={<AnvilIcon className="h-16 w-16" />}
            title="No response yet"
            subtitle="Send a request to forge a response."
          />
        )}
      </div>
    )
  }

  let parsed = null
  const looksJson =
    /json/i.test(res.contentType) ||
    /^\s*[[{]/.test(res.body || '')
  if (looksJson) {
    try {
      parsed = JSON.parse(res.body)
    } catch {
      parsed = null
    }
  }

  const isHtml = /html/i.test(res.contentType)
  const cookies = parseCookies(res.headers)

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard blocked */
    }
  }

  const statusBg =
    res.status >= 200 && res.status < 300
      ? 'bg-ok/12'
      : res.status >= 300 && res.status < 400
        ? 'bg-warn/12'
        : res.status >= 400
          ? 'bg-err/12'
          : 'bg-forge-hover'

  return (
    <div className="panel-surface flex h-full flex-col">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-zinc-200 px-3 py-2 text-sm dark:border-forge-border">
        {/* Hot-stamp: keyed so it re-animates on every new response */}
        <span
          key={`${res.status}-${res.time}`}
          className={`inline-flex animate-hotStamp items-center rounded-[3px] px-2 py-0.5 font-mono text-sm font-semibold ${statusBg} ${statusColor(
            res.status
          )}`}
        >
          {res.status} {res.statusText}
        </span>
        <span className="text-zinc-500 dark:text-forge-muted">
          Time:{' '}
          <span className="font-mono text-zinc-700 dark:text-forge-text">
            {res.time} ms
          </span>
        </span>
        <span className="text-zinc-500 dark:text-forge-muted">
          Size:{' '}
          <span className="font-mono text-zinc-700 dark:text-forge-text">
            {formatSize(res.size)}
          </span>
        </span>
        {res.viaProxy && (
          <span className="rounded-[3px] bg-forge-accent/15 px-1.5 py-0.5 text-xs text-forge-accent">
            via proxy
          </span>
        )}
        <button
          onClick={() => copy(res.body)}
          className="ml-auto text-xs text-forge-accent hover:underline"
        >
          {copied ? 'Copied!' : 'Copy body'}
        </button>
      </div>

      {/* Test results */}
      {tab.testResults && tab.testResults.length > 0 && (
        <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-forge-border dark:bg-forge-panel">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium">
            Tests
            <span className="font-mono text-xs text-forge-muted">
              {tab.testResults.filter((r) => r.passed).length}/
              {tab.testResults.length} passed
            </span>
          </div>
          <ul className="space-y-0.5 text-sm">
            {tab.testResults.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>{r.passed ? '✅' : '❌'}</span>
                <span className={r.passed ? 'dark:text-forge-text' : 'text-err'}>
                  {r.name}
                </span>
                {r.detail && (
                  <span className="font-mono text-xs text-zinc-500 dark:text-forge-muted">
                    — {r.detail}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response tabs */}
      <SlidingTabs
        className="border-b border-zinc-200 px-2 dark:border-forge-border"
        items={TABS.map((t) => ({
          id: t,
          label: t,
          badge: t === 'Cookies' && cookies.length > 0 ? cookies.length : null,
        }))}
        active={active}
        onChange={setActive}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {active === 'Pretty' &&
          (parsed !== null ? (
            <JsonTree data={parsed} />
          ) : (
            <div className="h-full">
              <Editor value={res.body} readOnly language="text" />
            </div>
          ))}

        {active === 'Raw' && (
          <div className="h-full">
            <Editor value={res.body} readOnly language="text" />
          </div>
        )}

        {active === 'Preview' &&
          (isHtml ? (
            <iframe
              title="preview"
              sandbox=""
              srcDoc={res.body}
              className="h-full w-full border-0 bg-white"
            />
          ) : (
            <div className="p-4 text-sm text-zinc-500">
              Preview is available for HTML responses only.
            </div>
          ))}

        {active === 'Headers' && (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(res.headers).map(([k, v]) => (
                <tr
                  key={k}
                  className="border-b border-zinc-100 dark:border-forge-border/50"
                >
                  <td className="px-3 py-1.5 font-mono text-sky-500">{k}</td>
                  <td className="px-3 py-1.5 font-mono text-zinc-600 dark:text-zinc-300">
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {active === 'Cookies' &&
          (cookies.length ? (
            <table className="w-full text-sm">
              <tbody>
                {cookies.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-100 dark:border-forge-border/50"
                  >
                    <td className="px-3 py-1.5 font-mono text-sky-500">{c.name}</td>
                    <td className="px-3 py-1.5 font-mono text-zinc-600 dark:text-zinc-300">
                      {c.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-sm text-zinc-500">
              No cookies in this response. (Browsers hide Set-Cookie for
              cross-origin requests; use the proxy to see them.)
            </div>
          ))}
      </div>
    </div>
  )
}
