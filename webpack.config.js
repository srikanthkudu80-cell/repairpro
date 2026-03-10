const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Polyfill crypto for web
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: false,
  };

  // Explicitly inject EXPO_PUBLIC_ env vars for webpack
  const expoPubVars = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k]) => k.startsWith('EXPO_PUBLIC_'))
      .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
  );
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.DefinePlugin(expoPubVars));

  return config;
};
