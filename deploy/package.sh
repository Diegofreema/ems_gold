#!/usr/bin/env bash
# Builds NETPRO EMS and assembles the cPanel deployment package.
#
#   ./deploy/package.sh
#
# Produces deploy/build/ (upload its CONTENTS) and deploy/netpro-ems-cpanel.zip
# (upload and extract this instead, which is easier in cPanel File Manager).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/deploy/build"
ZIP="$ROOT/deploy/netpro-ems-cpanel.zip"

cd "$ROOT"
echo "==> Building"
pnpm build

echo "==> Assembling $OUT"
rm -rf "$OUT" && mkdir -p "$OUT"
cp -R dist/. "$OUT"/
cp deploy/cpanel/.htaccess "$OUT/.htaccess"
# The forwarder: the app calls /api on its own host and this passes it on to
# the school at https://bronze.uaes.education/api — see docs/DEPLOY-CPANEL.md.
mkdir -p "$OUT/api"
cp deploy/cpanel/api/index.php "$OUT/api/index.php"

echo "==> Checking"
for f in index.html .htaccess sw.js manifest.webmanifest api/index.php; do
  [ -f "$OUT/$f" ] || { echo "MISSING: $f"; exit 1; }
done
# The built bundle must call the forwarder at /api, not the old /backend/api.
if grep -qr "/backend/api" "$OUT/assets"; then echo "build still references /backend/api"; exit 1; fi

echo "==> Zipping"
rm -f "$ZIP"
( cd "$OUT" && zip -rq "$ZIP" . -x '.DS_Store' )

echo
echo "Done."
echo "  folder: $OUT"
echo "  zip:    $ZIP  ($(du -h "$ZIP" | cut -f1))"
echo
echo "Upload the zip to public_html and Extract, or upload the folder's CONTENTS."
echo "Remember: .htaccess is a hidden file — turn on hidden files in File Manager."
