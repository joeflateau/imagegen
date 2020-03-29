#!/usr/bin/env node

import { readFile, createWriteStream } from "fs-extra";
import { join as joinPath } from "path";
import { createCanvas, loadImage } from "canvas";
import program from "commander";

export async function drawResizedFromManifest(manifestFilePath: string) {
  const manifest = JSON.parse(
    await readFile(manifestFilePath, "utf8")
  ) as Manifest;

  for (const output of manifest.outputs) {
    const canvas = createCanvas(output.size.width, output.size.height);
    if (manifest.sources.background) {
      const image = await loadImage(
        joinPath(manifestFilePath, "..", manifest.sources.background.filename)
      );
      canvas.getContext("2d").drawImage(image);
    }
    if (manifest.sources.icon) {
      const image = await loadImage(
        joinPath(manifestFilePath, manifest.sources.icon.filename)
      );
      canvas.getContext("2d").drawImage(image);
    }
    canvas
      .createPNGStream()
      .pipe(
        createWriteStream(joinPath(manifestFilePath, "..", output.filename))
      );
  }
}

if (require.main === module) {
  program.arguments("<manifestFilename>").action(async manifestFile => {
    await drawResizedFromManifest(manifestFile);
  });
  program.parse(process.argv);
}

export interface Manifest {
  sources: {
    icon?: SourceFile;
    background?: SourceFile;
  };
  outputs: OutputFile[];
}

export interface SourceFile {
  filename: string;
}

export interface OutputFile {
  filename: string;
  size: OutputFileSize;
}

export interface OutputFileSize {
  width: number;
  height: number;
}
