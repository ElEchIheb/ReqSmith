import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Modal from './Modal'
import KeyValueTable from '../RequestBuilder/KeyValueTable'
import { Button } from '../ui'

// Manage environments and global variables in one place.
export default function EnvironmentModal({ onClose }) {
  const environments = useStore((s) => s.environments)
  const globals = useStore((s) => s.globals)
  const addEnvironment = useStore((s) => s.addEnvironment)
  const deleteEnvironment = useStore((s) => s.deleteEnvironment)
  const renameEnvironment = useStore((s) => s.renameEnvironment)
  const setEnvVariables = useStore((s) => s.setEnvVariables)
  const setGlobals = useStore((s) => s.setGlobals)

  const [selected, setSelected] = useState(
    environments[0]?.id || 'globals'
  )

  const isGlobals = selected === 'globals'
  const env = environments.find((e) => e.id === selected)

  return (
    <Modal title="Environments & Variables" onClose={onClose} width="max-w-3xl">
      <div className="flex min-h-[360px]">
        {/* List */}
        <div className="w-52 shrink-0 border-r border-zinc-200 p-2 dark:border-forge-border">
          <button
            onClick={() => setSelected('globals')}
            className={`mb-1 w-full rounded px-2 py-1.5 text-left text-sm ${
              isGlobals ? 'bg-zinc-200 font-medium dark:bg-forge-hover' : ''
            }`}
          >
            🌐 Globals
          </button>
          <div className="my-1 border-t border-zinc-200 dark:border-forge-border" />
          {environments.map((e) => (
            <div key={e.id} className="group flex items-center">
              <button
                onClick={() => setSelected(e.id)}
                className={`flex-1 truncate rounded px-2 py-1.5 text-left text-sm ${
                  selected === e.id
                    ? 'bg-zinc-200 font-medium dark:bg-forge-hover'
                    : ''
                }`}
              >
                {e.name}
              </button>
              <button
                title="Delete"
                onClick={() => {
                  deleteEnvironment(e.id)
                  if (selected === e.id) setSelected('globals')
                }}
                className="hidden px-1 text-zinc-400 hover:text-red-500 group-hover:block"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => addEnvironment('New Environment')}
            className="mt-2 w-full rounded-md border border-dashed border-zinc-300 py-1 text-xs text-zinc-500 hover:border-forge-accent hover:text-forge-accent dark:border-forge-border"
          >
            + Add environment
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          {isGlobals ? (
            <>
              <h3 className="mb-2 text-sm font-medium">Global Variables</h3>
              <KeyValueTable
                rows={globals}
                onChange={setGlobals}
                keyPlaceholder="variable"
              />
            </>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={env?.name || ''}
                  onChange={(e) => renameEnvironment(env.id, e.target.value)}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium outline-none focus:border-forge-accent dark:border-forge-border dark:bg-forge-input dark:text-zinc-100"
                />
              </div>
              <KeyValueTable
                rows={env?.variables || []}
                onChange={(vars) => setEnvVariables(env.id, vars)}
                keyPlaceholder="variable"
              />
            </>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            Use variables anywhere with{' '}
            <code className="text-forge-accent">{'{{name}}'}</code>. Environment
            values override globals.
          </p>
        </div>
      </div>
      <div className="flex justify-end border-t border-zinc-200 px-4 py-3 dark:border-forge-border">
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  )
}
