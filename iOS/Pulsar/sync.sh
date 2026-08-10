#!/bin/bash
#
# Syncs this iOS Pulsar directory to the public mirror repository
# (github.com/software-mansion-labs/pulsar-ios) by opening a pull request.
#
# The mirror repo is cloned into ./.tmp on first run and reused (fetched)
# afterwards, so no pre-existing local checkout is required anywhere on the
# machine. Changes are pushed to a fresh branch and a PR is opened with `gh`.

set -euo pipefail

REPO_URL="https://github.com/software-mansion-labs/pulsar-ios"
REPO_SLUG="software-mansion-labs/pulsar-ios"
BASE_BRANCH="main"

# Always operate relative to this script's location, regardless of the caller's cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR"
TMP_DIR="$SCRIPT_DIR/.tmp"
CLONE_DIR="$TMP_DIR/pulsar-ios"

# `gh` is required to open the pull request.
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required but not installed." >&2
  echo "Install it from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

# 1. Ensure the mirror repo is available locally inside ./.tmp
if [ -d "$CLONE_DIR/.git" ]; then
  echo "Reusing existing clone in .tmp, fetching latest..."
  git -C "$CLONE_DIR" fetch origin
  git -C "$CLONE_DIR" checkout "$BASE_BRANCH"
  git -C "$CLONE_DIR" reset --hard "origin/$BASE_BRANCH"
else
  echo "Cloning $REPO_URL into .tmp..."
  rm -rf "$CLONE_DIR"
  mkdir -p "$TMP_DIR"
  git clone "$REPO_URL" "$CLONE_DIR"
fi

# 2. Create a fresh sync branch off the base branch.
BRANCH="sync/ios-$(date +%Y%m%d-%H%M%S)"
git -C "$CLONE_DIR" checkout -b "$BRANCH"

# 3. Mirror the iOS sources into the clone (excluding local-only artifacts).
echo "Copying iOS Pulsar files into the mirror repo..."
rsync -a --delete \
  --exclude='.git/' \
  --exclude='.tmp/' \
  --exclude='.build/' \
  --exclude='.swiftpm/' \
  --exclude='DerivedData/' \
  --exclude='.DS_Store' \
  --exclude='sync.sh' \
  "$SRC_DIR/" "$CLONE_DIR/"

# 4. Commit, push the branch, and open a PR if anything changed.
cd "$CLONE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to sync."
  # Leave the base branch checked out and drop the empty sync branch.
  git checkout "$BASE_BRANCH"
  git branch -D "$BRANCH"
  exit 0
fi

git commit -m "Sync iOS Pulsar files"
git push -u origin "$BRANCH"

gh pr create \
  --repo "$REPO_SLUG" \
  --base "$BASE_BRANCH" \
  --head "$BRANCH" \
  --title "Sync iOS Pulsar files" \
  --body "Automated sync of iOS Pulsar sources from the pulsar monorepo."

echo "Opened a pull request on $REPO_SLUG from branch $BRANCH"
