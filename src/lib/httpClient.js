import { substitute } from './variables'

// Turn a stored request + variable map into a concrete, ready-to-send request.
// Shared by the HTTP client AND the code generators so what you send matches
// what "Generate Code" prints.
export function resolveRequest(request, varMap = {}) {
  const sub = (s) => substitute(s, varMap)

  const method = (request.method || 'GET').toUpperCase()

  // --- URL + query params ---
  let baseUrl = sub(request.url || '').trim()
  const query = []
  for (const p of request.params || []) {
    if (p.enabled !== false && p.key) {
      query.push([sub(p.key), sub(p.value ?? '')])
    }
  }

  // --- Headers ---
  const headers = {}
  for (const h of request.headers || []) {
    if (h.enabled !== false && h.key) headers[sub(h.key)] = sub(h.value ?? '')
  }

  // --- Auth ---
  const auth = request.auth || { type: 'none' }
  if (auth.type === 'bearer' && auth.bearer?.token) {
    headers['Authorization'] = `Bearer ${sub(auth.bearer.token)}`
  } else if (auth.type === 'basic') {
    const u = sub(auth.basic?.username || '')
    const p = sub(auth.basic?.password || '')
    headers['Authorization'] = `Basic ${btoa(`${u}:${p}`)}`
  } else if (auth.type === 'apikey' && auth.apikey?.key) {
    const key = sub(auth.apikey.key)
    const val = sub(auth.apikey.value || '')
    if (auth.apikey.addTo === 'query') query.push([key, val])
    else headers[key] = val
  } else if (auth.type === 'oauth2' && auth.oauth2?.token) {
    headers['Authorization'] = `Bearer ${sub(auth.oauth2.token)}`
  }

  // --- Body ---
  let body = null
  const bodyCfg = request.body || { mode: 'none' }
  if (!['GET', 'HEAD'].includes(method)) {
    if (bodyCfg.mode === 'raw') {
      body = sub(bodyCfg.raw || '')
      if (!hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = rawContentType(bodyCfg.rawType)
      }
    } else if (bodyCfg.mode === 'x-www-form-urlencoded') {
      const usp = new URLSearchParams()
      for (const f of bodyCfg.urlencoded || []) {
        if (f.enabled !== false && f.key) usp.append(sub(f.key), sub(f.value ?? ''))
      }
      body = usp.toString()
      if (!hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
    } else if (bodyCfg.mode === 'form-data') {
      // Represented as an object marker; the sender builds a real FormData.
      body = {
        __formData: (bodyCfg.formData || [])
          .filter((f) => f.enabled !== false && f.key)
          .map((f) => ({ key: sub(f.key), value: sub(f.value ?? '') })),
      }
      // Let the browser set the multipart boundary — don't force Content-Type.
    } else if (bodyCfg.mode === 'binary') {
      body = null // binary file bodies aren't persisted; handled at send time
    }
  }

  // Build final URL string with query params merged onto any existing ones.
  const url = appendQuery(baseUrl, query)

  return { method, url, headers, body, bodyMode: bodyCfg.mode }
}

function hasHeader(headers, name) {
  return Object.keys(headers).some((k) => k.toLowerCase() === name.toLowerCase())
}

function rawContentType(rawType) {
  switch (rawType) {
    case 'json':
      return 'application/json'
    case 'xml':
      return 'application/xml'
    case 'html':
      return 'text/html'
    default:
      return 'text/plain'
  }
}

function appendQuery(url, pairs) {
  if (!pairs.length) return url
  const qs = pairs
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

// Send a resolved request. Returns a normalized response object.
// Throws an error tagged { isCorsLike: true } on a likely CORS/network failure.
export async function sendRequest(resolved, { useProxy = false, signal } = {}) {
  if (useProxy) return sendViaProxy(resolved, signal)

  const init = {
    method: resolved.method,
    headers: { ...resolved.headers },
    signal,
  }

  if (resolved.body != null && !['GET', 'HEAD'].includes(resolved.method)) {
    if (typeof resolved.body === 'object' && resolved.body.__formData) {
      const fd = new FormData()
      for (const { key, value } of resolved.body.__formData) fd.append(key, value)
      init.body = fd
    } else {
      init.body = resolved.body
    }
  }

  const started = performance.now()
  let res
  try {
    res = await fetch(resolved.url, init)
  } catch (err) {
    const e = new Error(
      'This request failed — likely a CORS policy or network error. The API may block direct browser requests.'
    )
    e.isCorsLike = true
    e.original = err
    throw e
  }
  const elapsed = performance.now() - started

  const text = await res.text()
  const headers = {}
  res.headers.forEach((v, k) => (headers[k] = v))

  return normalize({
    status: res.status,
    statusText: res.statusText,
    headers,
    body: text,
    time: Math.round(elapsed),
  })
}

async function sendViaProxy(resolved, signal) {
  // form-data / binary bodies can't be serialized to the proxy envelope simply;
  // send raw string bodies only.
  let body = resolved.body
  if (body && typeof body === 'object') body = null

  const started = performance.now()
  let res
  try {
    res = await fetch('/.netlify/functions/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        url: resolved.url,
        method: resolved.method,
        headers: resolved.headers,
        body,
      }),
    })
  } catch (err) {
    const e = new Error(
      'Proxy unreachable. Run `netlify dev` locally, or deploy to Netlify to use the proxy.'
    )
    e.isCorsLike = true
    throw e
  }
  const elapsed = performance.now() - started

  const envelope = await res.json()
  if (envelope.error) {
    const e = new Error(envelope.error)
    e.isCorsLike = true
    throw e
  }

  return normalize({
    status: envelope.status,
    statusText: envelope.statusText,
    headers: envelope.headers || {},
    body: envelope.body ?? '',
    time: Math.round(elapsed),
    viaProxy: true,
  })
}

function normalize(res) {
  const size = new Blob([res.body || '']).size
  let contentType = ''
  for (const [k, v] of Object.entries(res.headers)) {
    if (k.toLowerCase() === 'content-type') contentType = v
  }
  return { ...res, size, contentType }
}
