const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/App.jsx',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve('build/static/js'),
    filename: 'client.cjs.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js.?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: true,
                  },
                },
              ],
            ],
          },
        },
      },
      { test: /\.css$/, use: 'ignore-loader' },
    ],
  },
}
