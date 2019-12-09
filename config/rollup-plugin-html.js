/**
 * Straight up copied from PROXX (all hail surma/jake/mariko/etc)
 */

import { readFile } from "fs";
import { promisify } from "util";

const readFileAsync = promisify(readFile);

export function findChonksWithExtension(bundle, extension) {
  return Object.values(bundle).filter(desc =>
    (desc.fileName || "").endsWith(extension)
  );
}

async function generateShell(bundle, { templatePath, inlineCss }) {
  const template = await readFileAsync(templatePath, { encoding: "utf8" });

  return template
    .replace(
      /\{\{CSS\}\}/,
      findChonksWithExtension(bundle, ".css")
        .reduce((acc, curr) => inlineCss ?
          `${acc}<style>${curr.source.toString()}</style>\n` :
          `<link rel="stylesheet" type="text/css" href="${curr.fileName}"/>\n`, ""))
    .replace(
      /\{\{JS\}\}/,
      findChonksWithExtension(bundle, ".js")
        .reduce((acc, curr) => `${acc}<script type="module" src="${curr.fileName}"></script>\n`, "")
    )
}

export function html({ templatePath, inlineCss }) {
  if(!templatePath) {
    throw new Error("templatePath is required for 'rollup-plugin-html'");
  }

  return {
    name: "create-html-plugin",
    buildStart() {
      this.addWatchFile(templatePath);
    },
    async generateBundle(options, bundle) {
      bundle["index.html"] = {
        fileName: "index.html",
        isAsset: true,
        source: await generateShell(bundle, {
          templatePath,
          inlineCss
        })
      };
    }
  };
}
