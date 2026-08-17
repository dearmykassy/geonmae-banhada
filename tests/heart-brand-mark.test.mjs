import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BRAND_ROOT = path.join(ROOT, "public/images/geonmae-template4/brand");

describe("heart brand mark", () => {
  it("keeps a transparent source and exact icon derivatives", async () => {
    const source = await sharp(path.join(BRAND_ROOT, "heart-mark-v1.png")).metadata();
    expect(source).toMatchObject({ width: 1254, height: 1254, channels: 4, hasAlpha: true });

    for (const size of [32, 192, 512]) {
      const metadata = await sharp(path.join(BRAND_ROOT, `heart-mark-v1-${size}.png`)).metadata();
      expect(metadata).toMatchObject({ width: size, height: size, channels: 4, hasAlpha: true });
    }
  });

  it("uses the heart mark in the visible brand and browser icon metadata", async () => {
    const [css, layout] = await Promise.all([
      readFile(path.join(ROOT, "src/app/globals.css"), "utf8"),
      readFile(path.join(ROOT, "src/app/layout.tsx"), "utf8"),
    ]);
    expect(css).toContain('/images/geonmae-template4/brand/heart-mark-v1.png');
    expect(layout).toContain('/images/geonmae-template4/brand/heart-mark-v1-32.png');
    expect(layout).toContain('/images/geonmae-template4/brand/heart-mark-v1-192.png');
  });
});
