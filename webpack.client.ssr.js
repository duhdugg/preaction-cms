const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/ssr.index.js',
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],
  output: {
    path: path.resolve('build/ssr'),
    filename: 'client.cjs.js',
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
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
}
