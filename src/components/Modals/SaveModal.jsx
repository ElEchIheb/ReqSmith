import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Modal from './Modal'
import { Button, Input, Select } from '../ui'

// Flatten collections/folders into pickable destinations.
function flatten(collections) {
  const out = []
  const walk = (items, collectionId, prefix) => {
    for (const it of items) {
      if (it.type === 'folder') {
        out.push({
          key: `${collectionId}::${it.id}`,
          collectionId,
          parentId: it.id,
          label: `${prefix}${it.name}/`,
        })
        walk(it.items || [], collectionId, `${prefix}${it.name}/`)
      }
    }
  }
  for (const c of collections) {
    out.push({
      key: `${c.id}::root`,
      collectionId: c.id,
      parentId: null,
      label: c.name,
    })
    walk(c.items, c.id, `${c.name}/`)
  }
  return out
}

export default function SaveModal({ tab, onClose }) {
  const collections = useStore((s) => s.collections)
  const addCollection = useStore((s) => s.addCollection)
  const updateDraft = useStore((s) => s.updateDraft)
  const saveTabToCollection = useStore((s) => s.saveTabToCollection)

  const destinations = flatten(collections)
  const [name, setName] = useState(tab.draft.name || 'New Request')
  const [dest, setDest] = useState(destinations[0]?.key || '')

  const createCollection = () => {
    const cn = window.prompt('Collection name', 'New Collection')
    if (cn) addCollection(cn)
  }

  const save = () => {
    const target = destinations.find((d) => d.key === dest)
    if (!target) return
    updateDraft(tab.id, { name })
    saveTabToCollection(tab.id, target.collectionId, target.parentId)
    onClose()
  }

  return (
    <Modal title="Save Request" onClose={onClose} width="max-w-lg">
      <div className="space-y-4 p-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-500">Request name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-500">Save to</span>
          {destinations.length ? (
            <Select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full"
            >
              {destinations.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-zinc-500">
              No collections yet.{' '}
              <button
                onClick={createCollection}
                className="text-forge-accent hover:underline"
              >
                Create one
              </button>
              .
            </p>
          )}
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-forge-border">
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={!destinations.length}>
          Save
        </Button>
      </div>
    </Modal>
  )
}
