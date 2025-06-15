const path = require('path');

module.exports = (env, argv) => ({
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
  devtool: 'eval-source-map',//argv.mode === 'production' ? false : 'eval-source-map',
  // don't minify if not production
  optimization: {
    minimize: false,//argv.mode === 'production',
  },
  // ensure that getProjectAndImportAndLaunch is exposed by setting it on the window
  externals: {
    'getProjectAndImportAndLaunch': 'getProjectAndImportAndLaunch',
  },
}); 