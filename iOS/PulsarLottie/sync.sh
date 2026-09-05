#!/bin/bash
#
# Syncs this iOS PulsarLottie directory to the public mirror repository
# (github.com/software-mansion-labs/pulsar-lottie-ios) by opening a pull
# request.
#
# The mirror repo is cloned into ./.tmp on first run and reused (fetched)
# afterwards, so no pre-existing local checkout is required anywhere on the
# machine. Changes are pushed to a fresh branch and a PR is opened with `gh`.
# While the mirror is still empty, the first sync bootstraps the base branch
# directly instead (there is nothing to open a PR against yet).
#
# In the monorepo PulsarLottie depends on the core package by relative path;
# the mirror is standalone, so the dependency is rewritten to the public
# pulsar-ios package pinned to the iOS version in ../../sdk-versions.json.
#
# With --release the script additionally merges the freshly opened PR, then
# tags and publishes a GitHub release using the iOS Lottie version declared in
# ../../sdk-versions.json (.iosLottie.version).

set -euo pipefail

REPO_URL="https://github.com/software-mansion-labs/pulsar-lottie-ios"
REPO_SLUG="software-mansion-labs/pulsar-lottie-ios"
BASE_BRANCH="main"

CORE_REPO_URL="https://github.com/software-mansion-labs/pulsar-ios.git"

RELEASE=false

usage() {
  cat <<'EOF'
Usage: ./sync.sh [options]

Syncs the iOS PulsarLottie sources to the public mirror repo by opening a PR.

Options:
  --release   After opening the PR, merge it, then create a tag and a GitHub
              release using the iOS Lottie version from ../../sdk-versions.json.
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
CLONE_DIR="$TMP_DIR/pulsar-lottie-ios"
SDK_VERSIONS_FILE="$SCRIPT_DIR/../../sdk-versions.json"
PODSPEC_FILE="$SCRIPT_DIR/PulsarLottie.podspec"

# `gh` is required to open the pull request (and to release).
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) is required but not installed." >&2
  echo "Install it from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

# Unlike the core package, every sync rewrites the core dependency pin, so the
# version file is always needed.
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed." >&2
  exit 1
fi
if [ ! -f "$SDK_VERSIONS_FILE" ]; then
  echo "Error: cannot find sdk-versions.json at $SDK_VERSIONS_FILE" >&2
  exit 1
fi

CORE_VERSION="$(jq -r '.ios.version' "$SDK_VERSIONS_FILE")"
if [ -z "$CORE_VERSION" ] || [ "$CORE_VERSION" = "null" ]; then
  echo "Error: could not read .ios.version from $SDK_VERSIONS_FILE" >&2
  exit 1
fi

# When releasing, resolve and validate the version up front so we fail before
# touching the remote if something is off.
if [ "$RELEASE" = true ]; then
  VERSION="$(jq -r '.iosLottie.version' "$SDK_VERSIONS_FILE")"
  if [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; then
    echo "Error: could not read .iosLottie.version from $SDK_VERSIONS_FILE" >&2
    exit 1
  fi
  # The tag doubles as the published pod version, so the two must agree.
  PODSPEC_VERSION="$(sed -n "s/.*s\.version[[:space:]]*=[[:space:]]*'\([^']*\)'.*/\1/p" "$PODSPEC_FILE" | head -n 1)"
  if [ "$PODSPEC_VERSION" != "$VERSION" ]; then
    echo "Error: PulsarLottie.podspec version ($PODSPEC_VERSION) does not match .iosLottie.version ($VERSION)." >&2
    echo "Run tools/scripts/sync-sdk-versions.mjs before releasing." >&2
    exit 1
  fi
  # Refuse to clobber an existing tag/release.
  if git ls-remote --tags "$REPO_URL" "refs/tags/$VERSION" | grep -q "refs/tags/$VERSION"; then
    echo "Error: tag $VERSION already exists on $REPO_SLUG." >&2
    echo "Bump .iosLottie.version in sdk-versions.json before releasing." >&2
    exit 1
  fi
  echo "Releasing iOS PulsarLottie version $VERSION"
fi

# 1. Ensure the mirror repo is available locally inside ./.tmp
BASE_EXISTS=false
if git ls-remote --heads "$REPO_URL" "$BASE_BRANCH" | grep -q "refs/heads/$BASE_BRANCH"; then
  BASE_EXISTS=true
fi

if [ "$BASE_EXISTS" = true ] && [ -d "$CLONE_DIR/.git" ]; then
  echo "Reusing existing clone in .tmp, fetching latest..."
  git -C "$CLONE_DIR" fetch origin
  git -C "$CLONE_DIR" checkout -B "$BASE_BRANCH" "origin/$BASE_BRANCH"
  git -C "$CLONE_DIR" reset --hard "origin/$BASE_BRANCH"
