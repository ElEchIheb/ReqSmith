import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  newRequest,
  newFolder,
  newCollection,
  newEnvironment,
  newKV,
  id as newId,
} from '../lib/factories'
import { buildVarMap } from '../lib/variables'
import { resolveRequest, sendRequest } from '../lib/httpClient'
import { runTests } from '../lib/testRunner'

const MAX_HISTORY = 100

// --- tree helpers (immutably walk/update the collection item tree) ---
function mapTree(items, fn) {
  return items.map((it) => {
    const mapped = fn(it)
    if (mapped && mapped.items) {
      return { ...mapped, items: mapTree(mapped.items, fn) }
    }
    return mapped
  })
}

function findNode(items, id) {
  for (const it of items) {
    if (it.id === id) return it
    if (it.items) {
      const found = findNode(it.items, id)
      if (found) return found
    }
  }
  return null
}

function removeNode(items, id) {
  const out = []
  for (const it of items) {
    if (it.id === id) continue
    if (it.items) out.push({ ...it, items: removeNode(it.items, id) })
    else out.push(it)
  }
  return out
}

function insertInto(items, parentId, node) {
  // parentId null => top level
  if (parentId == null) return [...items, node]
  return items.map((it) => {
    if (it.id === parentId && it.items) {
      return { ...it, items: [...it.items, node] }
    }
    if (it.items) return { ...it, items: insertInto(it.items, parentId, node) }
    return it
  })
}

