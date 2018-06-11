const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const pkg = require('./package.json');
const cssCustomProperties = require('postcss-custom-properties');
const cssImport = require('postcss-import');
const cssMaps = require('postcss-map');
const autoprefixer = require('autoprefixer');
const colorsMaps = require('./src/helpers/colors');
const fontMaps = require('./src/helpers/fonts');

const cssTransformOptions = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      plugins: () => {
        return [
          cssImport(),
          cssCustomProperties(),
          cssMaps({
            maps: [{ colors: colorsMaps.values, fontFamilies: fontMaps.families }]
          }),
          autoprefixer()
        ];
      }
    }
  }
];

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: {
    vkui: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules\/(?!vkui)(.+)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, ...cssTransformOptions]
      }
    ]
  },
  optimization: {
    minimize: false
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin('[name].css')
  ],
  stats: {
    children: false
  },
  mode: process.env.NODE_ENV || 'development',
  externals: {
    'react': 'react',
    'prop-types': 'prop-types',
    'react-dom': 'react-dom',
    '@vkontakte/icons': '@vkontakte/icons',
    'svg-baker-runtime/browser-symbol': 'svg-baker-runtime/browser-symbol',
    'svg-sprite-loader/runtime/browser-sprite.build': 'svg-sprite-loader/runtime/browser-sprite.build'
  }
};

const devConfig = {};

const prodConfig = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"production"`,
      'process.env.VKUI_VERSION': `"${pkg.version}"`
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

module.exports = isProduction
  ? merge(config, prodConfig)
  : merge(config, devConfig);