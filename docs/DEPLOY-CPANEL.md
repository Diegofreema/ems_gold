# Deploying NETPRO EMS to cPanel

Build once, upload, done. Everything here has been exercised locally except
where it says otherwise.

```bash
./deploy/package.sh
```

That produces **`deploy/netpro-ems-cpanel.zip`** (2.2 MB, 455 files).

---

## Where the API is

`https://sis.livingtempleacademy.ng/backend/api` — Laravel is installed at
`/backend` and its own routes carry the `/api` prefix, so the two stack. On the
**same host** as the portal.

Verified live 2026-09-21: `/backend/api/users/me` answers with the envelope,
`/backend/users/me` is a 404.

Same-origin is the whole point: the API sends no `Access-Control-Allow-Origin`,
so a browser could not call it from a different domain at all. Because it is
served from `/backend` on this host, it needs no proxy and no CORS headers —
the app just calls it.

Set in four places, all of which must agree:

| Where | What |
|---|---|
| `src/api/client.ts` | `${location.origin}/backend/api` (override with `VITE_API_URL`) |
| `vite.config.ts` → `server.proxy` | dev only — proxies `/backend` to the live host |
| `vite.config.ts` → workbox | `navigateFallbackDenylist` and the `NetworkOnly` rule both match `/backend` |
| `deploy/cpanel/.htaccess` | passes `/backend` through, so the SPA fallback cannot swallow it |

The other four entries match on the `/backend` prefix, so they cover
`/backend/api` without change.

### The proxy is no longer shipped

`deploy/cpanel/api/index.php` is kept in the repo but **not** included in the
package. It is the forwarder for a *cross-origin* backend — if the API ever
moves to another domain, restore the `/api` rule in `.htaccess`, copy the file
back, and point `$UPSTREAM` at it. Same-origin needs none of it.

## Upload

1. cPanel → **File Manager** → `public_html`.
2. Upload `netpro-ems-cpanel.zip`, then right-click → **Extract**.
3. **Settings → Show Hidden Files (dotfiles)** and confirm **`.htaccess`** is
   there. File Manager hides it by default and a missing `.htaccess` is the most
   common cause of "every page except the home page gives 404".
4. Delete the zip.

You should end up with:

```
public_html/
  .htaccess
  index.html
  sw.js
  manifest.webmanifest
  assets/…            (437 files)
  api/index.php       ← the proxy
```

## Requirements on the host

| Need | Why | If missing |
|---|---|---|
| **PHP 8.2+** for the domain | Laravel's own requirement | **The API returns 500 and nothing works.** This is the current state — see below |
| `mod_rewrite` | SPA routes | Only the home page works |
| `mod_headers` | Caching and security headers | Works, but browsers may cache a stale shell |
| `mod_deflate` | Compression | Works, first load is ~6.5 MB instead of ~1.6 MB |
| HTTPS | Service workers require a secure context | **No offline support at all** |

### ⚠️ The backend is currently down

Measured 2026-09-20, every path under `/backend/` returns:

```
HTTP 500
Composer detected issues in your platform:
Your Composer dependencies require a PHP version ">= 8.2.0".
```

The host is running an older PHP than Laravel needs. **Fix it in cPanel →
MultiPHP Manager → select the domain → set PHP 8.2 or newer → Apply.** Nothing
in the front end can work around this, and until it is fixed the portal will
load and sign-in will fail.

Once it is up, confirm with:

```bash
curl -s https://sis.livingtempleacademy.ng/backend/users/me
```

It should answer with the JSON envelope — a 401 *"Authentication required"* is
the correct, healthy response to a token-free call. If it 404s, the endpoints
live under `/backend/api/` instead and `src/api/client.ts` needs the one-line
change.

---

## What was verified, and how

Tested locally by serving the built package and comparing the proxy's output
against direct calls to the school's API.

| Check | Result |
|---|---|
| App builds | ✅ 449 precache entries, 6.5 MB, no errors |
| App renders (sign-in, fonts, images, poster) | ✅ screenshot |
| Deep SPA route (`/admin/students`) returns the shell, not 404 | ✅ |
| Hashed assets serve with correct MIME | ✅ |
| `manifest.webmanifest`, `sw.js` serve | ✅ |
| Bundle calls `/backend` on its own origin | ✅ confirmed in the browser |
| No stale `/api` base anywhere in the bundle | ✅ |
| Service worker excludes `/backend` from the shell fallback | ✅ both rules present in `sw.js` |
| typecheck / lint / 1266 tests | ✅ all pass |
| **Live API reachable** | ❌ **500 — backend PHP version, see above** |
| **Service worker registration** | ⚠️ **Not verified** — see below |

### The one unverified thing

**Service workers are disabled in the browser used for testing.** Proved rather
than assumed: registering a deliberately *empty* service worker failed with the
identical error, so this is the test environment and not the build.

**After your first upload, open the site on a real browser over HTTPS and
check DevTools → Application → Service Workers shows `sw.js` activated.** Until
that is confirmed, treat offline support as unproven. Everything else in the
table above is confirmed.

---

## Two things that bite

### Caching the shell

`.htaccess` marks `index.html`, `sw.js`, `workbox-*.js` and the manifest
**no-store**, and hashed assets immutable for a year. Do not "optimise" this. If
a CDN or a cPanel caching plugin caches `index.html`, users keep the old build
after every deploy and there is no way to reach them to say so.

### `[L]` versus `[END]`

The rewrite rules use `[END]`, not `[L]`. In `.htaccess`, `[L]` *restarts* the
ruleset with the rewritten URI rather than stopping — which makes the `/api`
rule re-enter itself and the HTTPS redirect unreachable. `[END]` is Apache 2.4+,
which every cPanel host runs.

---

## Redeploying

```bash
./deploy/package.sh
```

Upload and extract over the top. Old hashed assets can be left; they are
harmless and let a tab mid-session finish loading. The service worker is
`registerType: 'prompt'`, so users are *offered* the new version rather than
being reloaded mid-task — which matters to a teacher halfway through a register.

## Subdirectory hosting

These instructions assume the app is at the **domain root**. Serving it from
`example.com/portal/` needs `base: '/portal/'` in `vite.config.ts` plus matching
changes to the PWA `scope`, `start_url` and `navigateFallback`, and the
`.htaccess` paths. Not done here — ask and it can be made to work.

## Uploads

If file uploads fail with large files, raise `upload_max_filesize` and
`post_max_size` in cPanel → *MultiPHP INI Editor*. The proxy rebuilds multipart
bodies and is bounded by whatever PHP allows.

---

## Security note

`.env` in the project root holds **real login credentials in plain text**. It is
correctly git-ignored and is not in the package or in git history — but it is
still sitting on the development machine, and those passwords should be rotated
if that machine is shared or backed up anywhere.
