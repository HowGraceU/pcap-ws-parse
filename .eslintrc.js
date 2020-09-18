module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true
	},
	extends: [
		'airbnb-base',
		"plugin:@typescript-eslint/recommended",
		'plugin:import/typescript'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: [
		'@typescript-eslint'
	],
	rules: {
		'max-len': 0,
		'no-bitwise': 0,
		"linebreak-style": [0, "error", "windows"],
		"import/extensions": [
			"error",
			"ignorePackages",
			{
				"js": "never",
				"jsx": "never",
				"ts": "never",
				"tsx": "never"
			}
		]
	}
};
