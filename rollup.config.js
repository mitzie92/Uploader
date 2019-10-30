import path from "path";
import { readFile } from "fs";
import { promisify } from "util";
import sucrase from "rollup-plugin-sucrase";
import postcss from "rollup-plugin-postcss";
import postcssNesting from "postcss-nesting";
import postcssCustomProperties from "postcss-custom-properties";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-re";
import copy from "rollup-plugin-copy";
import OMT from "@surma/rollup-plugin-off-main-thread";

const localPkg = require("./package.json");

const readFileAsync = promisify(readFile);

const env = {
  TARGET: process.env.TARGET || "",
  API_ENV: process.env.API_ENV,
  NODE_ENV: process.env.NODE_ENV || "production"
};

if (!["electron", "frontend"].includes(env.TARGET)) {
  throw "--environment TARGET={frontend,electron} is required";
}

export default async () => ({
  input: `src/${env.TARGET}/index.ts${env.TARGET === "frontend" ? "x" : ""}`,
  output: {
    sourcemap: env.NODE_ENV !== "production" ? "inline" : true,
    exports: "named",
    dir: path.resolve(__dirname, `dist/${env.TARGET}/`),
    format: "amd"
  },
  treeshake: env.NODE_ENV === "production",
  experimentalOptimizeChunks: env.NODE_ENV === "production",
  watch: {
    clearScreen: false
  },
  plugins: [
    nodeResolve({
      extensions: [".mjs", ".js", ".jsx", ".json", ".ts", ".tsx"]
    }),
    replace({
      replaces: {
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
        "process.env.VERSION": JSON.stringify(localPkg.version),
        "process.env.API_URL":
          env.API_ENV === "production" || env.NODE_ENV === "production"
            ? JSON.stringify("https://api.modwat.ch")
            : JSON.stringify("http://localhost:3001")
      },
      patterns:
        env.NODE_ENV !== "production"
          ? [
              {
                test: /(.*)\s*\/\/\/PROD_ONLY/g,
                replace: "// $1 // removed at build time"
              }
            ]
          : [
              {
                test: /(.*)\s*\/\/\/DEV_ONLY/g,
                replace: "// $1 // removed at build time"
              }
            ]
    }),
    commonjs({
      sourceMap: env.NODE_ENV === "production"
    }),
    env.NODE_ENV !== "production"
      ? sucrase({
          include: ["./src/*/*.ts+(|x)", "./src/**/*.ts+(|x)"],
          exclude: "node_modules/**",
          transforms: ["jsx", "typescript"],
          jsxPragma: "h"
        })
      : require("rollup-plugin-typescript")({
          include: ["./src/*/*.ts+(|x)", "./src/**/*.ts+(|x)"],
          exclude: "node_modules/**",
          tsconfig: `./config/tsconfig.${env.TARGET}.json`,
          typescript: require("typescript"),
          tslib: require("tslib"),
          sourceMap: env.NODE_ENV === "production",
          isolatedModules: env.NODE_ENV === "production",
          target: "es6"
        }),
      OMT({
        loader: (await readFileAsync(
          path.resolve(__dirname, "loadz0r", "loader.min.js"),
          "utf8"
        )).replace(
          /process\.env\.PUBLIC_PATH/g,
          JSON.stringify(`/dist/frontend`)
        ),
        prependLoader: (chunk, workerFiles) =>
          (chunk.isEntry && chunk.fileName.includes("index.js")) ||
          workerFiles.includes(chunk.facadeModuleId)
      })
  ]
    .concat(
      env.TARGET === "frontend"
        ? [
            postcss({
              include: ["./src/frontend/*.css", "./src/frontend/**/*.css"],
              exclude: "node_modules/**",
              sourceMap: env.NODE_ENV === "production",
              modules: {
                scopeBehaviour: "global"
              },
              extract: true,
              plugins: [
                postcssNesting(),
                postcssCustomProperties({
                  importFrom: "./src/frontend/properties.css",
                  preserve: false
                })
              ].concat(
                env.NODE_ENV !== "production" ? [] : [require("cssnano")()]
              )
            }),
            copy({
              targets: [{
                src: "index.html", dest: "dist/frontend",
                src: "images/*", dest: "dist/frontend/images"
              }]
            })
          ]
        : []
    )
    .concat(
      env.NODE_ENV === "production"
        ? [
            require("rollup-plugin-terser").terser({
              ecma: 6,
              compress: true,
              mangle: true,
              toplevel: true,
              sourcemap: true
            }),
            require("rollup-plugin-visualizer")({
              filename: `./node_modules/.visualizer/index.html`,
              title: `Modwatch Dependency Graph`,
              bundlesRelative: true,
              template: "treemap"
            })
          ]
        : []
    )
});
