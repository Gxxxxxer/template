const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ReactLoadablePlugin = require('react-loadable/webpack').ReactLoadablePlugin
const base = require('./webpack.conf.base')
const config = require('./config')

const r = dir => path.resolve(__dirname, '..', dir)

module.exports = merge(base, {
    mode: 'production',
    devtool: '#source-map',
    performance: {
        hints: 'warning',
        maxAssetSize: 300000,
        assetFilter: (assetFilename) => {
            return assetFilename.endsWith('.js')
        }
    },
    entry: {
        app: './src/entry-client.js'
    },
    output: {
        filename: 'static/js/[name].[chunkhash:8].js',
        path: r('dist'),
        publicPath: config.prod.publicPath,
        chunkFilename: 'static/js/[name].[chunkhash:8].js'
    },
    resolve: {
        mainFields: ['jsnext:main', 'browser', 'main']
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader'
                },
                include: r('src')
            },
            {
                test: /\.(css|less)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            minimize: true,
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                require('postcss-flexbugs-fixes'),
                                require('autoprefixer')({
                                    browsers: [
                                        '>1%',
                                        'last 4 versions',
                                        'Firefox ESR',
                                        'not ie < 9'
                                    ],
                                    flexbox: 'no-2009'
                                })
                            ],
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            cacheGroups: {
                vender: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vender',
                    priority: -10,
                    chunks: 'all'
                }
            }
        },
        minimizer: [
            new UglifyjsWebpackPlugin({
                uglifyOptions: {
                    output: {
                        comments: false,
                        beautify: false
                    },
                    compress: {
                        warnings: false
                    }
                },
                cache: true,
                parallel: true,
                sourceMap: true
            })
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'server.ejs',
            template: '!!ejs-compiled-loader!' + r('public/server.template.ejs'),
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            chunksSortMode: 'dependency'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                isClient: 'true',
                isServer: 'false'
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].css'
        }),
        new CopyWebpackPlugin([
            { from: r('public'), to: '', ignore: ['index.template.html', 'server.template.ejs'] }
        ]),
        new ReactLoadablePlugin({
            filename: './dist/react-loadable.json'
        })
    ]
})
