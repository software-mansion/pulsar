#!/usr/bin/env bash
# sync-native.sh
# Compare and sync native haptics implementation between:
#   - Android/Pulsar   ↔   react-native/react-native-pulsar/android
#   - iOS/Pulsar       ↔   react-native/react-native-pulsar/deps/Pulsar
#
# Usage:
#   ./scripts/sync-native.sh                # interactive mode
#   ./scripts/sync-native.sh --compare      # compare only, no sync
#   ./scripts/sync-native.sh --help

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ANDROID_PLATFORM="$REPO_ROOT/Android/Pulsar/src/main/java/com/swmansion/pulsar"
ANDROID_RN="$REPO_ROOT/react-native/react-native-pulsar/android/src/main/java/com/swmansion/pulsar"

IOS_PLATFORM="$REPO_ROOT/iOS/Pulsar/Sources/Pulsar"
IOS_RN="$REPO_ROOT/react-native/react-native-pulsar/deps/Pulsar/Sources/Pulsar"

# rsync --exclude flags for Android RN bridge files (never synced)
ANDROID_EXCLUDES="--exclude=PulsarModule.kt --exclude=PulsarPackage.kt --exclude=PulsarReactNative.kt"

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

print_header() {
  echo ""
  echo -e "${BOLD}${BLUE}══════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${BOLD}${BLUE}══════════════════════════════════════════════════════${NC}"
  echo ""
}

print_section() {
  echo ""
  echo -e "${BOLD}${CYAN}▶ $1${NC}"
}

print_ok()      { echo -e "${GREEN}✔  $1${NC}"; }
print_warn()    { echo -e "${YELLOW}⚠  $1${NC}"; }
print_err()     { echo -e "${RED}✖  $1${NC}"; }
print_info()    { echo -e "${DIM}   $1${NC}"; }

confirm() {
  local prompt="${1:-Are you sure?}"
  echo ""
  echo -e "${YELLOW}${BOLD}${prompt} [y/N]${NC} "
  read -r -p "" answer
  [[ "$answer" =~ ^[Yy]$ ]]
}


# ---------------------------------------------------------------------------
# Compare: show rsync dry-run diff between two directories
#
# compare_dirs <label_src> <src> <label_dst> <dst> [extra rsync args...]
# ---------------------------------------------------------------------------

compare_dirs() {
  local label_src="$1" src="$2" label_dst="$3" dst="$4"
  shift 4

  echo -e "  ${BOLD}Source (truth candidate):${NC} ${GREEN}${label_src}${NC}"
  echo -e "  ${BOLD}Target:${NC}                   ${CYAN}${label_dst}${NC}"
  echo ""

  local output
  output=$(rsync -rn --delete --itemize-changes --exclude=.DS_Store "$@" "$src/" "$dst/" 2>/dev/null || true)

  if [[ -z "$output" ]]; then
    print_ok "No differences found — implementations are in sync."
    return 0
  fi

  # rsync --itemize-changes format: 9 flag chars + 1 space + filename
  local adds=0 deletes=0 modifies=0

  while IFS= read -r line; do
    local flags="${line:0:9}"
    local filename="${line:10}"

    if [[ "$flags" == "*deleting" ]]; then
      echo -e "  ${RED}- deleted:${NC}   $filename"
      (( deletes++ )) || true
    elif [[ "$flags" =~ ^\>f\+{7,} ]]; then
      echo -e "  ${GREEN}+ new file:${NC}  $filename"
      (( adds++ )) || true
    elif [[ "${flags:0:2}" == ">f" || "${flags:0:2}" == "cf" ]]; then
      echo -e "  ${YELLOW}~ modified:${NC} $filename"
      (( modifies++ )) || true
    fi
  done <<< "$output"

  echo ""
  echo -e "  ${BOLD}Summary:${NC} ${GREEN}+${adds}${NC} new, ${YELLOW}~${modifies}${NC} modified, ${RED}-${deletes}${NC} deleted"
  return 1  # indicates differences exist
}

# ---------------------------------------------------------------------------
# Sync: run rsync for real
# ---------------------------------------------------------------------------

