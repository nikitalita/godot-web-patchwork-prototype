const path = require('path');

module.exports = (env, argv) => ({
  context: path.resolve(__dirname, 'src'),
  entry: './index.ts',
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
    headers: {
      "Cross-Origin-Opener-Policy-Report-Only": "same-origin",
      "Cross-Origin-Embedder-Policy-Report-Only": "require-corp",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
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