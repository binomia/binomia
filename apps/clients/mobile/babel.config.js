module.exports = function (api) {
	api.cache(true);
	return {
		presets: ['babel-preset-expo'],
		plugins: [
			["inline-import", {
				"extensions": [".sql"]
			}],
			["react-native-worklets-core/plugin"],
			['module:react-native-dotenv', {
				moduleName: 'env',
				path: '.env',
			}],
			'react-native-reanimated/plugin'
		]
	};
};
