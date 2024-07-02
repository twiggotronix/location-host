const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { generateSEA } = require("./build/generateSea");
const webpack = require("webpack"); // to access built-in plugins

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  target: "node",
  entry: {
    main: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
      cleanAfterEveryBuildPatterns: ["dist/index.js", "dist/sae-prep.blob"],
    }),
    function () {
      this.hooks.done.tapPromise("GenerateExe", function () {
        return generateSEA();
      });
    },
    new CopyPlugin({
      patterns: [
        { from: "./src/assets/run-on-network-connection.ps1", to: "./" },
      ],
    }),
  ],
};
