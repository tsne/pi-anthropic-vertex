#!/usr/bin/env bash
set -euo pipefail

# Releases a new patch version for general code changes (not sync-related).
# Usage: ./sync/publish.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

cd "$REPO_DIR"

NEW_VERSION=$(npm version patch --no-git-tag-version | tr -d 'v')
echo "Bumped to $NEW_VERSION"

# Add compat entry: piMin from previous entry, piMax from PI_VERSION.
# jq can't read and write the same file, so we write to a temp file first.
PI_VERSION=$(cat sync/PI_VERSION)
jq --arg v "$NEW_VERSION" --arg piMax "$PI_VERSION" \
  '[{"extension": $v, "piMin": .[0].piMin, "piMax": $piMax}] + .' \
  "$SCRIPT_DIR/compat.json" > "$SCRIPT_DIR/compat.tmp" && mv "$SCRIPT_DIR/compat.tmp" "$SCRIPT_DIR/compat.json"
node "$SCRIPT_DIR/update-readme.js"

git add -A
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin master "v$NEW_VERSION"

echo "Released v$NEW_VERSION. Pipeline will publish to npm and create GitHub Release."
