/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo-aware Metro config so the mobile app can resolve shared packages
// located in ../../packages and node_modules hoisted to the repo root.
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
