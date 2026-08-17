import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CAMPAIGN_ROOT = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1";
const RECEIPT_ROOT = `${CAMPAIGN_ROOT}/receipts/regional`;
const QA_REVISION = "regional-visual-qa-2026-08-17-r3-root";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

describe("Template4 regional E/F generation receipts", () => {
  it.each([
    ["E", 53, 65],
    ["F", 66, 78],
  ])("verifies lane %s immutable inputs and retained one-call originals", async (lane, first, last) => {
    const laneSlug = lane.toLowerCase();
    const index = JSON.parse(await readFile(
      path.join(PROJECT_ROOT, RECEIPT_ROOT, `lane-${laneSlug}.index.v1.json`),
      "utf8",
    ));

    expect(index).toMatchObject({
      lane,
      generated: 13,
      pending: 13,
      rejected: 0,
      approved: 0,
      released: 0,
      qaPolicyRevision: QA_REVISION,
    });
    expect(index.receipts).toHaveLength(13);
    expect(index.receipts.map((entry) => entry.jobId)).toEqual(
      Array.from({ length: last - first + 1 }, (_, offset) =>
        `gmb-t4-rgn-${String(first + offset).padStart(3, "0")}-v1`),
    );

    for (const summary of index.receipts) {
      const receiptBytes = await readFile(path.join(PROJECT_ROOT, summary.receiptFile));
      const receipt = JSON.parse(receiptBytes.toString("utf8"));
      const jobBytes = await readFile(path.join(PROJECT_ROOT, receipt.immutableInputs.jobFile));
      const promptBytes = await readFile(path.join(PROJECT_ROOT, receipt.immutableInputs.promptFile));
      const outputBytes = await readFile(path.join(PROJECT_ROOT, receipt.retainedOriginal.path));
      const sourceBytes = await readFile(receipt.sourceGeneratedPath);
      const job = JSON.parse(jobBytes.toString("utf8"));

      expect(receipt).toMatchObject({
        jobId: summary.jobId,
        lane,
        illumination: "softly-dark",
        generationMode: "built-in image_gen; exactly one call for this asset; immutable prompt used verbatim",
        qaPolicyRevision: {
          revisionId: QA_REVISION,
          authority: "root",
          minimumVisibleMirrorArea: 0.2,
          actualReflectionRequired: true,
          mobileCentralCropMustRetainFacePhoneAndMirror: true,
        },
        visualReview: {
          status: "PENDING",
          adultKoreanWoman: true,
          actualReflectionClear: true,
          mobileCentralCropRetainsFacePhoneAndMirror: true,
          visibleMirrorAreaMeetsRevisedThreshold: true,
          visibleFrameEdgesAtLeast2OrFullOutline: true,
          noTextLogoOrWatermark: true,
          noBedBathroomOrSexualizedStyling: true,
          reflectionAndAnatomyPass: true,
        },
        approvalStatus: "NOT_APPROVED",
        releaseStatus: "NOT_RELEASED",
        integratedOutput: null,
      });
      expect(receipt.visualReview.visibleMirrorAreaEstimate).toBeGreaterThanOrEqual(0.2);
      expect(sha256(jobBytes)).toBe(receipt.immutableInputs.jobSha256);
      expect(sha256(promptBytes)).toBe(job.promptSha256);
      expect(sha256(promptBytes)).toBe(receipt.immutableInputs.promptSha256);
      expect(job.prompt).toBe(promptBytes.toString("utf8").trimEnd());
      expect(job.outputFile).toBe(receipt.retainedOriginal.path);
      expect(sha256(outputBytes)).toBe(receipt.retainedOriginal.sha256);
      expect(sha256(sourceBytes)).toBe(receipt.retainedOriginal.sha256);
      expect(receipt.retainedOriginal).toMatchObject({
        width: 1672,
        height: 941,
        format: "PNG",
      });
    }
  });
});
