#!/usr/bin/env bash
# sync-native.sh
# Compare and sync native haptics implementation between:
#   - Android/Pulsar   ↔   react-native/react-native-pulsar/android
#   - Android/Pulsar   →   flutter/Pulsar/android
#   - iOS/Pulsar       →   flutter/Pulsar/ios
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
ANDROID_FLUTTER="$REPO_ROOT/flutter/Pulsar/android/src/main/kotlin/com/swmansion/pulsar"

IOS_PLATFORM="$REPO_ROOT/iOS/Pulsar/Sources/Pulsar"
IOS_FLUTTER="$REPO_ROOT/flutter/Pulsar/ios/Classes"

# rsync --exclude flags for Android RN bridge files (never synced)
ANDROID_EXCLUDES="--exclude=PulsarModule.kt --exclude=PulsarPackage.kt --exclude=PulsarReactNative.kt --exclude=ReactNativeActivityProvider.kt"
ANDROID_FLUTTER_EXCLUDES="--exclude=PulsarPlugin.kt"
IOS_FLUTTER_EXCLUDES="--exclude=PulsarPlugin.swift"

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

target_label() {
  case "$1" in
    rn) echo "React Native" ;;
    flutter) echo "Flutter" ;;
    *) print_err "Unknown target: $1" >&2; exit 1 ;;
  esac
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
  local target="${1:-rn}"
  local direction="${2:-both}"  # "platform_to_target", "target_to_platform", "both"
  local target_path target_display excludes has_reverse_sync

  case "$target" in
    rn)
      target_path="$ANDROID_RN"
      target_display="react-native (android)"
      excludes="$ANDROID_EXCLUDES"
      has_reverse_sync=true
      ;;
    flutter)
      target_path="$ANDROID_FLUTTER"
      target_display="flutter (android)"
      excludes="$ANDROID_FLUTTER_EXCLUDES"
      has_reverse_sync=false
      ;;
    *)
      print_err "Unknown Android sync target: $target"
      exit 1
      ;;
  esac

  print_section "Android — comparing shared implementation ($(target_label "$target"))"
  if [[ "$target" == "rn" ]]; then
    print_info "Excluded RN bridge files: PulsarModule.kt PulsarPackage.kt PulsarReactNative.kt"
  else
    print_info "Excluded Flutter bridge file: PulsarPlugin.kt"
  fi
  print_info "Platform: $ANDROID_PLATFORM"
  print_info "Target:   $target_path"
  echo ""

  local has_diff=false

  if [[ "$direction" == "platform_to_target" || "$direction" == "both" ]]; then
    echo -e "${BOLD}  Platform → ${target_display} (files that differ in target vs Platform):${NC}"
    # word-split exclude flags intentionally into separate rsync args
    # shellcheck disable=SC2086
    compare_dirs "Android/Pulsar" "$ANDROID_PLATFORM" "$target_display" "$target_path" $excludes || has_diff=true
  fi

  if $has_reverse_sync && [[ "$direction" == "target_to_platform" || "$direction" == "both" ]]; then
    echo ""
    echo -e "${BOLD}  ${target_display} → Platform (files in target not reflected in Platform):${NC}"
    # shellcheck disable=SC2086
    compare_dirs "$target_display" "$target_path" "Android/Pulsar" "$ANDROID_PLATFORM" $excludes || has_diff=true
  fi

  $has_diff && return 1 || return 0
}

sync_android() {
  local target="$1"
  local direction="$2"  # "platform_to_target" or "target_to_platform"
  local target_path target_display excludes

  case "$target" in
    rn)
      target_path="$ANDROID_RN"
      target_display="react-native (android)"
      excludes="$ANDROID_EXCLUDES"
      ;;
    flutter)
      target_path="$ANDROID_FLUTTER"
      target_display="flutter (android)"
      excludes="$ANDROID_FLUTTER_EXCLUDES"
      ;;
    *)
      print_err "Unknown Android sync target: $target"
      exit 1
      ;;
  esac

  print_section "Android — syncing ($(target_label "$target"))"

  if [[ "$direction" == "platform_to_target" ]]; then
    # shellcheck disable=SC2086
    sync_dirs "Android/Pulsar" "$ANDROID_PLATFORM" "$target_display" "$target_path" $excludes
  else
    # shellcheck disable=SC2086
    sync_dirs "$target_display" "$target_path" "Android/Pulsar" "$ANDROID_PLATFORM" $excludes
  fi
}

