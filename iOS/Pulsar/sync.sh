#!/bin/bash
#
# Syncs this iOS Pulsar directory to the public mirror repository
# (github.com/software-mansion-labs/pulsar-ios) by opening a pull request.
#
# The mirror repo is cloned into ./.tmp on first run and reused (fetched)
# afterwards, so no pre-existing local checkout is required anywhere on the
# machine. Changes are pushed to a fresh branch and a PR is opened with `gh`.
#
# With --release the script additionally merges the freshly opened PR, then
# tags and publishes a GitHub release using the iOS version declared in
# ../../sdk-versions.json (.ios.version).

set -euo pipefail

REPO_URL="https://github.com/software-mansion-labs/pulsar-ios"
REPO_SLUG="software-mansion-labs/pulsar-ios"
BASE_BRANCH="main"

RELEASE=false

usage() {
  cat <<'EOF'
Usage: ./sync.sh [options]

Syncs the iOS Pulsar sources to the public mirror repo by opening a PR.

Options:
  --release   After opening the PR, merge it, then create a tag and a GitHub
              release using the iOS version from ../../sdk-versions.json.
  --help      Show this help message.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --release)
      RELEASE=true
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

# Always operate relative to this script's location, regardless of the caller's cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR"
TMP_DIR="$SCRIPT_DIR/.tmp"
CLONE_DIR="$TMP_DIR/pulsar-ios"
SDK_VERSIONS_FILE="$SCRIPT_DIR/../../sdk-versions.json"

# `gh` is required to open the pull request (and to release).
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required but not installed." >&2
  echo "Install it from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

# When releasing, resolve and validate the version up front so we fail before
# touching the remote if something is off.
if [ "$RELEASE" = true ]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is required for --release but not installed." >&2
    exit 1
  fi
  if [ ! -f "$SDK_VERSIONS_FILE" ]; then
    echo "Error: cannot find sdk-versions.json at $SDK_VERSIONS_FILE" >&2
    exit 1
  fi
  VERSION="$(jq -r '.ios.version' "$SDK_VERSIONS_FILE")"
  if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
    echo "Error: could not read .ios.version from $SDK_VERSIONS_FILE" >&2
    exit 1
  fi
  # Refuse to clobber an existing tag/release.
  if git ls-remote --tags "$REPO_URL" "refs/tags/$VERSION" | grep -q "refs/tags/$VERSION"; then
    echo "Error: tag $VERSION already exists on $REPO_SLUG." >&2
    echo "Bump .ios.version in sdk-versions.json before releasing." >&2
    exit 1
  fi
  echo "Releasing iOS Pulsar version $VERSION"
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
  if [ "$RELEASE" = true ]; then
    echo "Nothing to release: sources are already up to date." >&2
    exit 1
  fi
  exit 0
fi

git commit -m "Sync iOS Pulsar files"
git push -u origin "$BRANCH"

PR_URL="$(gh pr create \
  --repo "$REPO_SLUG" \
  --base "$BASE_BRANCH" \
  --head "$BRANCH" \
  --title "Sync iOS Pulsar files" \
  --body "Automated sync of iOS Pulsar sources from the pulsar monorepo.")"

echo "Opened a pull request: $PR_URL"

if [ "$RELEASE" != true ]; then
  exit 0
fi

# 5. Release: merge the PR, then tag and publish a GitHub release.
echo "Merging $PR_URL..."
gh pr merge "$PR_URL" --repo "$REPO_SLUG" --merge --delete-branch

# Make sure the release targets the merged commit on the base branch.
git fetch origin "$BASE_BRANCH"

echo "Creating release $VERSION on $REPO_SLUG..."
gh release create "$VERSION" \
  --repo "$REPO_SLUG" \
  --target "$BASE_BRANCH" \
  --title "$VERSION" \
  --generate-notes

echo "Released $VERSION: $(gh release view "$VERSION" --repo "$REPO_SLUG" --json url --jq .url)"
