import ExtractTextPlugin from 'extract-text-webpack-plugin';
import path from 'path';

export default {
  context: path.resolve(__dirname, '../src'),
  entry: {
    app: path.resolve(__dirname, '../src/js')
  },
  output: {
    filename: 'js/app.bundle.js',
    path: path.resolve(__dirname, '../dist'),
    sourceMapFilename: '[file].map'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: /node_modules/
    }, { 
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: "css-loader",
          options: {
            minimize: true
          }
        },
        'sass-loader'
        ]
      })
    }]
  }
};