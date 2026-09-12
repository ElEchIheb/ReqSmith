// Small shared UI primitives so styling stays consistent across the app.

export function Button({ variant = 'default', className = '', ...props }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    default:
      'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-forge-hover dark:text-forge-text dark:hover:bg-[#2a2a33]',
    primary:
      'bg-forge-accent text-white hover:bg-forge-accent2 font-semibold shadow-[0_0_0_1px_rgba(232,89,12,0.4)]',
    ghost:
      'bg-transparent text-zinc-600 hover:bg-zinc-200 dark:text-forge-muted dark:hover:bg-forge-hover dark:hover:text-forge-text',
    danger: 'bg-transparent text-err hover:bg-err/10',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  )
}

export function IconButton({ className = '', title, ...props }) {
  return (
    <button
      title={title}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-[5px] text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:text-forge-muted dark:hover:bg-forge-hover dark:hover:text-forge-text transition-colors ${className}`}
      {...props}
    />
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-[5px] border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-forge-accent dark:border-forge-border dark:bg-forge-input dark:text-forge-text dark:placeholder:text-zinc-600 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`rounded-[5px] border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800 outline-none focus:border-forge-accent dark:border-forge-border dark:bg-forge-input dark:text-forge-text ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

// --- Method identity ---
// Each HTTP method gets a distinct hue; badge has slightly squared corners so it
// reads as precise/technical rather than soft SaaS.
const METHOD_HUE = {
  GET: 'text-method-get',
  POST: 'text-method-post',
  PUT: 'text-method-put',
  PATCH: 'text-method-patch',
  DELETE: 'text-method-delete',
  HEAD: 'text-method-other',
  OPTIONS: 'text-method-other',
}

const METHOD_BADGE = {
  GET: 'bg-method-get/12 text-method-get',
  POST: 'bg-method-post/12 text-method-post',
  PUT: 'bg-method-put/12 text-method-put',
  PATCH: 'bg-method-patch/12 text-method-patch',
  DELETE: 'bg-method-delete/12 text-method-delete',
  HEAD: 'bg-method-other/12 text-method-other',
  OPTIONS: 'bg-method-other/12 text-method-other',
}

export function methodColor(method) {
  return METHOD_HUE[(method || '').toUpperCase()] || 'text-method-other'
}

// Squared badge for tree/tabs/history.
export function MethodBadge({ method, className = '' }) {
  const m = (method || 'GET').toUpperCase()
  const cls = METHOD_BADGE[m] || METHOD_BADGE.OPTIONS
  return (
    <span
      className={`inline-flex min-w-[42px] justify-center rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide ${cls} ${className}`}
    >
      {m}
    </span>
  )
}

export function statusColor(status) {
  if (status >= 200 && status < 300) return 'text-ok'
  if (status >= 300 && status < 400) return 'text-warn'
  if (status >= 400) return 'text-err'
  return 'text-forge-muted'
}
