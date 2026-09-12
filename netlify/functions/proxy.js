// ReqSmith CORS proxy — a single lightweight Netlify Function.
// The browser POSTs a JSON envelope describing the real request; this function
// forwards it server-side (no CORS in server-to-server calls) and returns the
// response as a JSON envelope so the client can reconstruct status/headers/body.
//
// Envelope in:  { url, method, headers, body }  (body is a string or null)
// Envelope out: { status, statusText, headers, body }
export const handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: 'Use POST with a request envelope.' }),
    }
  }

  let envelope
  try {
    envelope = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'Invalid JSON envelope.' }),
    }
  }

  const { url, method = 'GET', headers = {}, body = null } = envelope
  if (!url) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'Missing target url.' }),
    }
  }

  // Strip hop-by-hop / host headers the fetch layer must set itself.
  const forwardHeaders = { ...headers }
  ;['host', 'content-length', 'connection', 'accept-encoding'].forEach((h) => {
    delete forwardHeaders[h]
    delete forwardHeaders[h.toLowerCase()]
  })

  try {
    const started = Date.now()
    const res = await fetch(url, {
      method,
      headers: forwardHeaders,
      body: ['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : body,
    })
    const text = await res.text()
    const outHeaders = {}
    res.headers.forEach((v, k) => {
      outHeaders[k] = v
    })

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: res.status,
        statusText: res.statusText,
        headers: outHeaders,
        body: text,
        proxyTime: Date.now() - started,
      }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Proxy fetch failed: ${err.message}` }),
    }
  }
}
