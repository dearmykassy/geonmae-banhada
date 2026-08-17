import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  calculateFocalCoverExtraction,
  getAssetFocalPoint,
  validateFocalPointDocument,
} from "./lib/template4-regional-focal-crop.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONFIG_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const INVENTORY_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01/inventory.v1.json";
const OUTPUT_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis/contact-sheet-full-390-320.v1.png";
const COLUMNS = 5;
const CELL_WIDTH = 600;
const CELL_HEIGHT = 720;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function labelSvg(width, height, text, fontSize = 20) {
  const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#141414"/><text x="12" y="${Math.round(height * .7)}" fill="#fff" font-size="${fontSize}" font-family="Arial, sans-serif">${escaped}</text></svg>`);
}

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) {
      throw new Error(`GEONMAE_T4_FOCAL_CONTACT_SHEET_NO_CLOBBER:${relativePath}`);
    }
  }
}

const configBytes = await readFile(path.join(ROOT, CONFIG_RELATIVE));
const inventoryBytes = await readFile(path.join(ROOT, INVENTORY_RELATIVE));
const config = JSON.parse(configBytes.toString("utf8"));
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
const inventoryById = new Map(inventory.entries.map((entry) => [entry.jobId, entry]));
const focalDocument = validateFocalPointDocument(config, inventory.entries.map((entry) => entry.jobId));
const ids = config.overrides.map((entry) => entry.assetId);
const composites = [];

for (const [index, assetId] of ids.entries()) {
  const sourceEntry = inventoryById.get(assetId);
  if (!sourceEntry) throw new Error(`GEONMAE_T4_FOCAL_CONTACT_SHEET_SOURCE:${assetId}`);
  const source = await readFile(path.join(ROOT, sourceEntry.sourcePath));
  if (sha256(source) !== sourceEntry.sha256) {
    throw new Error(`GEONMAE_T4_FOCAL_CONTACT_SHEET_SHA:${assetId}`);
  }
  const focalPoint = getAssetFocalPoint(focalDocument, assetId);
  const extraction = calculateFocalCoverExtraction({
    sourceWidth: sourceEntry.width,
    sourceHeight: sourceEntry.height,
    targetWidth: config.derivative.width,
    targetHeight: config.derivative.height,
    ...focalPoint,
  });
  const derivative = await sharp(source, { failOn: "error" })
    .extract({ left: extraction.left, top: extraction.top, width: extraction.width, height: extraction.height })
    .resize(config.derivative.width, config.derivative.height, { fit: "fill" })
    .toBuffer();
  const full = await sharp(source, { failOn: "error" })
    .resize(580, 326, { fit: "contain", background: "#111" })
    .png()
    .toBuffer();
  const consumerPreviews = [];
  for (const consumer of config.consumerCovers) {
    const consumerExtraction = calculateFocalCoverExtraction({
      sourceWidth: config.derivative.width,
      sourceHeight: config.derivative.height,
      targetWidth: consumer.viewportWidth,
      targetHeight: consumer.viewportHeight,
    });
    consumerPreviews.push(await sharp(derivative)
      .extract({
        left: consumerExtraction.left,
        top: consumerExtraction.top,
        width: consumerExtraction.width,
        height: consumerExtraction.height,
      })
      .resize(Math.round(consumer.viewportWidth / 2), Math.round(consumer.viewportHeight / 2), { fit: "fill" })
      .png()
      .toBuffer());
  }

  const column = index % COLUMNS;
  const row = Math.floor(index / COLUMNS);
  const left = column * CELL_WIDTH;
  const top = row * CELL_HEIGHT;
  composites.push(
    { input: labelSvg(CELL_WIDTH, 42, `${assetId}  focal x=${(focalPoint.xPermille / 1000).toFixed(3)}`, 22), left, top },
    { input: full, left: left + 10, top: top + 46 },
    { input: labelSvg(195, 30, "full source", 17), left: left + 10, top: top + 372 },
    { input: labelSvg(195, 30, "390 x 620 final cover", 15), left: left + 215, top: top + 372 },
    { input: labelSvg(160, 30, "320 x 620 final", 15), left: left + 420, top: top + 372 },
    { input: consumerPreviews[0], left: left + 215, top: top + 406 },
    { input: consumerPreviews[1], left: left + 420, top: top + 406 },
  );
}

const rows = Math.ceil(ids.length / COLUMNS);
const bytes = await sharp({
  create: {
    width: COLUMNS * CELL_WIDTH,
    height: rows * CELL_HEIGHT,
    channels: 3,
    background: "#141414",
  },
}).composite(composites).png({ compressionLevel: 9 }).toBuffer();
await writeNewOrExact(OUTPUT_RELATIVE, bytes);
console.log(JSON.stringify({ relativePath: OUTPUT_RELATIVE, sha256: sha256(bytes), assets: ids.length }));
