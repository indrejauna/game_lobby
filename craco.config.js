const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    "crypto": require.resolve("crypto-browserify"),
                    "stream": require.resolve("stream-browserify"),
                    "assert": require.resolve("assert/"),
                    "http": require.resolve("stream-http"),
                    "https": require.resolve("https-browserify"),
                    "zlib": require.resolve("browserify-zlib"),
                    "url": require.resolve("url/"),
                    "buffer": require.resolve("buffer/"),
                }
            },
            plugins: [
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                    Buffer: ['buffer', 'Buffer'],
                }),
            ],
        },
    },
};