sync_dirs() {
  local label_src="$1" src="$2" label_dst="$3" dst="$4"
  shift 4

  echo -e "  Syncing ${GREEN}${label_src}${NC}  →  ${CYAN}${label_dst}${NC} ..."
  rsync -rt --delete --itemize-changes --exclude=.DS_Store "$@" "$src/" "$dst/" \
    | while IFS= read -r line; do
        local flags="${line:0:9}"
        local filename="${line:10}"
        local ftype="${flags:0:1}"
        if [[ "$flags" == "*deleting" ]]; then
          echo -e "  ${RED}deleted:${NC} $filename"
        elif [[ "$ftype" == ">" || "$ftype" == "c" ]]; then
          echo -e "  ${YELLOW}synced:${NC}  $filename"
        fi
      done
  print_ok "Done."
}

# ---------------------------------------------------------------------------
# Android compare / sync
# ---------------------------------------------------------------------------

compare_android() {
  local direction="${1:-both}"  # "platform_to_rn", "rn_to_platform", "both"

  print_section "Android — comparing shared implementation"
  print_info "Excluded RN bridge files: PulsarModule.kt PulsarPackage.kt PulsarReactNative.kt"
  print_info "Platform: $ANDROID_PLATFORM"
  print_info "RN module: $ANDROID_RN"
  echo ""

  local has_diff=false

  if [[ "$direction" == "platform_to_rn" || "$direction" == "both" ]]; then
    echo -e "${BOLD}  Platform → RN (files that differ in RN vs Platform):${NC}"
    # word-split $ANDROID_EXCLUDES intentionally into separate rsync flags
    # shellcheck disable=SC2086
    compare_dirs "Android/Pulsar" "$ANDROID_PLATFORM" "react-native (android)" "$ANDROID_RN" $ANDROID_EXCLUDES || has_diff=true
  fi

  if [[ "$direction" == "rn_to_platform" || "$direction" == "both" ]]; then
    echo ""
    echo -e "${BOLD}  RN → Platform (files in RN not reflected in Platform):${NC}"
    # shellcheck disable=SC2086
    compare_dirs "react-native (android)" "$ANDROID_RN" "Android/Pulsar" "$ANDROID_PLATFORM" $ANDROID_EXCLUDES || has_diff=true
  fi

  $has_diff && return 1 || return 0
}

sync_android() {
  local direction="$1"  # "platform_to_rn" or "rn_to_platform"

  print_section "Android — syncing"

  if [[ "$direction" == "platform_to_rn" ]]; then
    # shellcheck disable=SC2086
    sync_dirs "Android/Pulsar" "$ANDROID_PLATFORM" "react-native (android)" "$ANDROID_RN" $ANDROID_EXCLUDES
  else
    # shellcheck disable=SC2086
    sync_dirs "react-native (android)" "$ANDROID_RN" "Android/Pulsar" "$ANDROID_PLATFORM" $ANDROID_EXCLUDES
  fi
}

# ---------------------------------------------------------------------------
# iOS compare / sync
# ---------------------------------------------------------------------------

compare_ios() {
  local direction="${1:-both}"

  print_section "iOS — comparing shared implementation"
  print_info "Platform: $IOS_PLATFORM"
  print_info "RN deps:  $IOS_RN"
  echo ""

  local has_diff=false

  if [[ "$direction" == "platform_to_rn" || "$direction" == "both" ]]; then
    echo -e "${BOLD}  Platform → RN (files that differ in RN vs Platform):${NC}"
    compare_dirs "iOS/Pulsar" "$IOS_PLATFORM" "react-native (deps/Pulsar)" "$IOS_RN" || has_diff=true
  fi

  if [[ "$direction" == "rn_to_platform" || "$direction" == "both" ]]; then
    echo ""
    echo -e "${BOLD}  RN → Platform (files in RN not reflected in Platform):${NC}"
    compare_dirs "react-native (deps/Pulsar)" "$IOS_RN" "iOS/Pulsar" "$IOS_PLATFORM" || has_diff=true
  fi

  $has_diff && return 1 || return 0
}

sync_ios() {
  local direction="$1"

  print_section "iOS — syncing"

  if [[ "$direction" == "platform_to_rn" ]]; then
    sync_dirs "iOS/Pulsar" "$IOS_PLATFORM" "react-native (deps/Pulsar)" "$IOS_RN"
  else
    sync_dirs "react-native (deps/Pulsar)" "$IOS_RN" "iOS/Pulsar" "$IOS_PLATFORM"
  fi
}

# ---------------------------------------------------------------------------
# Interactive flow
# ---------------------------------------------------------------------------

