#!/usr/bin/env bash
# iOS SDK unit tests, mirroring .github/workflows/test-ios-sdk.yml.
# Must run on a simulator (the package imports UIKit). Override the device with SIM_DEVICE=<UDID>.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
OUT="$ROOT/.factory-out"
mkdir -p "$OUT"
LOG="$OUT/ios-sdk-tests.log"

UDID="${SIM_DEVICE:-$(xcrun simctl list devices booted | grep -E 'iPhone [0-9]+' | grep -oE '[0-9A-F]{8}-[0-9A-F-]{27}' | head -1)}"
[ -z "$UDID" ] && UDID="$(xcrun simctl list devices available | grep -E 'iPhone [0-9]+' | grep -oE '[0-9A-F]{8}-[0-9A-F-]{27}' | head -1)"
if [ -z "$UDID" ]; then
  echo "no available iPhone simulator" >&2
  exit 1
fi

cd "$ROOT/iOS/Pulsar" || exit 1
rm -rf "$OUT/ios-TestResults.xcresult" "$OUT/ios-MockTestResults.xcresult"
common=(-scheme Pulsar-Package -destination "platform=iOS Simulator,id=$UDID" -skipPackagePluginValidation)

xcodebuild test "${common[@]}" -skip-testing:PulsarTests/CoreHapticsMockTests \
  -resultBundlePath "$OUT/ios-TestResults.xcresult" > "$LOG" 2>&1
main=$?
xcodebuild test "${common[@]}" -only-testing:PulsarTests/CoreHapticsMockTests \
  -resultBundlePath "$OUT/ios-MockTestResults.xcresult" >> "$LOG" 2>&1
mock=$?

grep -E 'Test run with|TEST (SUCCEEDED|FAILED)|error:|✘' "$LOG" | tail -40
[ $main -eq 0 ] && [ $mock -eq 0 ]