export const useStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      collections: [],
      environments: [],
      activeEnvId: null,
      globals: [newKV()],
      history: [],
      tabs: [],
      activeTabId: null,

      // ---------- theme ----------
      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === 'dark' ? 'light' : 'dark'
          return { theme }
        }),

      // ---------- environments / variables ----------
      addEnvironment: (name) =>
        set((s) => {
          const env = newEnvironment(name || 'New Environment')
          return {
            environments: [...s.environments, env],
            activeEnvId: s.activeEnvId || env.id,
          }
        }),
      deleteEnvironment: (id) =>
        set((s) => ({
          environments: s.environments.filter((e) => e.id !== id),
          activeEnvId: s.activeEnvId === id ? null : s.activeEnvId,
        })),
      renameEnvironment: (id, name) =>
        set((s) => ({
          environments: s.environments.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        })),
      setActiveEnv: (id) => set({ activeEnvId: id }),
      setEnvVariables: (id, variables) =>
        set((s) => ({
          environments: s.environments.map((e) =>
            e.id === id ? { ...e, variables } : e
          ),
        })),
      setGlobals: (variables) => set({ globals: variables }),

      getVarMap: () => {
        const s = get()
        const env = s.environments.find((e) => e.id === s.activeEnvId)
        return buildVarMap(s.globals, env ? env.variables : [])
      },

      // ---------- collections tree ----------
      addCollection: (name) =>
        set((s) => ({
          collections: [...s.collections, newCollection(name || 'New Collection')],
        })),
      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),
      renameCollection: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),

      addFolder: (collectionId, parentId, name) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: insertInto(c.items, parentId, newFolder(name)) }
              : c
          ),
        })),

      addRequest: (collectionId, parentId, request) => {
        const req = request || newRequest()
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: insertInto(c.items, parentId, req) }
              : c
          ),
        }))
        return req
      },

      renameNode: (collectionId, nodeId, name) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: mapTree(c.items, (it) => (it.id === nodeId ? { ...it, name } : it)) }
              : c
          ),
        })),

      deleteNode: (collectionId, nodeId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: removeNode(c.items, nodeId) }
              : c
          ),
          tabs: s.tabs.map((t) =>
            t.requestId === nodeId ? { ...t, requestId: null, dirty: true } : t
          ),
        })),

      // Move a request/folder node to a new parent (drag & drop within a collection)
      moveNode: (collectionId, nodeId, newParentId) =>
        set((s) => ({
          collections: s.collections.map((c) => {
            if (c.id !== collectionId) return c
            const node = findNode(c.items, nodeId)
            if (!node) return c
            // Prevent dropping a folder into itself/descendant
            if (node.items && findNode(node.items, newParentId)) return c
            const without = removeNode(c.items, nodeId)
            return { ...c, items: insertInto(without, newParentId, node) }
          }),
        })),

      importCollection: (collection) =>
        set((s) => ({ collections: [...s.collections, collection] })),

      // ---------- tabs ----------
      openRequest: (node, collectionId) => {
        const existing = get().tabs.find((t) => t.requestId === node.id)
        if (existing) {
          set({ activeTabId: existing.id })
          return existing.id
        }
        const tab = {
          id: newId(),
          requestId: node.id,
          collectionId,
          draft: JSON.parse(JSON.stringify(node)),
          dirty: false,
          response: null,
          testResults: [],
          sending: false,
          error: null,
        }
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
        return tab.id
      },

      openNewTab: () => {
        const tab = {
          id: newId(),
          requestId: null,
          collectionId: null,
          draft: newRequest(),
          dirty: false,
          response: null,
          testResults: [],
          sending: false,
          error: null,
        }
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
        return tab.id
      },

      closeTab: (tabId) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === tabId)
          const tabs = s.tabs.filter((t) => t.id !== tabId)
          let activeTabId = s.activeTabId
          if (s.activeTabId === tabId) {
            const next = tabs[idx] || tabs[idx - 1] || tabs[tabs.length - 1]
            activeTabId = next ? next.id : null
          }
          return { tabs, activeTabId }
        }),

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      updateDraft: (tabId, updater) =>
        set((s) => ({
          tabs: s.tabs.map((t) => {
            if (t.id !== tabId) return t
            const draft =
              typeof updater === 'function'
                ? updater(t.draft)
                : { ...t.draft, ...updater }
            return { ...t, draft, dirty: true }
          }),
        })),

      // Save the active tab's draft back into its collection (or return needsSave)
      saveTab: (tabId) => {
        const s = get()
        const tab = s.tabs.find((t) => t.id === tabId)
        if (!tab) return { ok: false }
        if (!tab.collectionId || !tab.requestId) {
          // Not attached to a collection yet — caller must pick a destination.
          return { ok: false, needsDestination: true }
        }
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === tab.collectionId
              ? {
                  ...c,
                  items: mapTree(c.items, (it) =>
                    it.id === tab.requestId ? { ...tab.draft, id: tab.requestId } : it
                  ),
                }
              : c
          ),
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, dirty: false } : t
          ),
        }))
        return { ok: true }
      },

      // Save a brand-new tab into a chosen collection.
      saveTabToCollection: (tabId, collectionId, parentId) => {
        const s = get()
        const tab = s.tabs.find((t) => t.id === tabId)
        if (!tab) return
        const req = { ...tab.draft, id: newId(), type: 'request' }
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: insertInto(c.items, parentId ?? null, req) }
              : c
          ),
          tabs: state.tabs.map((t) =>
            t.id === tabId
              ? { ...t, requestId: req.id, collectionId, dirty: false }
              : t
          ),
        }))
      },

      // ---------- sending ----------
      sendActiveRequest: async ({ useProxy = false } = {}) => {
        const s = get()
        const tab = s.tabs.find((t) => t.id === s.activeTabId)
        if (!tab) return
        await get()._send(tab.id, { useProxy })
      },

      _send: async (tabId, { useProxy = false } = {}) => {
        const state = get()
        const tab = state.tabs.find((t) => t.id === tabId)
        if (!tab) return

        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === tabId ? { ...t, sending: true, error: null } : t
          ),
        }))

        // Base variable map + any temp vars set by the pre-request script.
        let varMap = get().getVarMap()
        const draft = tab.draft

        if (draft.preRequestScript && draft.preRequestScript.trim()) {
          try {
            const temp = {}
            // eslint-disable-next-line no-new-func
            const fn = new Function(
              'rs',
              'setVar',
              'env',
              draft.preRequestScript
            )
            const rs = {
              setVar: (k, v) => (temp[k] = String(v)),
              env: { ...varMap },
            }
            fn(rs, rs.setVar, rs.env)
            varMap = { ...varMap, ...temp }
          } catch (err) {
            set((s) => ({
              tabs: s.tabs.map((t) =>
                t.id === tabId
                  ? { ...t, sending: false, error: `Pre-request script error: ${err.message}` }
                  : t
              ),
            }))
            return
          }
        }

        try {
          const resolved = resolveRequest(draft, varMap)
          const response = await sendRequest(resolved, { useProxy })
          const testResults = runTests(response, draft.tests)

          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === tabId
                ? { ...t, sending: false, response, testResults, error: null }
                : t
            ),
          }))

          // Record history
          get()._pushHistory({
            name: draft.name,
            method: resolved.method,
            url: resolved.url,
            status: response.status,
            time: response.time,
            snapshot: JSON.parse(JSON.stringify(draft)),
          })
        } catch (err) {
          set((s) => ({
            tabs: s.tabs.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    sending: false,
                    error: err.message,
                    corsLike: !!err.isCorsLike,
                    response: null,
                  }
                : t
            ),
          }))
        }
      },

      _pushHistory: (entry) =>
        set((s) => ({
          history: [
            { id: newId(), at: Date.now(), ...entry },
            ...s.history,
          ].slice(0, MAX_HISTORY),
        })),

      clearHistory: () => set({ history: [] }),

      openFromHistory: (entry) => {
        const node = { ...entry.snapshot, id: newId(), type: 'request' }
        get().openNewTabWithDraft(node)
      },

      openNewTabWithDraft: (draft) => {
        const tab = {
          id: newId(),
          requestId: null,
          collectionId: null,
          draft,
          dirty: true,
          response: null,
          testResults: [],
          sending: false,
          error: null,
        }
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
        return tab.id
      },
    }),
    {
      name: 'reqsmith-store',
      version: 1,
      // Persist everything except transient per-tab response state.
      partialize: (s) => ({
        theme: s.theme,
        collections: s.collections,
        environments: s.environments,
        activeEnvId: s.activeEnvId,
        globals: s.globals,
        history: s.history,
        tabs: s.tabs.map((t) => ({
          id: t.id,
          requestId: t.requestId,
          collectionId: t.collectionId,
          draft: t.draft,
          dirty: t.dirty,
          response: null,
          testResults: [],
          sending: false,
          error: null,
        })),
        activeTabId: s.activeTabId,
      }),
    }
  )
)