choose_platform() {
  print_section "Choose platform" >&2
  echo "  1) Android only" >&2
  echo "  2) iOS only" >&2
  echo "  3) Both" >&2
  echo "" >&2
  read -r -p "  Enter choice [1-3]: " choice
  case "$choice" in
    1) echo "android" ;;
    2) echo "ios" ;;
    3) echo "both" ;;
    *) print_err "Invalid choice." >&2; exit 1 ;;
  esac
}

choose_direction() {
  print_section "Choose source of truth" >&2
  echo "  1) Platform implementation  →  React Native  (Android/Pulsar or iOS/Pulsar is source)" >&2
  echo "  2) React Native             →  Platform       (react-native-pulsar is source)" >&2
  echo "" >&2
  read -r -p "  Enter choice [1-2]: " choice
  case "$choice" in
    1) echo "platform_to_rn" ;;
    2) echo "rn_to_platform" ;;
    *) print_err "Invalid choice." >&2; exit 1 ;;
  esac
}

run_compare_only() {
  print_header "Pulsar Native Implementation — Diff Report"

  local android_ok=true ios_ok=true

  compare_android "both" || android_ok=false
  echo ""
  compare_ios "both" || ios_ok=false

  echo ""
  if $android_ok && $ios_ok; then
    print_ok "All implementations are in sync."
  else
    print_warn "Differences found. Run without --compare to sync."
  fi
  echo ""
}

run_interactive() {
  print_header "Pulsar Native Sync"

  # Step 1: Show current diff
  echo -e "${BOLD}Step 1/3 — Current diff${NC}"
  local android_ok=true ios_ok=true
  compare_android "both" || android_ok=false
  echo ""
  compare_ios "both" || ios_ok=false
  echo ""

  if $android_ok && $ios_ok; then
    print_ok "All implementations are already in sync. Nothing to do."
    echo ""
    exit 0
  fi

  # Step 2: Choose platform and direction
  echo -e "${BOLD}Step 2/3 — Choose what to sync${NC}"
  local platform direction
  platform=$(choose_platform)
  direction=$(choose_direction)

  # Step 3: Preview and confirm
  echo ""
  echo -e "${BOLD}Step 3/3 — Preview${NC}"
  print_section "Changes that will be applied"

  local preview_diff=false
  if [[ "$platform" == "android" || "$platform" == "both" ]]; then
    compare_android "$direction" || preview_diff=true
  fi
  if [[ "$platform" == "ios" || "$platform" == "both" ]]; then
    echo ""
    compare_ios "$direction" || preview_diff=true
  fi

  if ! $preview_diff; then
    print_ok "Nothing to sync in the chosen direction."
    echo ""
    exit 0
  fi

  echo ""
  local src_label dst_label
  if [[ "$direction" == "platform_to_rn" ]]; then
    src_label="Platform (Android/iOS)"
    dst_label="React Native module"
  else
    src_label="React Native module"
    dst_label="Platform (Android/iOS)"
  fi

  if ! confirm "Apply: copy from ${src_label} → ${dst_label}?"; then
    echo -e "${DIM}Aborted.${NC}"
    echo ""
    exit 0
  fi

  echo ""
  if [[ "$platform" == "android" || "$platform" == "both" ]]; then
    sync_android "$direction"
  fi
  if [[ "$platform" == "ios" || "$platform" == "both" ]]; then
    sync_ios "$direction"
  fi

  echo ""
  print_ok "Sync complete. Review changes with: git diff"
  echo ""
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

usage() {
  echo ""
  echo -e "${BOLD}Usage:${NC}"
  echo "  ./scripts/sync-native.sh             Interactive compare + sync"
  echo "  ./scripts/sync-native.sh --compare   Show diff only, no changes"
  echo "  ./scripts/sync-native.sh --help      Show this help"
  echo ""
  echo -e "${BOLD}What it syncs:${NC}"
  echo "  Android:  Android/Pulsar/...pulsar/  ↔  react-native/.../pulsar/"
  echo "            Excludes RN-only bridge files: ${ANDROID_RN_ONLY[*]}"
  echo "  iOS:      iOS/Pulsar/Sources/Pulsar/ ↔  react-native/.../deps/Pulsar/Sources/Pulsar/"
  echo ""
}

case "${1:-}" in
  --compare|-c)
    run_compare_only
    ;;
  --help|-h)
    usage
    ;;
  "")
    run_interactive
    ;;
  *)
    print_err "Unknown argument: $1"
    usage
    exit 1
    ;;
esac
