#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH="$ROOT/.tools/gh_2.93.0_macOS_arm64/bin/gh"
REPO="menguex/dossier-cable-color"

cd "$ROOT"

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "git@github.com:${REPO}.git"
fi

if git ls-remote "git@github.com:${REPO}.git" HEAD >/dev/null 2>&1; then
  echo "Repo exists. Pushing..."
  git push -u origin main
  echo "Done: https://github.com/${REPO}"
  exit 0
fi

if [ ! -x "$GH" ]; then
  echo "Missing GitHub CLI. Run from project root once:"
  echo "mkdir -p .tools && curl -L https://github.com/cli/cli/releases/download/v2.93.0/gh_2.93.0_macOS_arm64.zip -o .tools/gh.zip && unzip -qo .tools/gh.zip -d .tools"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Authorize GitHub CLI first:"
  "$GH" auth login --hostname github.com --git-protocol ssh --web
fi

echo "Creating repo ${REPO}..."
"$GH" repo create "$REPO" --public --source=. --remote=origin --push
echo "Done: https://github.com/${REPO}"
