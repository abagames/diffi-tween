module.exports = {
  entry: {
    'diffi-tween': ['./src/index.ts'],
    'sample-avoid': ['./src/samples/avoid.ts', './src/index.ts']
  },
  output: {
    path: __dirname + '/docs',
    filename: '[name]/index.js',
    library: ['[name]'],
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules', 'web_modules']
  },
  devtool: 'source-map',
  devServer: {
    contentBase: 'docs'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|web_modules)/,
        loader: 'awesome-typescript-loader'
      }
    ]
  }
};