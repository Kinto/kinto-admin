var path = require("path");
var webpack = require("webpack");
var version = require("./package.json").version;

module.exports = {
  devtool: "#inline-source-map",
  entry: [
    "babel-polyfill",
    "webpack-hot-middleware/client",
    "./index"
  ],
  output: {
    path: path.join(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "/"
  },
  plugins: [
    new webpack.IgnorePlugin(/^(buffertools)$/), // unwanted "deeper" dependency
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("development"),
        KINTO_ADMIN_VERSION: JSON.stringify(version),
      }
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".css", ".eot", "png", ".woff", ".woff2", ".ttf", ".svg"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        include: [
          path.join(__dirname),
          path.join(__dirname, "src"),
        ],
      },
      {
        test: /\.css$/,
        use: [
          {loader:"style-loader"}, {loader: "css-loader"}
        ]
      },
      { test: /\.png$/, loader: "url-loader", options: {"limit": 10000} },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
      { test: /\.(woff|woff2)$/, loader:"url-loader", options: {"prefix": "font/", "limit": 5000} },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader", options: {limit: 10000, mimetype: "application/octet-stream"} },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader", options: {limit: 10000, mimetype: "image/svg+xml"} }
    ]
  }
};
