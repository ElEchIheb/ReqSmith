import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { useStore } from '../store/useStore'

// The actual CodeMirror-backed editor. Loaded lazily (see Editor.jsx) so the
// ~400KB CodeMirror bundle is only fetched when an editor is first shown.
export default function EditorImpl({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  placeholder = '',
  height = '100%',
}) {
  const theme = useStore((s) => s.theme)
  const extensions = language === 'json' ? [json()] : []

  return (
    <CodeMirror
      value={value ?? ''}
      height={height}
      theme={theme === 'dark' ? 'dark' : 'light'}
      extensions={extensions}
      editable={!readOnly}
      readOnly={readOnly}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: !readOnly,
        foldGutter: true,
        autocompletion: false,
      }}
      onChange={(val) => onChange && onChange(val)}
    />
  )
}
