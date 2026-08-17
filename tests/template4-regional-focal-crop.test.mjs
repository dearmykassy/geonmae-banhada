import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  calculateFocalCoverExtraction,
  getAssetFocalPoint,
  validateFocalPointDocument,
} from "../scripts/lib/template4-regional-focal-crop.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONFIG_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const INVENTORY_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01/inventory.v1.json";
const ANALYSIS_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis.v1.json";
const CONTACT_SHEET_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis/contact-sheet-full-390-320.v1.png";

const EXPECTED_OVERRIDES = new Map([
  ...[79, 80, 81, 83, 84, 92, 94, 95, 96, 97, 98, 103, 104, 107, 109, 112, 113]
    .map((number) => [`gmb-t4-rgn-${String(number).padStart(3, "0")}-v1`, 640]),
  ["gmb-t4-rgn-121-v1", 560],
  ["gmb-t4-rgn-127-v1", 590],
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

describe("Template4 regional focal crop contract", () => {
  it("defines only the 19 manually simulated overrides for 390x620 and 320x620", async () => {
    const config = await json(CONFIG_RELATIVE);
    const inventory = await json(INVENTORY_RELATIVE);
    const focalDocument = validateFocalPointDocument(config, inventory.entries.map((entry) => entry.jobId));

    expect(focalDocument.defaultFocalPoint).toEqual({ xPermille: 500, yPermille: 500 });
    expect(focalDocument.overrides.size).toBe(19);
    expect(new Map([...focalDocument.overrides].map(([id, point]) => [id, point.xPermille]))).toEqual(EXPECTED_OVERRIDES);
    expect(config.consumerCovers).toEqual([
      { name: "mobile-390", viewportWidth: 390, viewportHeight: 620, position: "center top" },
      { name: "mobile-320", viewportWidth: 320, viewportHeight: 620, position: "center top" },
    ]);
  });

  it("binds every focal decision to the retained source SHA and exact crop geometry", async () => {
    const config = await json(CONFIG_RELATIVE);
    const inventory = await json(INVENTORY_RELATIVE);
    const analysis = await json(ANALYSIS_RELATIVE);
    const focalDocument = validateFocalPointDocument(config, inventory.entries.map((entry) => entry.jobId));
    const inventoryById = new Map(inventory.entries.map((entry) => [entry.jobId, entry]));

    expect(analysis).toMatchObject({
      schemaVersion: "geonmae-banhada-template4-regional-focal-analysis/v1",
      status: "READY_FOR_ROOT_VISUAL_REVIEW",
      inspectedAssets: 19,
      rootApprovalGranted: false,
      releasePerformed: false,
    });
    expect(analysis.entries).toHaveLength(19);

    for (const entry of analysis.entries) {
      const source = inventoryById.get(entry.assetId);
      const focalPoint = getAssetFocalPoint(focalDocument, entry.assetId);
      const sourceBytes = await readFile(path.join(ROOT, source.sourcePath));
      expect(sha256(sourceBytes)).toBe(source.sha256);
      expect(entry.source.sha256).toBe(source.sha256);
      expect(entry.focalPoint).toEqual(focalPoint);
      expect(entry.mobileDerivativeExtraction).toEqual(calculateFocalCoverExtraction({
        sourceWidth: source.width,
        sourceHeight: source.height,
        targetWidth: 768,
        targetHeight: 600,
        ...focalPoint,
      }));
      expect(entry.simulatedConsumerCovers).toEqual({
        "mobile-390": calculateFocalCoverExtraction({
          sourceWidth: 768,
          sourceHeight: 600,
          targetWidth: 390,
          targetHeight: 620,
        }),
        "mobile-320": calculateFocalCoverExtraction({
          sourceWidth: 768,
          sourceHeight: 600,
          targetWidth: 320,
          targetHeight: 620,
        }),
      });
      expect(entry).toMatchObject({
        decision: "FEASIBLE_WITH_FOCAL_CROP",
        observedInSimulation: {
          adultWomanFaceRetained: true,
          phoneRetained: true,
          physicalMirrorRetained: true,
          passes390x620: true,
          passes320x620: true,
        },
        rootApproval: false,
      });
    }
  });

  it("binds the 19-up full/390/320 contact sheet without granting approval", async () => {
    const analysis = await json(ANALYSIS_RELATIVE);
    const bytes = await readFile(path.join(ROOT, CONTACT_SHEET_RELATIVE));
    const metadata = await sharp(bytes).metadata();
    expect(analysis.contactSheet).toEqual({
      relativePath: CONTACT_SHEET_RELATIVE,
      sha256: sha256(bytes),
    });
    expect(metadata).toMatchObject({ width: 3000, height: 2880, format: "png" });
    expect(analysis.rootApprovalGranted).toBe(false);
    expect(analysis.releasePerformed).toBe(false);
  });

  it("uses the focal-safe contract in root approval and release gates", async () => {
    const [approvalSource, releaseSource] = await Promise.all([
      readFile(path.join(ROOT, "scripts/create-template4-regional-root-review.mjs"), "utf8"),
      readFile(path.join(ROOT, "scripts/release-template4-regional-images.mjs"), "utf8"),
    ]);
    expect(approvalSource).toContain("responsiveFocalCropSafe: true");
    expect(releaseSource).toContain("reviewEntry.criteria?.responsiveFocalCropSafe !== true");
    expect(approvalSource).not.toContain("responsiveCenterCropSafe");
    expect(releaseSource).not.toContain("responsiveCenterCropSafe");
  });
});
