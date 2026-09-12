import { lazy, Suspense } from 'react'

// Code-split boundary: CodeMirror (and its language modes) live in EditorImpl,
// which is only fetched the first time an editor is actually rendered — e.g.
// opening the Body/raw tab, the Tests script, or viewing a raw response. Keeps
// CodeMirror out of the initial page load.
const EditorImpl = lazy(() => import('./EditorImpl'))

function Fallback({ value }) {
  return (
    <div className="h-full w-full overflow-auto bg-white p-2 font-mono text-[13px] text-zinc-500 dark:bg-forge-input dark:text-forge-muted">
      {value ? (
        <pre className="whitespace-pre-wrap break-words">{value}</pre>
      ) : (
        'Loading editor…'
      )}
    </div>
  )
}

export default function Editor(props) {
  return (
    <Suspense fallback={<Fallback value={props.value} />}>
      <EditorImpl {...props} />
    </Suspense>
  )
}
