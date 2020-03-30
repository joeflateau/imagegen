export function fitRect(
  rect: Rect,
  target: Rect,
  {
    fitMode = "contain",
    insetPct = 0
  }: { fitMode?: FitMode; insetPct?: number } = {}
) {
  const sw = target.width / rect.width;
  const sh = target.height / rect.height;

  let scale = 1;
  if (fitMode == "contain") {
    scale = Math.min(sw, sh);
  } else if (fitMode == "cover") {
    scale = Math.max(sw, sh);
  }

  const inset = Math.min(target.width, target.height) * insetPct;

  return {
    x: target.x + (target.width - rect.width * scale) / 2 + inset,
    y: target.y + (target.height - rect.height * scale) / 2 + inset,
    width: rect.width * scale + inset * 2,
    height: rect.height * scale + inset * 2
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FitMode = "contain" | "cover";
