module.exports = [
    {
        entry: "./lib/outplan.js",
        output: {
            path: __dirname,
            filename: "dist/outplan_full.js",
            libraryTarget: "umd",
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
    },
    {
        entry: "./lib/outplan.js",
        output: {
            path: __dirname,
            filename: "dist/outplan.js",
            libraryTarget: "umd",
        },
        resolve: {
            alias: {
                "sha1": __dirname + "/lib/shims/sha1.js",
                "bignumber.js": __dirname + "/lib/shims/bignumber.js",
            }
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
    }
];