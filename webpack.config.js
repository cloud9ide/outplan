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
                    loader: "babel",
                    test: /planout/,
                    exclude: /planout\/node_modules/,
                    query: {
                        presets: ["es2015"],
                        plugins: ["add-module-exports"],
                    }
                },
                {
                    loader: "babel",
                    test: /outplan\/lib/,
                    query: {
                        presets: ["es2015"],
                        plugins: ["add-module-exports", "transform-flow-strip-types"],
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
                    loader: "babel",
                    test: /planout/,
                    exclude: /planout\/node_modules/,
                    query: {
                        presets: ["es2015"],
                        plugins: ["add-module-exports"],
                    }
                },
                {
                    loader: "babel",
                    test: /outplan\/lib/,
                    query: {
                        presets: ["es2015"],
                        plugins: ["add-module-exports", "transform-flow-strip-types"],
                    }
                }
            ]
        }
    }
];