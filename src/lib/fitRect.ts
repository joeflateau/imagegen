export function fitRect(
  rect: Rect,
  target: Rect,
  {
    fitMode = "contain",
    insetPct = 0
  }: { fitMode?: FitMode; insetPct?: number } = {}
) {
  const inset = Math.min(target.width, target.height) * insetPct;

  target = {
    x: target.x + inset,
    y: target.y + inset,
    width: target.width - inset * 2,
    height: target.height - inset * 2
  };

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
