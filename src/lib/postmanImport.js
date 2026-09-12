import { newRequest, newFolder, newCollection, newKV, id } from './factories'

// --- Import: Postman Collection v2.1 JSON -> ReqSmith collection ---
export function importPostmanCollection(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json
  const info = data.info || {}
  const collection = newCollection(info.name || 'Imported Collection')
  collection.items = (data.item || []).map(convertItem).filter(Boolean)
  return collection
}

function convertItem(item) {
  // A folder has a nested `item` array; a request has a `request` object.
  if (Array.isArray(item.item)) {
    const folder = newFolder(item.name || 'Folder')
    folder.items = item.item.map(convertItem).filter(Boolean)
    return folder
  }
  if (item.request) {
    return convertRequest(item)
  }
  return null
}

function convertRequest(item) {
  const pm = item.request
  const req = newRequest({ name: item.name || 'Request' })
  req.method = (pm.method || 'GET').toUpperCase()

  // URL can be a string or an object.
  if (typeof pm.url === 'string') {
    req.url = pm.url
  } else if (pm.url) {
    req.url = pm.url.raw || rawFromUrlObj(pm.url)
    req.params = (pm.url.query || []).map((q) =>
      newKV(q.key || '', q.value || '', q.disabled !== true)
    )
    if (!req.params.length) req.params = [newKV()]
  }

  // Headers
  req.headers = (pm.header || []).map((h) =>
    newKV(h.key || '', h.value || '', h.disabled !== true)
  )
  if (!req.headers.length) req.headers = [newKV()]

  // Body
  if (pm.body) req.body = { ...req.body, ...convertBody(pm.body) }

  // Auth
  if (pm.auth) req.auth = { ...req.auth, ...convertAuth(pm.auth) }

  return req
}

function rawFromUrlObj(url) {
  const host = Array.isArray(url.host) ? url.host.join('.') : url.host || ''
  const path = Array.isArray(url.path) ? url.path.join('/') : url.path || ''
  const proto = url.protocol ? `${url.protocol}://` : ''
  return `${proto}${host}${path ? '/' + path : ''}`
}

function convertBody(body) {
  const out = {}
  switch (body.mode) {
    case 'raw': {
      out.mode = 'raw'
      out.raw = body.raw || ''
      const lang = body.options?.raw?.language
      out.rawType = ['json', 'xml', 'html', 'text'].includes(lang) ? lang : 'json'
      break
    }
    case 'urlencoded':
      out.mode = 'x-www-form-urlencoded'
      out.urlencoded = (body.urlencoded || []).map((f) =>
        newKV(f.key || '', f.value || '', f.disabled !== true)
      )
      break
    case 'formdata':
      out.mode = 'form-data'
      out.formData = (body.formdata || []).map((f) =>
        newKV(f.key || '', f.value || '', f.disabled !== true)
      )
      break
    default:
      out.mode = 'none'
  }
  return out
}

function convertAuth(auth) {
  const type = auth.type
  if (type === 'bearer') {
    return { type: 'bearer', bearer: { token: pluck(auth.bearer, 'token') } }
  }
  if (type === 'basic') {
    return {
      type: 'basic',
      basic: {
        username: pluck(auth.basic, 'username'),
        password: pluck(auth.basic, 'password'),
      },
    }
  }
  if (type === 'apikey') {
    return {
      type: 'apikey',
      apikey: {
        key: pluck(auth.apikey, 'key'),
        value: pluck(auth.apikey, 'value'),
        addTo: pluck(auth.apikey, 'in') === 'query' ? 'query' : 'header',
      },
    }
  }
  return { type: 'none' }
}

// Postman auth params are arrays of { key, value } — pull one value out.
function pluck(arr, key) {
  if (!Array.isArray(arr)) return ''
  const found = arr.find((x) => x.key === key)
  return found ? found.value : ''
}

// --- Export: ReqSmith collection -> Postman Collection v2.1 JSON ---
export function exportPostmanCollection(collection) {
  return {
    info: {
      _postman_id: id(),
      name: collection.name,
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: (collection.items || []).map(exportItem),
  }
}

function exportItem(item) {
  if (item.type === 'folder') {
    return { name: item.name, item: (item.items || []).map(exportItem) }
  }
  return exportRequest(item)
}

function exportRequest(req) {
  const urlNoQuery = (req.url || '').split('?')[0]
  const out = {
    name: req.name,
    request: {
      method: req.method,
      header: (req.headers || [])
        .filter((h) => h.key)
        .map((h) => ({ key: h.key, value: h.value, disabled: h.enabled === false })),
      url: {
        raw: req.url,
        query: (req.params || [])
          .filter((p) => p.key)
          .map((p) => ({ key: p.key, value: p.value, disabled: p.enabled === false })),
      },
    },
  }

  // Body
  const b = req.body || {}
  if (b.mode === 'raw') {
    out.request.body = {
      mode: 'raw',
      raw: b.raw || '',
      options: { raw: { language: b.rawType || 'json' } },
    }
  } else if (b.mode === 'x-www-form-urlencoded') {
    out.request.body = {
      mode: 'urlencoded',
      urlencoded: (b.urlencoded || [])
        .filter((f) => f.key)
        .map((f) => ({ key: f.key, value: f.value, disabled: f.enabled === false })),
    }
  } else if (b.mode === 'form-data') {
    out.request.body = {
      mode: 'formdata',
      formdata: (b.formData || [])
        .filter((f) => f.key)
        .map((f) => ({ key: f.key, value: f.value, type: 'text', disabled: f.enabled === false })),
    }
  }

  // Auth
  const a = req.auth || {}
  if (a.type === 'bearer') {
    out.request.auth = {
      type: 'bearer',
      bearer: [{ key: 'token', value: a.bearer?.token || '', type: 'string' }],
    }
  } else if (a.type === 'basic') {
    out.request.auth = {
      type: 'basic',
      basic: [
        { key: 'username', value: a.basic?.username || '', type: 'string' },
        { key: 'password', value: a.basic?.password || '', type: 'string' },
      ],
    }
  } else if (a.type === 'apikey') {
    out.request.auth = {
      type: 'apikey',
      apikey: [
        { key: 'key', value: a.apikey?.key || '', type: 'string' },
        { key: 'value', value: a.apikey?.value || '', type: 'string' },
        { key: 'in', value: a.apikey?.addTo || 'header', type: 'string' },
      ],
    }
  }

  return out
}
