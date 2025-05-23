module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-runtime',
      'react-native-reanimated/plugin', // Only if you're using Reanimated
    ],
  };
};