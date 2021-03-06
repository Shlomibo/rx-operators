import * as ExtractText from 'extract-text-webpack-plugin';
import * as ExtractHtml from 'html-webpack-plugin';
import { resolve } from 'path';
import { Configuration, EnvironmentPlugin } from 'webpack';
import * as confMerge from 'webpack-merge';

const publicPath = resolve(__dirname, 'public');

const baseConf: Configuration = {
	entry: [
		'./app.ts',
	],
	context: __dirname,
	output: {
		filename: 'app.js',
		path: resolve(__dirname, 'public'),
		publicPath: './',
	},
	resolve: {
		extensions: [
			'.ts',
			'.tsx',
			'.js',
			'.jsx',
		],
		modules: [
			'node_modules',
		],
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: [
					{ loader: 'html-loader' },
				],
			},
			{
				test: /\.less$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: [
						'css-loader',
						'less-loader',
					],
				}),
			},
			{
				test: /\.css$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: [
						'css-loader',
					],
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
		new ExtractText({
			filename: 'style.css',
		}),
		new ExtractHtml({
			title: 'RX operators',
			template: './index.html',
		}),
		new EnvironmentPlugin({
			NODE_ENV: 'development',
			DEBUG: true,
		}),
	],
};
export default function(env: string, argv: string[]) {
	env = env || 'development';
	// tslint:disable-next-line:no-var-requires
	const envConf = require(`./config/${env}.webpack.config`);

	return confMerge(baseConf, envConf);
}
