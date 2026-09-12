// Variable substitution for {{variable}} syntax.
// Environment variables take precedence over global variables.

export function buildVarMap(globals = [], envVars = []) {
  const map = {}
  for (const v of globals) {
    if (v.enabled !== false && v.key) map[v.key] = v.value ?? ''
  }
  // Environment overrides globals
  for (const v of envVars) {
    if (v.enabled !== false && v.key) map[v.key] = v.value ?? ''
  }
  return map
}

// Replace {{var}} occurrences in a string. Unknown vars are left as-is.
export function substitute(str, varMap = {}) {
  if (typeof str !== 'string') return str
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(varMap, name)
      ? varMap[name]
      : match
  })
}

// Find all {{var}} names used in a string (for highlighting / validation).
export function findVars(str) {
  if (typeof str !== 'string') return []
  const out = []
  const re = /\{\{\s*([\w.-]+)\s*\}\}/g
  let m
  while ((m = re.exec(str))) out.push(m[1])
  return out
}
