const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch monorepo packages so Metro picks up changes in packages/
config.watchFolders = [workspaceRoot]

// Resolve modules from the mobile app's node_modules first, then the
// workspace root's node_modules (hoisted packages)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Force react-native to always resolve from mobile's node_modules (0.76.x).
// Without this, packages in root node_modules that transitively require
// react-native pull in root's 0.85.x which uses JS `match` expressions
// unsupported by Expo SDK 52's Hermes parser.
config.resolver.extraNodeModules = {
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
}

module.exports = withNativeWind(config, { input: './global.css' })
