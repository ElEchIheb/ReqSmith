import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { newRequest } from '../../lib/factories'
import { MethodBadge } from '../ui'

export default function TreeNode({ node, collectionId, depth = 0 }) {
  const [open, setOpen] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const openRequest = useStore((s) => s.openRequest)
  const addRequest = useStore((s) => s.addRequest)
  const addFolder = useStore((s) => s.addFolder)
  const renameNode = useStore((s) => s.renameNode)
  const deleteNode = useStore((s) => s.deleteNode)
  const moveNode = useStore((s) => s.moveNode)

  const isFolder = node.type === 'folder'
  const pad = { paddingLeft: `${depth * 12 + 8}px` }

  const onDragStart = (e) => {
    e.stopPropagation()
    e.dataTransfer.setData('text/reqsmith', node.id)
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const draggedId = e.dataTransfer.getData('text/reqsmith')
    if (draggedId && draggedId !== node.id) {
      // Drop into this node if it's a folder, else beside it (its parent handled elsewhere).
      moveNode(collectionId, draggedId, isFolder ? node.id : null)
    }
  }

  if (!isFolder) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => openRequest(node, collectionId)}
        style={pad}
        className="group flex cursor-pointer items-center gap-2 rounded-[4px] py-1 pr-2 text-sm text-zinc-700 hover:bg-zinc-200 dark:text-forge-text dark:hover:bg-forge-hover"
      >
        <MethodBadge method={node.method} className="min-w-[38px]" />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto hidden gap-1 group-hover:flex">
          <NodeAction
            title="Rename"
            onClick={(e) => {
              e.stopPropagation()
              const name = window.prompt('Rename request', node.name)
              if (name) renameNode(collectionId, node.id, name)
            }}
          >
            ✎
          </NodeAction>
          <NodeAction
            title="Delete"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Delete "${node.name}"?`))
                deleteNode(collectionId, node.id)
            }}
          >
            ×
          </NodeAction>
        </span>
      </div>
    )
  }

  return (
    <div>
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => setOpen((o) => !o)}
        style={pad}
        className={`group flex cursor-pointer items-center gap-1.5 rounded-[4px] py-1 pr-2 text-sm text-zinc-700 hover:bg-zinc-200 dark:text-forge-text dark:hover:bg-forge-hover ${
          dragOver ? 'ring-1 ring-forge-accent' : ''
        }`}
      >
        <span className="w-3 text-zinc-400 dark:text-forge-muted">{open ? '▾' : '▸'}</span>
        <span>📁</span>
        <span className="truncate font-medium">{node.name}</span>
        <span className="ml-auto hidden gap-1 group-hover:flex">
          <NodeAction
            title="New request"
            onClick={(e) => {
              e.stopPropagation()
              const req = newRequest()
              addRequest(collectionId, node.id, req)
              openRequest(req, collectionId)
            }}
          >
            +
          </NodeAction>
          <NodeAction
            title="New folder"
            onClick={(e) => {
              e.stopPropagation()
              const name = window.prompt('Folder name', 'New Folder')
              if (name) addFolder(collectionId, node.id, name)
            }}
          >
            📁
          </NodeAction>
          <NodeAction
            title="Rename"
            onClick={(e) => {
              e.stopPropagation()
              const name = window.prompt('Rename folder', node.name)
              if (name) renameNode(collectionId, node.id, name)
            }}
          >
            ✎
          </NodeAction>
          <NodeAction
            title="Delete"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Delete folder "${node.name}" and its contents?`))
                deleteNode(collectionId, node.id)
            }}
          >
            ×
          </NodeAction>
        </span>
      </div>
      {open && (
        <div>
          {(node.items || []).map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              collectionId={collectionId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function NodeAction({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-5 w-5 items-center justify-center rounded text-xs text-zinc-500 hover:bg-zinc-300 hover:text-zinc-800 dark:hover:bg-[#2d333b] dark:hover:text-zinc-100"
    >
      {children}
    </button>
  )
}
