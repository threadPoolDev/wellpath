#!/usr/bin/env node
// Patches metro 0.83.x packages to add back ./src/* exports that were removed
// in 0.83.x but are still needed by @expo/metro-config@0.19.x (Expo SDK 52).
const fs = require('fs')
const path = require('path')

const NM = path.join(__dirname, '..', 'node_modules')

const PACKAGES = [
  'metro-cache',
  'metro-transform-worker',
  'metro-resolver',
  'metro-babel-transformer',
]

for (const pkg of PACKAGES) {
  const pkgJsonPath = path.join(NM, pkg, 'package.json')
  if (!fs.existsSync(pkgJsonPath)) continue

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
  if (!pkgJson.exports) continue
  if (pkgJson.exports['./src/*']) continue // already patched

  pkgJson.exports['./src/*'] = './src/*.js'
  pkgJson.exports['./src'] = './src/index.js'
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2))
  console.log(`[patch-metro] Patched ${pkg}@${pkgJson.version}: added ./src/* exports`)
}
