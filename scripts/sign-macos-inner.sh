#!/usr/bin/env bash
# Sign every Mach-O inside the sidecar resource tree.
#
# Tauri signs the app bundle and its externalBin, but NOT bundle.resources.
# Notarization rejects any unsigned Mach-O in the bundle, so sharp's .node
# addon and libvips-cpp.dylib have to be signed by hand.
#
# Run BEFORE `tauri build`: the files are signed in place in
# src-tauri/resources/sidecar, then copied into the .app already signed.
set -euo pipefail

if [[ -z "${APPLE_SIGNING_IDENTITY:-}" ]]; then
  echo "APPLE_SIGNING_IDENTITY not set - skipping inner signing (unsigned build)"
  exit 0
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TREE="$ROOT/src-tauri/resources/sidecar"

if [[ ! -d "$TREE" ]]; then
  echo "No sidecar tree at $TREE - run scripts/build-sidecar.mjs first" >&2
  exit 1
fi

count=0
while IFS= read -r -d '' file; do
  codesign --force --timestamp --options runtime \
    --entitlements "$ROOT/src-tauri/entitlements.plist" \
    --sign "$APPLE_SIGNING_IDENTITY" "$file"
  count=$((count + 1))
done < <(find "$TREE" \( -name '*.node' -o -name '*.dylib' -o -name '*.so' \) -print0)

echo "signed $count inner binaries"

# Fail loudly rather than discovering it at notarization time.
while IFS= read -r -d '' file; do
  codesign --verify --strict "$file" || { echo "unsigned: $file" >&2; exit 1; }
done < <(find "$TREE" \( -name '*.node' -o -name '*.dylib' \) -print0)
echo "verified"
