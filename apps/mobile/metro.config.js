const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Only watch packages/ so Metro never traverses root node_modules.
//
// Watching the entire workspaceRoot caused Metro to discover and attempt
// to transpile root node_modules files (react-native@0.85.x with JS `match`
// syntax, react-native-screens Fabric TypeScript, React 19 JSX shape, etc.)
// even though those packages are not the ones used by the mobile app.
// Limiting watchFolders to packages/ gives Metro visibility into the shared
// workspace packages (constants, types, api-client, store) without exposing
// root node_modules. Module resolution is still handled by nodeModulesPaths.
config.watchFolders = [
  path.resolve(workspaceRoot, 'packages'),
]

// Resolve modules from the mobile app's node_modules first, then the
// workspace root's node_modules (hoisted packages).
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

// Block root node_modules copies of packages that conflict with mobile's
// pinned versions. nodeModulesPaths + extraNodeModules handle resolution to
// the correct mobile copies; blockList ensures the root copies are never
// bundled even if the resolver somehow reaches them.
//
// Root conflicts identified from package-lock.json:
//   react@19.2.6          (mobile needs 18.3.1)
//   react-dom@19.2.6      (mobile needs 18.3.1)
//   react-native@0.85.3   (mobile needs 0.76.3 — root uses `match` syntax)
//   react-native-screens@4.25.1  (mobile needs ~4.1.0 — root has Fabric TS)
//
// Note: metro-config does not export `exclusionList` in this monorepo —
// blockList accepts a RegExp or array of RegExps directly.
const rootNM = path.resolve(workspaceRoot, 'node_modules')
const BLOCKED_ROOT_PACKAGES = [
  'react',
  'react-dom',
  'react-native',
  'react-native-screens',
]
config.resolver.blockList = BLOCKED_ROOT_PACKAGES.map(
  (pkg) => new RegExp(`^${escapeRegex(path.join(rootNM, pkg))}[/\\\\].*$`)
)

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = withNativeWind(config, { input: './global.css' })
