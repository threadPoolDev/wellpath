const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { exclusionList } = require('metro-config')
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

// Force critical packages to always resolve from mobile's node_modules.
//
// Root node_modules has React 19.x (hoisted by web/API packages) while
// Expo SDK 52 + React Native 0.76 requires React 18.x. If Metro uses
// React 19 for any package, its JSX elements get $$typeof from React 19
// which React 18's reconciler can't recognise → "Objects are not valid
// as a React child" crash on web and device.
//
// react-native: root has 0.85.x which uses JS `match` expressions
// unsupported by Expo SDK 52's Hermes parser.
config.resolver.extraNodeModules = {
  'react':        path.resolve(projectRoot, 'node_modules/react'),
  'react-dom':    path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
}

// Exclude root node_modules copies of react/react-native from Metro's file
// graph entirely. watchFolders includes the workspace root so Metro discovers
// these files, but without blockList it will still try to parse/bundle them,
// hitting the `match` syntax in RN 0.85.x (Hermes can't parse it) and the
// React 19 JSX shape. extraNodeModules overrides resolution; blockList
// prevents the root copies from being traversed at all.
const rootNM = path.resolve(workspaceRoot, 'node_modules')
config.resolver.blockList = exclusionList([
  new RegExp(`^${escapeRegex(path.join(rootNM, 'react-native'))}[\\/].*$`),
  new RegExp(`^${escapeRegex(path.join(rootNM, 'react', ''))}.*$`),
  new RegExp(`^${escapeRegex(path.join(rootNM, 'react-dom'))}[\\/].*$`),
])

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = withNativeWind(config, { input: './global.css' })
