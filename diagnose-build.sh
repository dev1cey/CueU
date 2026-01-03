#!/bin/bash
# Build diagnostics script for CueU iOS project

LOG_FILE="/Users/kehanjin/Desktop/Current_Quarter/CSE452/CueU/.cursor/debug.log"
SERVER_ENDPOINT="http://127.0.0.1:7243/ingest/5fc0dea6-b80b-4340-9629-d3f8909bf767"

log_entry() {
  local hypothesis=$1
  local location=$2
  local message=$3
  local data=$4
  echo "{\"sessionId\":\"debug-session\",\"runId\":\"run1\",\"hypothesisId\":\"$hypothesis\",\"location\":\"$location\",\"message\":\"$message\",\"data\":$data,\"timestamp\":$(date +%s)000}" >> "$LOG_FILE"
}

echo "=== CueU iOS Build Diagnostics ==="

# Hypothesis A: Check if Pods are installed
echo "Checking CocoaPods installation..."
if [ -d "ios/Pods" ]; then
  POD_COUNT=$(find ios/Pods -maxdepth 1 -type d | wc -l)
  log_entry "A" "diagnose-build.sh:20" "Pods directory exists" "{\"exists\":true,\"podCount\":$POD_COUNT}"
else
  log_entry "A" "diagnose-build.sh:22" "Pods directory missing" "{\"exists\":false}"
fi

# Check specific Expo module directories
for module in "EXConstants" "Expo" "ExpoAsset" "ExpoModulesCore"; do
  if [ -d "ios/Pods/$module" ]; then
    log_entry "A" "diagnose-build.sh:28" "Module pod exists" "{\"module\":\"$module\",\"exists\":true}"
  else
    log_entry "A" "diagnose-build.sh:30" "Module pod missing" "{\"module\":\"$module\",\"exists\":false}"
  fi
done

# Check for module map files
echo "Checking for module map files..."
MODULEMAP_COUNT=$(find ios/Pods -name "*.modulemap" 2>/dev/null | wc -l)
log_entry "A" "diagnose-build.sh:37" "Module map file count" "{\"count\":$MODULEMAP_COUNT}"

# Hypothesis B: Check Xcode derived data
echo "Checking Xcode derived data..."
DERIVED_DATA_PATH="$HOME/Library/Developer/Xcode/DerivedData"
CUEU_DERIVED=$(find "$DERIVED_DATA_PATH" -maxdepth 1 -name "CueU-*" -type d 2>/dev/null | head -1)
if [ -n "$CUEU_DERIVED" ]; then
  DERIVED_SIZE=$(du -sh "$CUEU_DERIVED" 2>/dev/null | cut -f1)
  log_entry "B" "diagnose-build.sh:45" "Derived data exists" "{\"exists\":true,\"path\":\"$CUEU_DERIVED\",\"size\":\"$DERIVED_SIZE\"}"
else
  log_entry "B" "diagnose-build.sh:47" "No derived data found" "{\"exists\":false}"
fi

# Hypothesis C: Check which Xcode workspace/project files exist
echo "Checking Xcode project files..."
if [ -f "ios/CueU.xcworkspace/contents.xcworkspacedata" ]; then
  log_entry "C" "diagnose-build.sh:53" "Workspace file exists" "{\"workspace\":true}"
else
  log_entry "C" "diagnose-build.sh:55" "Workspace file missing" "{\"workspace\":false}"
fi

if [ -f "ios/CueU.xcodeproj/project.pbxproj" ]; then
  log_entry "C" "diagnose-build.sh:59" "Project file exists" "{\"project\":true}"
else
  log_entry "C" "diagnose-build.sh:61" "Project file missing" "{\"project\":false}"
fi

# Hypothesis D: Compare Podfile.lock with Manifest.lock
echo "Checking pod lock files..."
if [ -f "ios/Podfile.lock" ]; then
  PODFILE_LOCK_HASH=$(md5 -q "ios/Podfile.lock" 2>/dev/null || echo "none")
  log_entry "D" "diagnose-build.sh:68" "Podfile.lock exists" "{\"exists\":true,\"hash\":\"$PODFILE_LOCK_HASH\"}"
else
  log_entry "D" "diagnose-build.sh:70" "Podfile.lock missing" "{\"exists\":false}"
fi

if [ -f "ios/Pods/Manifest.lock" ]; then
  MANIFEST_LOCK_HASH=$(md5 -q "ios/Pods/Manifest.lock" 2>/dev/null || echo "none")
  log_entry "D" "diagnose-build.sh:75" "Manifest.lock exists" "{\"exists\":true,\"hash\":\"$MANIFEST_LOCK_HASH\"}"
  
  if [ "$PODFILE_LOCK_HASH" = "$MANIFEST_LOCK_HASH" ]; then
    log_entry "D" "diagnose-build.sh:78" "Lock files match" "{\"match\":true}"
  else
    log_entry "D" "diagnose-build.sh:80" "Lock files mismatch" "{\"match\":false,\"podfile\":\"$PODFILE_LOCK_HASH\",\"manifest\":\"$MANIFEST_LOCK_HASH\"}"
  fi
else
  log_entry "D" "diagnose-build.sh:83" "Manifest.lock missing" "{\"exists\":false}"
fi

# Hypothesis E: Check Pods project build settings
echo "Checking Pods project configuration..."
if [ -f "ios/Pods/Pods.xcodeproj/project.pbxproj" ]; then
  # Check for search paths in the Pods project
  HEADER_SEARCH_PATHS=$(grep -c "HEADER_SEARCH_PATHS" "ios/Pods/Pods.xcodeproj/project.pbxproj" 2>/dev/null || echo "0")
  log_entry "E" "diagnose-build.sh:91" "Pods project config" "{\"exists\":true,\"headerSearchPathsCount\":$HEADER_SEARCH_PATHS}"
else
  log_entry "E" "diagnose-build.sh:93" "Pods project missing" "{\"exists\":false}"
fi

# Check CocoaPods version
echo "Checking CocoaPods version..."
POD_VERSION=$(pod --version 2>/dev/null || echo "not_installed")
log_entry "A" "diagnose-build.sh:99" "CocoaPods version" "{\"version\":\"$POD_VERSION\"}"

echo "=== Diagnostics complete. Check $LOG_FILE for results ==="

