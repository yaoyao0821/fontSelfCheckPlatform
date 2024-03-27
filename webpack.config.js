
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  name: "deObfuscation",
  context: __dirname,
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    app: './src/browser/index.js',
    login:'./src/browser/login.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  devServer: {
    inline: true,
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: __dirname + "/src/browser/templates/login.html",
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      filename: 'dev.html',
      template: __dirname + "/src/browser/templates/index.html",
      chunks: ['app']
    }),
    new MiniCssExtractPlugin(),
  ],
  module:{
    rules:[
        {
          test: /\.css$/,
          use:[MiniCssExtractPlugin.loader,'css-loader']
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: "[name].[ext]", 
              outputPath: "imgs",
              publicPath: "./imgs",
            }
          }
        },
    ]
  }
} 




