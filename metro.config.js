const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for pnpm dlx cache issues - more comprehensive blocking
config.resolver.blockList = [
  /.*\/Library\/Caches\/pnpm\/.*/,
  /.*\.git\/.*/,
];

// Ensure proper module resolution for pnpm
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'node_modules/.pnpm/node_modules'),
];

// Add watchFolders to ensure Metro only watches the project directory
config.watchFolders = [__dirname];

// Reset cache on startup
config.resetCache = true;

// Enable symlinks for pnpm
config.resolver.unstable_enableSymlinks = true;

module.exports = config;