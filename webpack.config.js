const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'

const optimization = () => {
  let config = {
    splitChunks: {
      chunks: 'all'
    }
  }
  if(!isDev){
    config = {
      minimize: true,
      minimizer: [
        new OptimizeCssAssetsWebpackPlugin(),
        new TerserPlugin()
      ]
    }
  }
  return config
}
const filename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`
const babelOptions = (preset) => {
  const options = {
      presets: [
        '@babel/preset-env'        
      ],
      plugins:[
        '@babel/plugin-proposal-class-properties'
      ]
    }
    if(preset){
      options.presets.push(preset)
    }
    return options
}

module.exports = {
  context: path.resolve(__dirname,'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.js'],
    lib: './lib.ts'
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@models': path.resolve(__dirname, 'src/models')
    }
  },
  optimization: optimization(),
  output: {    
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    port: '4500',
    hot: isDev
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        removeComments: !isDev,
        collapseWhitespace: !isDev
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename:filename('css')
    }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          }, 
        'css-loader'
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev, 
              reloadAll: true
            }
          }, 
        'css-loader',
        'sass-loader'
        ],
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: babelOptions()
        }
      },
      {
        test: /\.ts$/i,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-typescript')
        }
      }
    ]
  },
  
}