# ---------------------------------------------------------------------------
# iOS compare / sync
# ---------------------------------------------------------------------------

compare_ios() {
  local target="${1:-flutter}"
  local direction="${2:-both}"
  local target_path target_display excludes has_reverse_sync

  case "$target" in
    flutter)
      target_path="$IOS_FLUTTER"
      target_display="flutter (ios/Classes)"
      excludes="$IOS_FLUTTER_EXCLUDES"
      has_reverse_sync=false
      ;;
    *)
      print_err "Unknown iOS sync target: $target"
      exit 1
      ;;
  esac

  print_section "iOS — comparing shared implementation ($(target_label "$target"))"
  if [[ "$target" == "flutter" ]]; then
    print_info "Excluded Flutter bridge file: PulsarPlugin.swift"
  fi
  print_info "Platform: $IOS_PLATFORM"
  print_info "Target:   $target_path"
  echo ""

  local has_diff=false

  if [[ "$direction" == "platform_to_target" || "$direction" == "both" ]]; then
    echo -e "${BOLD}  Platform → ${target_display} (files that differ in target vs Platform):${NC}"
    # shellcheck disable=SC2086
    compare_dirs "iOS/Pulsar" "$IOS_PLATFORM" "$target_display" "$target_path" $excludes || has_diff=true
  fi

  if $has_reverse_sync && [[ "$direction" == "target_to_platform" || "$direction" == "both" ]]; then
    echo ""
    # shellcheck disable=SC2086
    echo -e "${BOLD}  ${target_display} → Platform (files in target not reflected in Platform):${NC}"
    compare_dirs "$target_display" "$target_path" "iOS/Pulsar" "$IOS_PLATFORM" $excludes || has_diff=true
  fi

  $has_diff && return 1 || return 0
}

sync_ios() {
  local target="$1"
  local direction="$2"
  local target_path target_display excludes

  case "$target" in
    flutter)
      target_path="$IOS_FLUTTER"
      target_display="flutter (ios/Classes)"
      excludes="$IOS_FLUTTER_EXCLUDES"
      ;;
    *)
      print_err "Unknown iOS sync target: $target"
      exit 1
      ;;
  esac

  print_section "iOS — syncing ($(target_label "$target"))"

  if [[ "$direction" == "platform_to_target" ]]; then
    # shellcheck disable=SC2086
    sync_dirs "iOS/Pulsar" "$IOS_PLATFORM" "$target_display" "$target_path" $excludes
  else
    # shellcheck disable=SC2086
    sync_dirs "$target_display" "$target_path" "iOS/Pulsar" "$IOS_PLATFORM" $excludes
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

choose_target() {
  local platform="$1"
  print_section "Choose sync target" >&2
  if [[ "$platform" == "ios" ]]; then
    print_info "iOS sync targets Flutter only; React Native uses the Pulsar-haptics pod." >&2
    echo "  1) Flutter" >&2
    echo "" >&2
    read -r -p "  Enter choice [1]: " choice
    case "$choice" in
      1|"") echo "flutter" ;;
      *) print_err "Invalid choice." >&2; exit 1 ;;
    esac
  else
    echo "  1) React Native" >&2
    echo "  2) Flutter" >&2
    echo "" >&2
    read -r -p "  Enter choice [1-2]: " choice
    case "$choice" in
      1) echo "rn" ;;
      2) echo "flutter" ;;
      *) print_err "Invalid choice." >&2; exit 1 ;;
    esac
  fi
}