else
  echo "Cloning $REPO_URL into .tmp..."
  rm -rf "$CLONE_DIR"
  mkdir -p "$TMP_DIR"
  git clone "$REPO_URL" "$CLONE_DIR"
fi

if [ "$BASE_EXISTS" = false ]; then
  # The mirror has no commits yet — start the base branch from an unborn HEAD.
  echo "$REPO_SLUG is empty; bootstrapping $BASE_BRANCH."
  git -C "$CLONE_DIR" symbolic-ref HEAD "refs/heads/$BASE_BRANCH"
fi

# 2. Create a fresh sync branch off the base branch (nothing to branch from
#    while bootstrapping).
BRANCH=""
if [ "$BASE_EXISTS" = true ]; then
  BRANCH="sync/ios-lottie-$(date +%Y%m%d-%H%M%S)"
  git -C "$CLONE_DIR" checkout -b "$BRANCH"
fi

# 3. Mirror the iOS PulsarLottie sources into the clone (excluding local-only artifacts).
echo "Copying iOS PulsarLottie files into the mirror repo..."
rsync -a --delete \
  --exclude='.git/' \
  --exclude='.tmp/' \
  --exclude='.build/' \
  --exclude='.swiftpm/' \
  --exclude='DerivedData/' \
  --exclude='Package.resolved' \
  --exclude='.DS_Store' \
  --exclude='sync.sh' \
  "$SRC_DIR/" "$CLONE_DIR/"

# 4. The monorepo resolves the core package by relative path, which does not
#    exist in the standalone mirror — point it at the published package instead.
#    A URL dependency is identified by the repo name rather than by the name in
#    its manifest, so product references have to follow.
MIRROR_MANIFEST="$CLONE_DIR/Package.swift"
CORE_PACKAGE_ID="$(basename "$CORE_REPO_URL" .git)"

for pattern in '\.package(path: "\.\./Pulsar")' '\.product(name: "Pulsar", package: "Pulsar")'; do
  if ! grep -q "$pattern" "$MIRROR_MANIFEST"; then
    echo "Error: Package.swift does not contain the expected core dependency declaration:" >&2
    echo "  $pattern" >&2
    echo "The mirror would ship an unresolvable manifest; update sync.sh to match." >&2
    exit 1
  fi
done

sed -i '' \
  -e "s|\.package(path: \"\.\./Pulsar\")|.package(url: \"$CORE_REPO_URL\", from: \"$CORE_VERSION\")|" \
  -e "s|\.product(name: \"Pulsar\", package: \"Pulsar\")|.product(name: \"Pulsar\", package: \"$CORE_PACKAGE_ID\")|" \
  "$MIRROR_MANIFEST"
echo "Pinned the core Pulsar dependency to $CORE_VERSION."

# 5. Commit, push the branch, and open a PR if anything changed.
cd "$CLONE_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to sync."
  if [ -n "$BRANCH" ]; then
    # Leave the base branch checked out and drop the empty sync branch.
    git checkout "$BASE_BRANCH"
    git branch -D "$BRANCH"
  fi
  if [ "$RELEASE" = true ]; then
    echo "Nothing to release: sources are already up to date." >&2
    exit 1
  fi
  exit 0
fi

if [ "$BASE_EXISTS" = false ]; then
  git commit -m "Initial sync of iOS PulsarLottie files"
  git push -u origin "$BASE_BRANCH"
  echo "Bootstrapped $BASE_BRANCH on $REPO_SLUG."
  PR_URL=""
else
  git commit -m "Sync iOS PulsarLottie files"
  git push -u origin "$BRANCH"

  PR_URL="$(gh pr create \
    --repo "$REPO_SLUG" \
    --base "$BASE_BRANCH" \
    --head "$BRANCH" \
    --title "Sync iOS PulsarLottie files" \
    --body "Automated sync of iOS PulsarLottie sources from the pulsar monorepo.")"

  echo "Opened a pull request: $PR_URL"
fi

if [ "$RELEASE" != true ]; then
  exit 0
fi

# 6. Release: merge the PR, then tag and publish a GitHub release.
if [ -n "$PR_URL" ]; then
  echo "Merging $PR_URL..."
  gh pr merge "$PR_URL" --repo "$REPO_SLUG" --merge --delete-branch
fi

# Make sure the release targets the merged commit on the base branch.
git fetch origin "$BASE_BRANCH"

echo "Creating release $VERSION on $REPO_SLUG..."
gh release create "$VERSION" \
  --repo "$REPO_SLUG" \
  --target "$BASE_BRANCH" \
  --title "$VERSION" \
  --generate-notes

echo "Released $VERSION: $(gh release view "$VERSION" --repo "$REPO_SLUG" --json url --jq .url)"
