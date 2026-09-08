const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// Exclude .claude worktrees to avoid "Duplicated files" errors from
// nested package.json files that share the same Haste module name.
const exclusionPattern = /\.claude[/\\].*/;

const config = mergeConfig(defaultConfig, {
  resolver: {
    sourceExts: [...(defaultConfig.resolver.sourceExts || []), 'cjs'],
    blockList: exclusionPattern,
  },
});

module.exports = config;
