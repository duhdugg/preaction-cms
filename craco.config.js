module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const EXCLUDED_PLUGINS = ['ESLintWebpackPlugin']
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => !EXCLUDED_PLUGINS.includes(plugin.constructor.name)
      )
      return webpackConfig
    },
  },
}
