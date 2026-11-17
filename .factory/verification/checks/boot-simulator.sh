#!/bin/sh
# Verifier setup for mobile e2e: make sure one iOS simulator or Android emulator is running.
# Prefers an already booted device. Override with SIM_DEVICE (iOS name/UDID) or AVD_NAME.
set -u
if command -v xcrun >/dev/null 2>&1; then
  if xcrun simctl list devices booted | grep -q Booted; then exit 0; fi
  DEV="${SIM_DEVICE:-$(xcrun simctl list devices available | grep -E 'iPhone' | head -1 | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/')}"
  if [ -n "$DEV" ]; then xcrun simctl boot "$DEV" && xcrun simctl bootstatus "$DEV" -b >/dev/null && exit 0; fi
fi
if command -v adb >/dev/null 2>&1 && adb devices | grep -qE 'emulator-[0-9]+\s+device'; then exit 0; fi
if command -v emulator >/dev/null 2>&1; then
  AVD="${AVD_NAME:-$(emulator -list-avds | grep -v '^INFO' | head -1)}"
  if [ -n "$AVD" ]; then
    nohup emulator -avd "$AVD" -no-window -no-audio -no-snapshot-save >/dev/null 2>&1 &
    adb wait-for-device shell 'while [ -z "$(getprop sys.boot_completed)" ]; do sleep 2; done' && exit 0
  fi
fi
echo "no simulator or emulator available (install Xcode simulators or an Android AVD; Argent can manage them)" >&2
exit 1
