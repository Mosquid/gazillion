const path = require("path")
const fs = require("fs")

module.exports = {
  entry: "./docs/src/index.js",
  output: {
    path: path.resolve(__dirname, "./docs/dist"),
    filename: "bundle.js",
  },
  devServer: {
    port: 9000,
    contentBase: path.resolve(__dirname, "./docs"),
  },
  module: {
    rules: [
      {
        test: /\.js$/, //using regex to tell babel exactly what files to transcompile
        exclude: /node_modules/, // files to be ignored
        use: {
          loader: "babel-loader", // specify the loader
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
}
