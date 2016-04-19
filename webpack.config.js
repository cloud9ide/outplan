module.exports = {
    entry: "./lib/outplan.js",
    output: {
        path: __dirname,
        filename: "dist/outplan.js",
        libraryTarget: "umd",
    },
    externals: {
        "crypto": {},
        "sha1": "sha1",
        "bignumber.js": "bignumber.js",
        "planout/es6/interpreter.js": "bignumber.js",
    },
    module: {
        loaders: [
            {
                loader: "babel-loader",
                test: /planout/,
                exclude: /planout\/node_modules/,
                query: {
                    presets: ["es2015"],
                    // Maintain compatibility with imports in planout (stackoverflow.com/questions/33505992/babel-6-changes-how-it-exports-default)
                    plugins: ["add-module-exports"],
                }
            }
        ]
    }
};