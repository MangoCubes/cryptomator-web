module.exports = {
	resolve: {
		fallback: {
			util: require.resolve("util"),
			stream: require.resolve("stream-browserify")
		},
	},
};