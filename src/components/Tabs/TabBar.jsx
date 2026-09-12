import { useStore } from '../../store/useStore'
import { MethodBadge } from '../ui'

export default function TabBar() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const closeTab = useStore((s) => s.closeTab)
  const openNewTab = useStore((s) => s.openNewTab)

  return (
    <div className="flex items-stretch overflow-x-auto border-b border-zinc-200 bg-zinc-50 dark:border-forge-border dark:bg-forge-panel">
      {tabs.map((t) => {
        const active = t.id === activeTabId
        return (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`group relative flex max-w-[220px] shrink-0 cursor-pointer items-center gap-2 border-r border-zinc-200 px-3 py-2 text-sm dark:border-forge-border ${
              active
                ? 'bg-white dark:bg-forge-bg'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-forge-muted dark:hover:bg-forge-hover'
            }`}
          >
            {active && (
              <span className="grad-underline absolute inset-x-0 bottom-0 h-0.5" />
            )}
            <MethodBadge method={t.draft.method} className="min-w-[38px]" />
            <span className="truncate">
              {t.draft.name || 'Untitled'}
              {t.dirty && <span className="ml-0.5 text-forge-accent">•</span>}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(t.id)
              }}
              className="ml-auto rounded-[3px] px-1 text-zinc-400 opacity-0 hover:bg-zinc-200 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-forge-hover dark:hover:text-forge-text"
            >
              ×
            </button>
          </div>
        )
      })}
      <button
        onClick={() => openNewTab()}
        title="New tab"
        className="shrink-0 px-3 text-lg text-zinc-400 hover:bg-zinc-100 hover:text-forge-accent dark:hover:bg-forge-hover"
      >
        +
      </button>
    </div>
  )
}
