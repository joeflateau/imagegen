#!/usr/bin/env node

import { readFile, writeFile, mkdirp } from "fs-extra";
import { join as joinPath, parse as parsePath } from "path";
import { createCanvas, loadImage, Canvas } from "canvas";
import program from "commander";

export async function drawResizedFromManifest(manifestFilePath: string) {
  const manifest = JSON.parse(
    await readFile(manifestFilePath, "utf8")
  ) as Manifest;

  for (const output of manifest.outputs) {
    const canvas = createCanvas(output.width, output.height);

    for (const [layerName, sourceFile] of Object.entries(manifest.sources)) {
      if (output.layers == null || output.layers[layerName] != null) {
        const { insetPct, fitMode } = {
          ...{ insetPct: 0, fitMode: "cover" },
          ...sourceFile,
          ...output.layers?.[layerName]
        };

        const image = await loadImage(
          joinPath(manifestFilePath, "..", sourceFile.filename)
        );

        const inset = Math.min(canvas.width, canvas.height) * insetPct;

        const cover = fitRect(
          { x: 0, y: 0, width: image.width, height: image.height },
          {
            x: inset,
            y: inset,
            width: canvas.width - inset * 2,
            height: canvas.height - inset * 2
          },
          fitMode
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

function toBuffer(canvas: Canvas, ext: string) {
  switch (ext) {
    case ".png":
      return canvas.toBuffer("image/png");
    case ".jpg":
    case ".jpeg":
      return canvas.toBuffer("image/jpeg");
  }
  throw new Error("unknown file extension");
}

function fitRect(rect: Rect, target: Rect, fitMode: FitMode) {
  fitMode = fitMode || "contain";

  var sw = target.width / rect.width;
  var sh = target.height / rect.height;
  var scale = 1;

  if (fitMode == "contain") {
    scale = Math.min(sw, sh);
  } else if (fitMode == "cover") {
    scale = Math.max(sw, sh);
  }

  return {
    x: target.x + (target.width - rect.width * scale) / 2,
    y: target.y + (target.height - rect.height * scale) / 2,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Manifest {
  sources: Sources;
  outputs: OutputFile[];
}

export interface Sources {
  [key: string]: SourceFile;
}

export interface SourceFile {
  filename: string;
  insetPct: number;
  fitMode: FitMode;
}

export interface OutputFile {
  filename: string;
  width: number;
  height: number;
  layers: { [key in keyof Sources]: { insetPct: number } };
}

export type FitMode = "contain" | "cover";
