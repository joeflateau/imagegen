#!/usr/bin/env node

import { readFile, writeFile, mkdirp } from "fs-extra";
import { join as joinPath, parse as parsePath } from "path";
import { createCanvas, loadImage } from "canvas";
import program from "commander";

import { fitRect, FitMode } from "./lib/fitRect";
import { Manifest } from "./lib/manifest";
import { toBuffer } from "./lib/toBuffer";
import { flattenRecords } from "./lib/flattenRecords";

export async function drawResizedFromManifest(manifestFilePath: string) {
  const manifest = JSON.parse(
    await readFile(manifestFilePath, "utf8")
  ) as Manifest;

  const flattenedSources = flattenRecords(manifest.sources);

  for (const output of manifest.outputs) {
    const canvas = createCanvas(output.width, output.height);

    const flattenedOutputLayers =
      output.layers && flattenRecords(output.layers);

    for (const [layerName] of Object.entries(
      flattenedOutputLayers ?? flattenedSources
    )) {
      if (
        output.layers == null ||
        flattenRecords(output.layers)[layerName] != null
      ) {
        const { insetPct, fitMode } = {
          ...{
            insetPct: 0,
            fitMode: "cover" as FitMode
          },
          ...flattenedSources[layerName],
          ...flattenedOutputLayers?.[layerName]
        };

        const image = await loadImage(
          joinPath(manifestFilePath, "..", flattenedSources[layerName].filename)
        );

        const cover = fitRect(
          {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
          },
          {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
          },
          { fitMode, insetPct }
        );

        canvas
          .getContext("2d")
          .drawImage(image, cover.x, cover.y, cover.width, cover.height);
      }
    }

    const buffer = toBuffer(canvas, parsePath(output.filename).ext);
    await mkdirp(joinPath(manifestFilePath, "..", output.filename, ".."));
    await writeFile(joinPath(manifestFilePath, "..", output.filename), buffer);
  }
}

if (require.main === module) {
  program.arguments("<manifestFilename>").action(async manifestFile => {
    await drawResizedFromManifest(manifestFile);
  });
  program.parse(process.argv);
}
