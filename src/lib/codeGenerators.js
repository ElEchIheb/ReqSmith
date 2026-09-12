import { resolveRequest } from './httpClient'

// Generate a snippet for the current request in the target language/tool.
// Uses the same resolver as the sender so the code matches what actually runs.
export function generateCode(request, varMap, target) {
  const r = resolveRequest(request, varMap)
  // Normalize form-data body to a printable string for snippets.
  const bodyString = bodyToString(r)

  switch (target) {
    case 'curl':
      return curl(r, bodyString)
    case 'fetch':
      return fetchJs(r, bodyString)
    case 'axios':
      return axios(r, bodyString)
    case 'python':
      return python(r, bodyString)
    default:
      return ''
  }
}

export const CODE_TARGETS = [
  { id: 'curl', label: 'cURL' },
  { id: 'fetch', label: 'fetch (JS)' },
  { id: 'axios', label: 'axios' },
  { id: 'python', label: 'Python requests' },
]

function bodyToString(r) {
  if (r.body == null) return null
  if (typeof r.body === 'object' && r.body.__formData) {
    return r.body.__formData.map((f) => `${f.key}=${f.value}`).join('&')
  }
  return r.body
}

function curl(r, body) {
  const lines = [`curl -X ${r.method} '${r.url}'`]
  for (const [k, v] of Object.entries(r.headers)) {
    lines.push(`  -H '${k}: ${v}'`)
  }
  if (body != null && body !== '') {
    lines.push(`  --data '${body.replace(/'/g, "'\\''")}'`)
  }
  return lines.join(' \\\n')
}

function fetchJs(r, body) {
  const opts = { method: r.method }
  if (Object.keys(r.headers).length) opts.headers = r.headers
  if (body != null && body !== '') opts.body = body

  const optsStr = JSON.stringify(opts, null, 2).replace(
    /"body": "(.*)"/s,
    (m, b) => `"body": ${JSON.stringify(body)}`
  )

  return `fetch(${JSON.stringify(r.url)}, ${optsStr})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));`
}

function axios(r, body) {
  const cfg = {
    method: r.method.toLowerCase(),
    url: r.url,
  }
  if (Object.keys(r.headers).length) cfg.headers = r.headers
  if (body != null && body !== '') {
    try {
      cfg.data = JSON.parse(body)
    } catch {
      cfg.data = body
    }
  }
  return `import axios from 'axios';

axios(${JSON.stringify(cfg, null, 2)})
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));`
}

function python(r, body) {
  const lines = ['import requests', '']
  lines.push(`url = ${pyStr(r.url)}`)
  if (Object.keys(r.headers).length) {
    lines.push('headers = {')
    for (const [k, v] of Object.entries(r.headers)) {
      lines.push(`    ${pyStr(k)}: ${pyStr(v)},`)
    }
    lines.push('}')
  } else {
    lines.push('headers = {}')
  }

  let dataArg = ''
  if (body != null && body !== '') {
    let parsed = null
    try {
      parsed = JSON.parse(body)
    } catch {
      /* not json */
    }
    if (parsed !== null && typeof parsed === 'object') {
      lines.push(`payload = ${pyDict(parsed)}`)
      dataArg = ', json=payload'
    } else {
      lines.push(`payload = ${pyStr(body)}`)
      dataArg = ', data=payload'
    }
  }

  lines.push('')
  lines.push(
    `response = requests.request(${pyStr(r.method)}, url, headers=headers${dataArg})`
  )
  lines.push('print(response.status_code)')
  lines.push('print(response.text)')
  return lines.join('\n')
}

function pyStr(s) {
  return JSON.stringify(String(s))
}

function pyDict(obj) {
  // JSON is close enough to a Python literal for dict/list/str/num/bool;
  // fix up the three keyword literals.
  return JSON.stringify(obj, null, 4)
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bnull\b/g, 'None')
}
