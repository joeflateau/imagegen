export function fitRect(rect: Rect, target: Rect, fitMode: FitMode) {
  fitMode = fitMode || "contain";
  const sw = target.width / rect.width;
  const sh = target.height / rect.height;

  let scale = 1;
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

export type FitMode = "contain" | "cover";
