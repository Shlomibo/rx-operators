import * as FaviconPlugin from 'favicons-webpack-plugin';
import * as UglifyPlugin from 'uglifyjs-webpack-plugin';
import { Configuration } from 'webpack';

const config: Partial<Configuration> = {
	plugins: [
		new UglifyPlugin({
			uglifyOptions: { ecma: 8 },
		}),
		new FaviconPlugin('./favicon.png'),
	],
};
export = config;