choose_direction() {
  local target="$1"

  print_section "Choose source of truth" >&2
  if [[ "$target" == "rn" ]]; then
    echo "  1) Platform implementation  →  React Native  (Android/Pulsar or iOS/Pulsar is source)" >&2
    echo "  2) React Native             →  Platform      (react-native-pulsar is source)" >&2
    echo "" >&2
    read -r -p "  Enter choice [1-2]: " choice
    case "$choice" in
      1) echo "platform_to_target" ;;
      2) echo "target_to_platform" ;;
      *) print_err "Invalid choice." >&2; exit 1 ;;
    esac
  else
    print_info "Flutter sync uses native as source of truth." >&2
    echo "  1) Platform implementation  →  Flutter  (recommended/default)" >&2
    echo "" >&2
    read -r -p "  Enter choice [1]: " choice
    case "$choice" in
      1|"") echo "platform_to_target" ;;
      *) print_err "Invalid choice." >&2; exit 1 ;;
    esac
  fi
}

run_compare_only() {
  print_header "Pulsar Native Implementation — Diff Report"

  local android_rn_ok=true
  local android_flutter_ok=true ios_flutter_ok=true

  compare_android "rn" "both" || android_rn_ok=false
  echo ""
  compare_android "flutter" "platform_to_target" || android_flutter_ok=false
  echo ""
  compare_ios "flutter" "platform_to_target" || ios_flutter_ok=false

  echo ""
  if $android_rn_ok && $android_flutter_ok && $ios_flutter_ok; then
    print_ok "All implementations are in sync."
  else
    print_warn "Differences found. Run without --compare to sync."
  fi
  echo ""
  return 0
}

run_interactive() {
  print_header "Pulsar Native Sync"

  # Step 1: Show current diff
  echo -e "${BOLD}Step 1/3 — Current diff${NC}"
  local android_rn_ok=true
  local android_flutter_ok=true ios_flutter_ok=true

  compare_android "rn" "both" || android_rn_ok=false
  echo ""
  compare_android "flutter" "platform_to_target" || android_flutter_ok=false
  echo ""
  compare_ios "flutter" "platform_to_target" || ios_flutter_ok=false
  echo ""

  if $android_rn_ok && $android_flutter_ok && $ios_flutter_ok; then
    print_ok "All implementations are already in sync. Nothing to do."
    echo ""
    exit 0
  fi

  # Step 2: Choose platform and direction
  echo -e "${BOLD}Step 2/3 — Choose what to sync${NC}"
  local platform target direction
  platform=$(choose_platform)
  target=$(choose_target "$platform")
  direction=$(choose_direction "$target")

  # Step 3: Preview and confirm
  echo ""
  echo -e "${BOLD}Step 3/3 — Preview${NC}"
  print_section "Changes that will be applied"

  local preview_diff=false
  if [[ "$platform" == "android" || "$platform" == "both" ]]; then
    compare_android "$target" "$direction" || preview_diff=true
  fi
  if [[ "$platform" == "ios" || "$platform" == "both" ]]; then
    echo ""
    compare_ios "$target" "$direction" || preview_diff=true
  fi

  if ! $preview_diff; then
    print_ok "Nothing to sync in the chosen direction."
    echo ""
    exit 0
  fi

  echo ""
  local src_label dst_label
  if [[ "$direction" == "platform_to_target" ]]; then
    src_label="Platform (Android/iOS)"
    dst_label="$(target_label "$target") module"
  else
    src_label="$(target_label "$target") module"
    dst_label="Platform (Android/iOS)"
  fi

  if ! confirm "Apply: copy from ${src_label} → ${dst_label}?"; then
    echo -e "${DIM}Aborted.${NC}"
    echo ""
    exit 0
  fi

  echo ""
  if [[ "$platform" == "android" || "$platform" == "both" ]]; then
    sync_android "$target" "$direction"
  fi
  if [[ "$platform" == "ios" || "$platform" == "both" ]]; then
    sync_ios "$target" "$direction"
  fi

  echo ""
  print_ok "Sync complete. Review changes with: git diff"
  echo ""
  return 0
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
  echo "            Excludes RN-only bridge files: PulsarModule.kt PulsarPackage.kt PulsarReactNative.kt"
  echo "  Android:  Android/Pulsar/...pulsar/  →  flutter/Pulsar/.../pulsar/"
  echo "            Excludes Flutter-only bridge file: PulsarPlugin.kt"
  echo "  iOS:      iOS/Pulsar/Sources/Pulsar/ →  flutter/Pulsar/ios/Classes/"
  echo "            Excludes Flutter-only bridge file: PulsarPlugin.swift"
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
