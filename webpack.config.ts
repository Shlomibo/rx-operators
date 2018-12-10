import * as ExtractCSS from 'mini-css-extract-plugin';
import { resolve } from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import * as confMerge from 'webpack-merge';

// tslint:disable-next-line:variable-name no-var-requires
const ExtractHtml: any = require('html-webpack-plugin');
const publicPath = resolve(__dirname, 'public');

const baseConf: Configuration = {
	entry: [ './app.ts' ],
	context: resolve(__dirname, 'src'),
	output: {
		filename: 'app.js',
		path: resolve(__dirname, 'public'),
		publicPath: './',
	},
	resolve: {
		extensions: [ '.ts', '.tsx', '.js', '.jsx' ],
		modules: [ 'node_modules' ],
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [ { loader: 'html-loader' } ],
			},
			{
				test: /\.less$/,
				use: [
					ExtractCSS.loader,
					{ loader: 'css-loader' },
					{ loader: 'less-loader' },
				],
			},
			{
				test: /\.css$/,
				use: [ ExtractCSS.loader, { loader: 'css-loader' } ],
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
				test: /\.ts$/,
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
	plugins: [
		new ExtractCSS({
			filename: 'style.css',
		}),
		new ExtractHtml({
			title: 'RX operators',
			template: '../index.html',
		}),
		new EnvironmentPlugin({
			NODE_ENV: 'development',
			DEBUG: true,
		}),
	],
};
export default (env: string, argv: string[]) => {
	env = env || 'development';
	// tslint:disable-next-line:no-var-requires
	const envConf = require(`./config/${env}.webpack.config`);

	return confMerge(baseConf, envConf);
};
