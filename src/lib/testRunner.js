// Intentionally simple test runner: a handful of preset checkbox assertions
// plus one optional custom-JS sandbox. No Chai/Jest — just new Function() in a
// try/catch, per the spec's "keep it simple" guidance.

export function defaultTests() {
  return {
    presets: {
      status200: false,
      responseTimeUnder: { enabled: false, ms: 500 },
      bodyContainsKey: { enabled: false, value: '' },
      headerExists: { enabled: false, value: '' },
    },
    script: '',
  }
}

export function runTests(response, tests) {
  const results = []
  if (!response || !tests) return results
  const cfg = tests.presets || {}

  // --- Preset assertions ---
  if (cfg.status200) {
    results.push({
      name: 'Status code is 200',
      passed: response.status === 200,
      detail: `got ${response.status}`,
    })
  }

  if (cfg.responseTimeUnder?.enabled) {
    const limit = Number(cfg.responseTimeUnder.ms) || 0
    results.push({
      name: `Response time < ${limit} ms`,
      passed: response.time < limit,
      detail: `${response.time} ms`,
    })
  }

  if (cfg.bodyContainsKey?.enabled && cfg.bodyContainsKey.value) {
    const needle = cfg.bodyContainsKey.value
    let found = false
    try {
      const json = JSON.parse(response.body)
      found = keyExistsDeep(json, needle)
    } catch {
      found = (response.body || '').includes(needle)
    }
    results.push({
      name: `Body contains "${needle}"`,
      passed: found,
      detail: found ? 'found' : 'not found',
    })
  }

  if (cfg.headerExists?.enabled && cfg.headerExists.value) {
    const name = cfg.headerExists.value.toLowerCase()
    const has = Object.keys(response.headers || {}).some(
      (h) => h.toLowerCase() === name
    )
    results.push({
      name: `Header "${cfg.headerExists.value}" exists`,
      passed: has,
      detail: has ? 'present' : 'missing',
    })
  }

  // --- Custom JS sandbox ---
  if (tests.script && tests.script.trim()) {
    results.push(...runScript(response, tests.script))
  }

  return results
}

function keyExistsDeep(obj, key) {
  if (obj == null || typeof obj !== 'object') return false
  if (Object.prototype.hasOwnProperty.call(obj, key)) return true
  for (const v of Object.values(obj)) {
    if (keyExistsDeep(v, key)) return true
  }
  return false
}

function runScript(response, script) {
  const results = []
  let json = null
  try {
    json = JSON.parse(response.body)
  } catch {
    /* not JSON */
  }

  // Sandbox API given to the script.
  const rs = {
    response: {
      status: response.status,
      time: response.time,
      size: response.size,
      body: response.body,
      json,
      headers: response.headers,
    },
    // pm-style helpers
    test(name, fn) {
      try {
        fn()
        results.push({ name, passed: true })
      } catch (err) {
        results.push({ name, passed: false, detail: err.message })
      }
    },
    assert(cond, message = 'Assertion failed') {
      if (!cond) throw new Error(message)
    },
    expect(actual) {
      return {
        toBe(expected) {
          if (actual !== expected)
            throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        },
        toEqual(expected) {
          if (JSON.stringify(actual) !== JSON.stringify(expected))
            throw new Error(`expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        },
        toContain(sub) {
          if (!String(actual).includes(sub))
            throw new Error(`expected to contain ${JSON.stringify(sub)}`)
        },
        toBeTruthy() {
          if (!actual) throw new Error(`expected truthy, got ${JSON.stringify(actual)}`)
        },
      }
    },
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('rs', 'response', 'test', 'assert', 'expect', script)
    fn(rs, rs.response, rs.test, rs.assert, rs.expect)
  } catch (err) {
    results.push({ name: 'Custom script', passed: false, detail: err.message })
  }

  return results
}
