import { FitMode } from "./fitRect";

export interface Manifest {
  sources: Sources | Sources[];
  outputs: OutputFile[];
}

export interface Sources {
  [key: string]: SourceFile;
}

export interface SourceFile {
  filename: string;
}

export interface DrawOptions {
  insetPct: number;
  fitMode: FitMode;
}

export interface DrawLayers {
  [key: string]: DrawOptions;
}

export interface OutputFile {
  filename: string;
  width: number;
  height: number;
  layers?: DrawLayers | DrawLayers[];
}
