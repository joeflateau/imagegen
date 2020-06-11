#!/usr/bin/env node

import { readFile, writeFile, mkdirp } from "fs-extra";
import { join as joinPath, parse as parsePath } from "path";
import { createCanvas, loadImage } from "canvas";
import program from "commander";
import { stringFromTemplate } from "var-sub";

import { fitRect, FitMode } from "./lib/fitRect";
import { Manifest } from "./lib/manifest";
import { toBuffer } from "./lib/toBuffer";
import { flattenRecords } from "./lib/flattenRecords";
import sharp from "sharp";

export async function drawResizedFromManifest(
  manifestFilePath: string,
  variables?: Record<string, string>
) {
  const manifest = JSON.parse(
    stringFromTemplate(await readFile(manifestFilePath, "utf8"), {
      ...variables,
    })
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
            fitMode: "cover" as FitMode,
          },
          ...flattenedSources[layerName],
          ...flattenedOutputLayers?.[layerName],
        };

        const image = await loadImage(
          joinPath(manifestFilePath, "..", flattenedSources[layerName].filename)
        );

        const cover = fitRect(
          {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          },
          {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
          },
          { fitMode, insetPct }
        );

        canvas
          .getContext("2d")
          .drawImage(image, cover.x, cover.y, cover.width, cover.height);
      }
    }

    const { ext } = parsePath(output.filename);
    const buffer = toBuffer(canvas, ext);
    await mkdirp(joinPath(manifestFilePath, "..", output.filename, ".."));
    await writeFile(joinPath(manifestFilePath, "..", output.filename), buffer);

    if (output.alpha === false) {
      await writeFile(
        joinPath(manifestFilePath, "..", output.filename),
        await sharp(joinPath(manifestFilePath, "..", output.filename))
          .flatten()
          .toBuffer()
      );
    }
  }
  return manifest;
}

if (require.main === module) {
  program
    .arguments("<manifestFilename>")
    .option(
      "-v,--var <keyValuePair>",
      "variables",
      (variable, prev) => {
        const [key, value] = variable.split("=");
        prev[key] = value;

        return prev;
      },
      {} as Record<string, string>
    )
    .action(async (manifestFile) => {
      try {
        await drawResizedFromManifest(manifestFile, program.var);
      } catch (err) {
        console.error(`${err.name}: ${err.message}`);
        process.exit(1);
      }
    });
  program.parse(process.argv);
}
