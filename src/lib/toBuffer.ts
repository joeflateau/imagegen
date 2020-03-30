import { Canvas } from "canvas";

export function toBuffer(canvas: Canvas, ext: string) {
  switch (ext) {
    case ".png":
      return canvas.toBuffer("image/png");
    case ".jpg":
    case ".jpeg":
      return canvas.toBuffer("image/jpeg");
  }
  throw new Error("unknown file extension");
}
