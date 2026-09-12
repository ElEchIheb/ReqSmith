import { useState } from 'react'

// Lightweight collapsible JSON tree for the "Pretty" tab.
export default function JsonTree({ data }) {
  return (
    <div className="p-3 font-mono text-[13px] leading-relaxed">
      <Node value={data} name={null} depth={0} defaultOpen />
    </div>
  )
}

function Node({ name, value, depth, defaultOpen = false }) {
  const [open, setOpen] = useState(depth < 2 || defaultOpen)
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object'

  if (!isObject) {
    return (
      <div className="whitespace-pre-wrap break-words">
        {name !== null && <Key name={name} />}
        <Leaf value={value} />
      </div>
    )
  }

  const entries = isArray
    ? value.map((v, i) => [i, v])
    : Object.entries(value)
  const bracket = isArray ? ['[', ']'] : ['{', '}']

  return (
    <div>
      <div
        className="cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-forge-hover/40"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="inline-block w-4 text-zinc-400">{open ? '▾' : '▸'}</span>
        {name !== null && <Key name={name} />}
        <span className="text-zinc-400">
          {bracket[0]}
          {!open && (
            <span className="text-zinc-500">
              {' '}
              {entries.length} {entries.length === 1 ? 'item' : 'items'} {bracket[1]}
            </span>
          )}
        </span>
      </div>
      {open && (
        <div className="border-l border-zinc-200 pl-4 dark:border-forge-border">
          {entries.map(([k, v]) => (
            <Node key={k} name={k} value={v} depth={depth + 1} />
          ))}
          <div className="text-zinc-400">{bracket[1]}</div>
        </div>
      )}
    </div>
  )
}

function Key({ name }) {
  return <span className="text-sky-500">"{name}"</span>
}

function Leaf({ value }) {
  let cls = 'text-zinc-700 dark:text-zinc-200'
  let text = String(value)
  if (typeof value === 'string') {
    cls = 'text-emerald-500'
    text = `"${value}"`
  } else if (typeof value === 'number') cls = 'text-amber-500'
  else if (typeof value === 'boolean') cls = 'text-purple-400'
  else if (value === null) {
    cls = 'text-zinc-400'
    text = 'null'
  }
  return (
    <>
      <span className="text-zinc-400">: </span>
      <span className={cls}>{text}</span>
    </>
  )
}
