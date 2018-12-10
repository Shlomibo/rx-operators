import { Configuration } from 'webpack';

// tslint:disable-next-line:variable-name no-var-requires
const FaviconPlugin: any = require('favicons-webpack-plugin');
// tslint:disable-next-line:variable-name no-var-requires
const UglifyPlugin: any = require('uglifyjs-webpack-plugin');

const config: Partial<Configuration> = {
	plugins: [
		new UglifyPlugin({
			uglifyOptions: { ecma: 8 },
		}),
		new FaviconPlugin('./favicon.png'),
	],
};
export = config;
