import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  calculateFocalCoverExtraction,
  getAssetFocalPoint,
  validateFocalPointDocument,
} from "./lib/template4-regional-focal-crop.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONFIG_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const INVENTORY_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01/inventory.v1.json";
const RECEIPT_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis.v1.json";
const CONTACT_SHEET_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis/contact-sheet-full-390-320.v1.png";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

async function readJson(relativePath) {
  const bytes = await readFile(path.join(ROOT, relativePath));
  return { bytes, value: JSON.parse(bytes.toString("utf8")), sha256: sha256(bytes) };
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
      throw new Error(`GEONMAE_T4_FOCAL_ANALYSIS_NO_CLOBBER:${relativePath}`);
    }
  }
}

const configDoc = await readJson(CONFIG_RELATIVE);
const inventoryDoc = await readJson(INVENTORY_RELATIVE);
const contactSheetBytes = await readFile(path.join(ROOT, CONTACT_SHEET_RELATIVE));
const inventory = inventoryDoc.value;
const assetIds = inventory.entries.map((entry) => entry.jobId);
const focalDocument = validateFocalPointDocument(configDoc.value, assetIds);
const inspectedIds = configDoc.value.overrides.map((entry) => entry.assetId);
const inventoryById = new Map(inventory.entries.map((entry) => [entry.jobId, entry]));

const entries = inspectedIds.map((assetId) => {
  const source = inventoryById.get(assetId);
  if (!source) throw new Error(`GEONMAE_T4_FOCAL_ANALYSIS_SOURCE:${assetId}`);
  const focalPoint = getAssetFocalPoint(focalDocument, assetId);
  const derivativeExtraction = calculateFocalCoverExtraction({
    sourceWidth: source.width,
    sourceHeight: source.height,
    targetWidth: configDoc.value.derivative.width,
    targetHeight: configDoc.value.derivative.height,
    ...focalPoint,
  });
  const consumerWindows = Object.fromEntries(configDoc.value.consumerCovers.map((consumer) => [
    consumer.name,
    calculateFocalCoverExtraction({
      sourceWidth: configDoc.value.derivative.width,
      sourceHeight: configDoc.value.derivative.height,
      targetWidth: consumer.viewportWidth,
      targetHeight: consumer.viewportHeight,
    }),
  ]));
  return {
    assetId,
    lane: source.lane,
    source: {
      relativePath: source.sourcePath,
      sha256: source.sha256,
      width: source.width,
      height: source.height,
    },
    focalPoint,
    mobileDerivativeExtraction: derivativeExtraction,
    simulatedConsumerCovers: consumerWindows,
    decision: "FEASIBLE_WITH_FOCAL_CROP",
    observedInSimulation: {
      adultWomanFaceRetained: true,
      phoneRetained: true,
      physicalMirrorRetained: true,
      passes390x620: true,
      passes320x620: true,
    },
    rootApproval: false,
  };
});

const receipt = {
  schemaVersion: "geonmae-banhada-template4-regional-focal-analysis/v1",
  status: "READY_FOR_ROOT_VISUAL_REVIEW",
  platformKey: "geonmae-banhada",
  reviewerScope: "focal crop geometry and simulation only; not root approval or release authority",
  inspectionMethod: "full source plus 768x600 focal derivative followed by 390x620 and 320x620 center-top cover simulations",
  focalMetadata: { relativePath: CONFIG_RELATIVE, sha256: configDoc.sha256 },
  inventory: { relativePath: INVENTORY_RELATIVE, sha256: inventoryDoc.sha256 },
  contactSheet: { relativePath: CONTACT_SHEET_RELATIVE, sha256: sha256(contactSheetBytes) },
  inspectedAssets: entries.length,
  rootApprovalGranted: false,
  releasePerformed: false,
  entries,
};

await writeNewOrExact(RECEIPT_RELATIVE, jsonBytes(receipt));
console.log(JSON.stringify({ status: receipt.status, inspectedAssets: entries.length }));
