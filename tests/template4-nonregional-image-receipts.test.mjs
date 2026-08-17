import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const RECEIPT_ROOT = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/receipts/nonregional";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

describe("Template4 nonregional generated-image receipts", () => {
  it("preserves the immutable v1 rejection history", async () => {
    const indexV1 = JSON.parse(await readFile(
      path.join(PROJECT_ROOT, RECEIPT_ROOT, "index.v1.json"),
      "utf8",
    ));
    expect(indexV1).toMatchObject({ generated: 18, accepted: 17, rejected: 1, integrated: 17 });
    expect(indexV1.receipts).toHaveLength(18);

    const rejected = indexV1.receipts.filter((receipt) => receipt.status === "REJECTED");
    expect(rejected).toEqual([expect.objectContaining({
      jobId: "gmb-t4-feature-04-v1",
      integratedPath: null,
      integratedSha256: null,
    })]);
  });

  it("records the one-call v2 replacement and verifies all retained and active bytes", async () => {
    const indexV2 = JSON.parse(await readFile(
      path.join(PROJECT_ROOT, RECEIPT_ROOT, "index.v2.json"),
      "utf8",
    ));
    expect(indexV2).toMatchObject({
      generationAttempts: 19,
      acceptedAttempts: 18,
      rejectedAttempts: 1,
      integratedActiveAssets: 18,
    });
    expect(indexV2.receipts).toHaveLength(19);
    expect(indexV2.replacementRelationships).toEqual([{
      rejectedJobId: "gmb-t4-feature-04-v1",
      acceptedReplacementJobId: "gmb-t4-feature-04-v2",
      activeOutput: "public/images/geonmae-template4/home/feature-04.webp",
    }]);

    for (const summary of indexV2.receipts) {
      const receipt = JSON.parse(await readFile(
        path.join(PROJECT_ROOT, RECEIPT_ROOT, `${summary.jobId}.receipt.json`),
        "utf8",
      ));
      const originalBytes = await readFile(path.join(PROJECT_ROOT, receipt.retainedOriginal.path));
      expect(sha256(originalBytes)).toBe(receipt.retainedOriginal.sha256);
      expect(receipt.retainedOriginal.width).toBeGreaterThan(0);
      expect(receipt.retainedOriginal.height).toBeGreaterThan(0);

      if (receipt.integratedOutput) {
        const integratedBytes = await readFile(path.join(PROJECT_ROOT, receipt.integratedOutput.path));
        expect(sha256(integratedBytes)).toBe(receipt.integratedOutput.sha256);
      }
    }

    const replacementReceipt = JSON.parse(await readFile(
      path.join(PROJECT_ROOT, RECEIPT_ROOT, "gmb-t4-feature-04-v2.receipt.json"),
      "utf8",
    ));
    expect(replacementReceipt).toMatchObject({
      jobId: "gmb-t4-feature-04-v2",
      jobClass: "replacement",
      replacesJobId: "gmb-t4-feature-04-v1",
      generationMode: "built-in image_gen; exactly one call for this replacement asset",
      visualReview: {
        status: "ACCEPTED",
        completeMirrorOutlineVisible: true,
        allFourMirrorEdgesVisible: true,
        integratedOutputMirrorAreaEstimate: expect.any(Number),
      },
      integratedOutput: {
        path: "public/images/geonmae-template4/home/feature-04.webp",
        width: 1333,
        height: 1000,
      },
    });
    expect(replacementReceipt.visualReview.integratedOutputMirrorAreaEstimate).toBeGreaterThanOrEqual(0.45);

    const activeBytes = await readFile(path.join(
      PROJECT_ROOT,
      "public/images/geonmae-template4/home/feature-04.webp",
    ));
    expect(sha256(activeBytes)).toBe(replacementReceipt.integratedOutput.sha256);
  });
});
