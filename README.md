# 🔨 ReqSmith

**Craft every request, forge every test.**

A Postman-like API testing client that runs entirely in the browser. Build and
send REST requests, organize them into collections, manage environment
variables, run lightweight tests, and generate client code — no account, no
server, everything persisted locally.

Built with **React 18 + Vite**, **TailwindCSS** (dark-first), **Zustand**, and
**CodeMirror 6**. Deploys as a static site on **Netlify**, with a single
optional serverless function to work around CORS.

---

## Features

- **Request Builder** — GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS, `{{variable}}`
  substitution in the URL and everywhere else, editable key/value tables for
  Params and Headers (with common-header autocomplete).
- **Body modes** — `none`, `raw` (JSON/Text/XML/HTML with syntax highlighting +
  Beautify), `form-data`, `x-www-form-urlencoded`, `binary`.
- **Auth** — No Auth, Bearer Token, Basic Auth, API Key (header or query), and a
  paste-the-token OAuth 2.0 field.
- **Pre-request script** — a small JS sandbox; set dynamic vars with
  `setVar(key, value)`.
- **Response Viewer** — color-coded status, time & size, and Pretty (collapsible
  JSON tree) / Raw / Preview (HTML) / Headers / Cookies tabs, plus copy.
- **Testing** — preset checkbox assertions (status 200, response time, body
  contains, header exists) plus one optional custom-JS assertion sandbox with
  `test()` / `assert()` / `expect()`. Results show as a ✅/❌ list.
- **Collections & Environments** — sidebar tree with folders and drag & drop,
  multiple environments + global variables, searchable request history.
- **Import / Export** — Postman Collection **v2.1** JSON, both directions.
- **Generate Code** — cURL, `fetch`, `axios`, Python `requests`.
- **UX** — browser-style tabs, `Cmd/Ctrl+Enter` to send, `Cmd/Ctrl+S` to save,
  `Cmd/Ctrl+K` command palette, dark/light theme toggle.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## CORS & the proxy

Requests are sent directly from the browser via `fetch`. When an API blocks
direct browser requests (CORS), the response panel offers **Retry via Proxy**,
which routes the request through `netlify/functions/proxy.js` (server-to-server,
no CORS). To use the proxy locally:

```bash
npm i -g netlify-cli
netlify dev
```

## Deploy to Netlify

The repo includes `netlify.toml`. Point Netlify at the repo (or run
`netlify deploy`) — build command `npm run build`, publish directory `dist`, and
the function is picked up automatically from `netlify/functions`.

## Notes

- All data (collections, environments, history, open tabs) is persisted to
  `localStorage` under the key `reqsmith-store`.
- Binary request bodies are selected at send time and are not persisted between
  sessions.
- Browsers hide `Set-Cookie` and some headers for cross-origin responses; use
  the proxy to see them.
