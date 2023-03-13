const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: "./src/index.js",
    dev: "./src/index.dev.js"
  },
  plugins: [
     new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['dist/*.*']
        }),
     new HtmlWebpackPlugin({
        title: 'Monetisation monitoring',
        template: './src/index.html',
        chunks: ['main']
     }),
      new HtmlWebpackPlugin({
        title: 'DEV Monetisation monitoring',
        template: './src/index.dev.html',
        chanks: ['dev'],
        excludeChunks: [ 'main' ],
        filename: 'index.dev.html'
     }),
   ],
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[contenthash].index_bundle.[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './img/[name].[hash].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: './fonts/[name].[hash].[ext]'
        }
      },
      {
        test: /\.(scss)$/,
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            postcssOptions: {
              plugins: [
                ['autoprefixer', {}],
                ['precss', {}]
              ]
            }
          }
        }, {
          loader: 'sass-loader' // compiles Sass to CSS
        }]
      }
    ]
  }
};