import { nanoid } from 'nanoid'
import { defaultTests } from './testRunner'

export const id = () => nanoid(10)

export function newKV(key = '', value = '', enabled = true) {
  return { id: id(), key, value, enabled }
}

export function newRequest(overrides = {}) {
  return {
    id: id(),
    type: 'request',
    name: 'New Request',
    method: 'GET',
    url: '',
    params: [newKV()],
    headers: [newKV()],
    body: {
      mode: 'none',
      raw: '',
      rawType: 'json',
      formData: [newKV()],
      urlencoded: [newKV()],
      binaryName: '',
    },
    auth: {
      type: 'none',
      bearer: { token: '' },
      basic: { username: '', password: '' },
      apikey: { key: '', value: '', addTo: 'header' },
      oauth2: { token: '' },
    },
    preRequestScript: '',
    tests: defaultTests(),
    ...overrides,
  }
}

export function newFolder(name = 'New Folder') {
  return { id: id(), type: 'folder', name, items: [] }
}

export function newCollection(name = 'New Collection') {
  return { id: id(), name, items: [] }
}

export function newEnvironment(name = 'New Environment') {
  return { id: id(), name, variables: [newKV()] }
}
