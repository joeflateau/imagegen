import { describe, it } from "mocha";
import { expect } from "chai";
import { drawResizedFromManifest } from "./index";

describe("drawResized", () => {
  it("drawResizedFromManifest", async () => {
    await drawResizedFromManifest(__dirname + "/../test/manifest.json");
  });
});
