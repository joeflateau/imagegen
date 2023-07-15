import { createCanvas, loadImage } from "canvas";
import { expect } from "chai";
import { emptyDir, mkdirp } from "fs-extra";
import { describe, it } from "mocha";
import { drawResizedFromManifest } from "./index";

describe("drawResized", () => {
  it("drawResizedFromManifest", async () => {
    await mkdirp(__dirname + "/../test/out");
    await emptyDir(__dirname + "/../test/out");

    await drawResizedFromManifest(__dirname + "/../test/manifest.json");

    for (const out of ["icon_focus_hd.png", "splash_hd.jpg", "splash_sd.jpg"]) {
      await expectSamples(__dirname + "/../test/out/" + out, {
        topLeft: "255,255,255,255",
        topCenter: "255,255,255,255",
        center: "0,0,0,255",
        bottomRight: "255,255,255,255"
      });
    }
    for (const out of ["icon_focus_sd.png"]) {
      await expectSamples(__dirname + "/../test/out/" + out, {
        topLeft: "0,0,0,255",
        topCenter: "0,0,0,255",
        center: "0,0,0,255",
        bottomRight: "0,0,0,255"
      });
    }
    for (const out of ["splash_fhd.jpg"]) {
      await expectSamples(__dirname + "/../test/out/" + out, {
        topLeft: "255,255,255,255",
        topCenter: "255,255,255,255",
        center: "255,255,255,255",
        bottomRight: "255,255,255,255"
      });
    }
  });
});
async function expectSamples(
  fileName: string,
  spots: {
    topLeft: string;
    topCenter: string;
    center: string;
    bottomRight: string;
  }
) {
  const image = await loadImage(fileName);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  expect(context.getImageData(0, 0, 1, 1).data.join(",")).to.equal(
    spots.topLeft
  );
  expect(
    context.getImageData(Math.floor(image.width / 2), 0, 1, 1).data.join(",")
  ).to.equal(spots.topCenter);
  expect(
    context
      .getImageData(
        Math.floor(image.width / 2),
        Math.floor(image.height / 2),
        1,
        1
      )
      .data.join(",")
  ).to.equal(spots.center);
  expect(
    context.getImageData(image.width - 1, image.height - 1, 1, 1).data.join(",")
  ).to.equal(spots.bottomRight);
}
