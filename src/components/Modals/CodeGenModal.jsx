import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import Modal from './Modal'
import { Select } from '../ui'
import { generateCode, CODE_TARGETS } from '../../lib/codeGenerators'
import Editor from '../Editor'

export default function CodeGenModal({ tab, onClose }) {
  const [target, setTarget] = useState('curl')
  const [copied, setCopied] = useState(false)
  const getVarMap = useStore((s) => s.getVarMap)

  const code = useMemo(
    () => generateCode(tab.draft, getVarMap(), target),
    [tab.draft, target, getVarMap]
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <Modal title="Generate Code" onClose={onClose} width="max-w-3xl">
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Select value={target} onChange={(e) => setTarget(e.target.value)}>
            {CODE_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
          <button
            onClick={copy}
            className="ml-auto rounded-md bg-forge-accent px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-forge-accent2"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="h-80 overflow-hidden rounded-md border border-zinc-200 dark:border-forge-border">
          <Editor value={code} readOnly language="text" />
        </div>
      </div>
    </Modal>
  )
}
