const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/ssr.meta.js',
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],
  output: {
    path: path.resolve('build/ssr'),
    filename: 'meta.cjs.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: 'current',
                  },
                },
              ],
              ['@babel/preset-react'],
            ],
          },
        },
      },
    ],
  },
}
