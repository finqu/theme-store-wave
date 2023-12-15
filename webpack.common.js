const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
	entry: {
		main: './assets/main.js'
	},
	performance: {
		hints: false
	},
	resolve: {
		alias: {
			'handlebars/runtime': 'handlebars/dist/handlebars.runtime',
    		'handlebars': 'handlebars/dist/handlebars'
		},
		fallback: {
			fs: false
		}
	},
	target: ['web', 'es2021'],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'assets/'
						}
					}
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: ['js/*']
		}),
		new WebpackManifestPlugin({
			fileName: 'cache.manifest.json'
		})
	],
	optimization: {
		splitChunks: {
			cacheGroups: {
				handlebars: {
					test: /[\\/]node_modules[\\/]((handlebars).*)[\\/]/,
					name: 'handlebars',
					chunks: 'all'
				},
				swiper: {
					test: /[\\/]node_modules[\\/]((swiper).*)[\\/]/,
					name: 'swiper',
					chunks: 'all'
				},
				vendors: {
					test(module) {

						const exclude = [
							'handlebars',
							'swiper'
						];

						if (!module.context ||
							!module.context.includes('node_modules') ||
							exclude.some(str => module.context.includes(str))) {
							return false;
						}

						return true;
					},
					name: 'vendors',
					chunks: 'all'
				}
			}
		},
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ecma: '2021'
				},
				extractComments: true
			}),
			new CompressionPlugin({
				test: /\.jp(e?)g$|\.png$|.svg$|\.js$|\.css(\?.*)?$/i,
				threshold: 860
			})
		]
	},
	output: {
		filename: 'js/[name].[contenthash].js',
		chunkFilename: 'js/[name].[contenthash].bundle.js',
		path: path.resolve(__dirname, 'public'),
		publicPath: ''
	}
};