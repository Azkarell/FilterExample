module.exports = {
    resolve: {
        extensions: [/*'.ts', '.tsx', */'.js']
    },
    entry: './bin/src/main.js',
    output: {
        filename: 'main.js'
    },
    watch: true,
    devtool: 'source-map',
    mode: 'development',
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
};