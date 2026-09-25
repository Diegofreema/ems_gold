# Deploying NETPRO EMS to cPanel

Build once, upload, done. Everything here has been exercised locally except
where it says otherwise.

```bash
./deploy/package.sh
```

That produces **`deploy/netpro-ems-cpanel.zip`** (2.2 MB, 455 files).

---

## Where the API is

`https://bronze.uaes.education/api`, on its own host. Checked 2026-09-25: it
sends `Access-Control-Allow-Origin` only to `localhost` origins, so a portal
served from any real domain cannot call it from the browser at all.

So the portal calls **`/api` on its own host**, and `api/index.php` (shipped in
the package) forwards each call to bronze, with the token, the body and any
uploaded files. Checked the same day by running the forwarder against bronze:
the envelope, the school's `Date` header, query strings and multipart bodies
all come through, and a bad token gets bronze's own 401.

Set in five places, all of which must agree:

| Where | What |
|---|---|
| `src/api/client.ts` | `${location.origin}/api` (override with `VITE_API_URL`) |
| `deploy/cpanel/api/index.php` → `$UPSTREAM` | `https://bronze.uaes.education/api` (or the `NETPRO_API_UPSTREAM` environment variable) |
| `deploy/cpanel/.htaccess` | sends `/api` to `api/index.php`, before the SPA fallback can swallow it |
| `vite.config.ts` → workbox | `navigateFallbackDenylist` and the `NetworkOnly` rule both match `/api` |
| `vite.config.ts` → `server.proxy` | dev only — proxies `/api` to bronze, the same job the forwarder does |

To point the portal at a different school, change `$UPSTREAM` (and the dev
proxy's `target`) and nothing else.

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
  api/index.php       ← the forwarder to bronze
```

## Requirements on the host

| Need | Why | If missing |
|---|---|---|
| **PHP 8.0+** with cURL for the domain | `api/index.php` forwards every call to the school | **Every call fails and nobody can sign in** — see below |
| `mod_rewrite` | SPA routes | Only the home page works |
| `mod_headers` | Caching and security headers | Works, but browsers may cache a stale shell |
| `mod_deflate` | Compression | Works, first load is ~6.5 MB instead of ~1.6 MB |
| HTTPS | Service workers require a secure context | **No offline support at all** |

The forwarder also needs the **PHP cURL extension**. Without it every call
answers "Ask your host to enable the PHP cURL extension".

Once it is up, confirm the forwarder reaches the school:

```bash
curl -s https://YOUR-PORTAL-DOMAIN/api/users/me
```

It should answer with the JSON envelope — a 401 *"Authentication required"* is
the correct, healthy response to a token-free call. The portal's own HTML
means the `/api` rule in `.htaccess` is missing; a 500 is PHP.

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
| Bundle calls `/api` on its own origin | ✅ checked in the built bundle, 2026-09-25 |
| No stale `/backend/api` base anywhere in the bundle | ✅ checked by `package.sh` |
| Service worker excludes `/api` from the shell fallback | ✅ both rules present in `sw.js` |
| typecheck / lint / 1266 tests | ✅ all pass |
| Forwarder reaches bronze (PHP 8.5 locally) | ✅ 2026-09-25 |
| **Forwarder under Apache on the real host** | ⚠️ **Not verified** — check with the `curl` above after upload |
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
