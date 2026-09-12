import { useEffect, useState, useCallback } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar/Sidebar'
import TabBar from './components/Tabs/TabBar'
import RequestBuilder from './components/RequestBuilder/RequestBuilder'
import ResponseViewer from './components/ResponseViewer/ResponseViewer'
import CommandPalette from './components/Modals/CommandPalette'
import CodeGenModal from './components/Modals/CodeGenModal'
import EnvironmentModal from './components/Modals/EnvironmentModal'
import SaveModal from './components/Modals/SaveModal'
import { Select, IconButton } from './components/ui'

export default function App() {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const openNewTab = useStore((s) => s.openNewTab)
  const saveTab = useStore((s) => s.saveTab)

  const environments = useStore((s) => s.environments)
  const activeEnvId = useStore((s) => s.activeEnvId)
  const setActiveEnv = useStore((s) => s.setActiveEnv)

  const [palette, setPalette] = useState(false)
  const [codeGenTab, setCodeGenTab] = useState(null)
  const [envModal, setEnvModal] = useState(false)
  const [saveTabTarget, setSaveTabTarget] = useState(null)

  const activeTab = tabs.find((t) => t.id === activeTabId) || null

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Ensure there's always at least one tab (read live state to avoid a
  // StrictMode double-invoke creating two blank tabs).
  useEffect(() => {
    if (useStore.getState().tabs.length === 0) openNewTab()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = useCallback(
    (tab) => {
      const res = saveTab(tab.id)
      if (res.needsDestination) setSaveTabTarget(tab)
    },
    [saveTab]
  )

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (activeTab) handleSave(activeTab)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeTab, handleSave])

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-zinc-800 dark:bg-forge-bg dark:text-forge-text">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-forge-border dark:bg-forge-panel">
        <div className="flex items-center gap-2.5">
          {/* Logo — the strongest anchor, with a subtle ember glow behind it */}
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-forge-glow/30 blur-md dark:animate-emberGlow" />
            <span className="relative text-xl">🔨</span>
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-bold tracking-tight">
              Req<span className="text-forge-accent">Smith</span>
            </div>
            <div className="hidden text-[10px] text-zinc-500 dark:text-forge-muted sm:block">
              Craft every request, forge every test.
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setPalette(true)}
            className="hidden items-center gap-2 rounded-[5px] border border-zinc-300 px-2.5 py-1 text-xs text-zinc-500 hover:border-forge-accent hover:text-forge-accent md:flex dark:border-forge-border dark:text-forge-muted"
          >
            Search{' '}
            <kbd className="rounded-[3px] bg-zinc-200 px-1 font-mono dark:bg-forge-hover">
              ⌘K
            </kbd>
          </button>

          <Select
            value={activeEnvId || ''}
            onChange={(e) => setActiveEnv(e.target.value || null)}
            className="py-1"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </Select>

          <IconButton title="Environments & Variables" onClick={() => setEnvModal(true)}>
            ⚙
          </IconButton>
          <IconButton
            title="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </IconButton>
        </div>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={22} minSize={14} maxSize={40}>
            <Sidebar />
          </Panel>
          <PanelResizeHandle className="w-px bg-zinc-200 transition-colors hover:bg-forge-accent dark:bg-forge-border" />
          <Panel defaultSize={78}>
            <div className="flex h-full flex-col">
              <TabBar />
              {activeTab ? (
                <PanelGroup direction="vertical" className="min-h-0 flex-1">
                  <Panel defaultSize={50} minSize={20}>
                    <RequestBuilder
                      tab={activeTab}
                      onSave={handleSave}
                      onOpenCodeGen={setCodeGenTab}
                    />
                  </Panel>
                  <PanelResizeHandle className="h-px bg-zinc-200 transition-colors hover:bg-forge-accent dark:bg-forge-border" />
                  <Panel defaultSize={50} minSize={15}>
                    <ResponseViewer tab={activeTab} />
                  </Panel>
                </PanelGroup>
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-forge-muted">
                  Open a request or create a new tab.
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Modals */}
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
      {codeGenTab && (
        <CodeGenModal tab={codeGenTab} onClose={() => setCodeGenTab(null)} />
      )}
      {envModal && <EnvironmentModal onClose={() => setEnvModal(false)} />}
      {saveTabTarget && (
        <SaveModal tab={saveTabTarget} onClose={() => setSaveTabTarget(null)} />
      )}
    </div>
  )
}
