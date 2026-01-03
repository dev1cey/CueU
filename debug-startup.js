#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const LOG_PATH = '/Users/kehanjin/Desktop/Current_Quarter/CSE452/CueU/.cursor/debug.log';

function log(location, message, data, hypothesisId) {
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    location,
    message,
    data,
    sessionId: 'debug-session',
    runId: 'pre-fix',
    hypothesisId
  };
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
}

try {
  // H1, H2: Check Expo Go versions in simulator
  log('debug-startup.js:1', 'Starting diagnostics', {}, 'H1,H2');
  
  // Get list of booted simulators
  const bootedSims = execSync('xcrun simctl list devices booted --json', { encoding: 'utf8' });
  const bootedData = JSON.parse(bootedSims);
  log('debug-startup.js:2', 'Booted simulators', { bootedData }, 'H3,H4');
  
  // Check if any simulators are booted
  let hasBootedSim = false;
  let bootedSimUDID = null;
  for (const runtime in bootedData.devices) {
    if (bootedData.devices[runtime].length > 0) {
      hasBootedSim = true;
      bootedSimUDID = bootedData.devices[runtime][0].udid;
      break;
    }
  }
  log('debug-startup.js:3', 'Simulator boot status', { hasBootedSim, bootedSimUDID }, 'H3,H4');
  
  if (bootedSimUDID) {
    // H1, H2: Check installed apps on simulator
    try {
      const apps = execSync(`xcrun simctl listapps ${bootedSimUDID}`, { encoding: 'utf8' });
      const expoGoApps = apps.split('\n').filter(line => line.includes('Expo Go') || line.includes('host.exp.Exponent'));
      log('debug-startup.js:4', 'Expo Go apps found', { count: expoGoApps.length, apps: expoGoApps.slice(0, 5) }, 'H1,H2');
    } catch (e) {
      log('debug-startup.js:5', 'Failed to list apps', { error: e.message }, 'H1,H2');
    }
  }
  
  // H3: Check network connectivity
  try {
    const ifconfig = execSync('ifconfig | grep "inet " | grep -v 127.0.0.1', { encoding: 'utf8' });
    const ips = ifconfig.split('\n').filter(l => l.trim());
    log('debug-startup.js:6', 'Network interfaces', { ips }, 'H3');
  } catch (e) {
    log('debug-startup.js:7', 'Network check failed', { error: e.message }, 'H3');
  }
  
  // H5: Check if port 8081 is in use
  try {
    const lsof = execSync('lsof -i :8081 -sTCP:LISTEN', { encoding: 'utf8' });
    log('debug-startup.js:8', 'Port 8081 status', { inUse: true, details: lsof }, 'H5');
  } catch (e) {
    log('debug-startup.js:9', 'Port 8081 status', { inUse: false }, 'H5');
  }
  
  // Check Expo CLI version
  try {
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8', cwd: '/Users/kehanjin/Desktop/Current_Quarter/CSE452/CueU' });
    log('debug-startup.js:10', 'Expo CLI version', { version: expoVersion.trim() }, 'H1,H2');
  } catch (e) {
    log('debug-startup.js:11', 'Expo CLI check failed', { error: e.message }, 'H1,H2');
  }
  
  log('debug-startup.js:12', 'Diagnostics complete', {}, 'ALL');
  
} catch (error) {
  log('debug-startup.js:ERROR', 'Diagnostic script error', { error: error.message, stack: error.stack }, 'ALL');
}

