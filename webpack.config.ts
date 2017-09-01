import * as ExtractText from 'extract-text-webpack-plugin';
import * as ExtractHtml from 'html-webpack-plugin';
import { resolve } from 'path';
import { Configuration } from 'webpack';
import * as Polyfills from 'core-js-webpack-plugin';

const publicPath = resolve(__dirname, 'public');

const conf: Configuration = {
	entry: ['./app.tsx'],
	context: __dirname,
	output: {
		filename: 'app.js',
		path: resolve(__dirname, 'public'),
		publicPath: './',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		modules: ['node_modules'],
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [{ loader: 'html-loader' }],
			},
			{
				test: /\.less$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'less-loader'],
				}),
			},
			{
				test: /\.css$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: ['css-loader'],
				}),
			},
			{
				test: /\.(jpg|png|bmp|svg|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: './img/[name].[ext]',
							publicPath: './img',
						},
					},
				],
			},
			{
				test: /\.(ts|tsx|js|jsx)$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(woff|woff2|eot|ttf|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: '102400',
							name: './fonts/[hash].[ext]',
							publicPath: './fonts',
						},
					},
				],
			},
		],
	},
	devtool: 'cheap-module-source-map',
	plugins: [
		new ExtractText({
			filename: 'style.css',
		}),
		new ExtractHtml({
			title: 'RX operators',
			template: './index.html',
		}),
		new Polyfills({
			modules: ['shim'],
		}),
	],
	watchOptions: {
		aggregateTimeout: 1500,
		ignored: /node_modules/,
	},
};
export default conf;
