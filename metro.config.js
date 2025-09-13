const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for pnpm dlx cache issues
config.resolver.blockList = [
  /\/Library\/Caches\/pnpm\/dlx\/.*/,
];

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  './node_modules',
];

module.exports = config;