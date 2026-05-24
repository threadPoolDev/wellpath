module.exports = function (api) {
  api.cache(true)

  // expo-router lives in apps/mobile/node_modules but babel-preset-expo resolves
  // from root node_modules, so hasModule('expo-router') returns false and the
  // expoRouterBabelPlugin is never added by the preset. Without it, Metro's
  // collect-dependencies cannot statically evaluate process.env.EXPO_ROUTER_APP_ROOT
  // inside expo-router/_ctx.web.js and throws an InvalidRequireCallError.
  // Adding the plugin explicitly here ensures it always runs regardless of where
  // babel-preset-expo resolves from.
  const { expoRouterBabelPlugin } = require('babel-preset-expo/build/expo-router-plugin')

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      expoRouterBabelPlugin,
    ],
  }
}
