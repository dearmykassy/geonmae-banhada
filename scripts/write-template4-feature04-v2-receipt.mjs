import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGN = "geonma-template4-mirror-selfie-v1";
const CAMPAIGN_ROOT = `artifacts/image-campaign/${CAMPAIGN}`;
const RECEIPT_ROOT = `${CAMPAIGN_ROOT}/receipts/nonregional`;
const JOB_ID = "gmb-t4-feature-04-v2";
const REJECTED_JOB_ID = "gmb-t4-feature-04-v1";
const SOURCE_GENERATED_PATH = "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-9277f9e2-bf84-4b2d-b266-66ad72a75916.png";
const ORIGINAL_PATH = `${CAMPAIGN_ROOT}/generated-originals/nonregional/${JOB_ID}.png`;
const ACTIVE_PATH = "public/images/geonmae-template4/home/feature-04.webp";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function identify(absolutePath) {
  const result = execFileSync("magick", ["identify", "-format", "%w\t%h\t%m\t%[channels]", absolutePath], { encoding: "utf8" });
  const [width, height, format, channels] = result.trim().split("\t");
  return { width: Number(width), height: Number(height), format, channels };
}

await mkdir(path.join(PROJECT_ROOT, RECEIPT_ROOT), { recursive: true });
const job = JSON.parse(await readFile(path.join(PROJECT_ROOT, CAMPAIGN_ROOT, "jobs/replacement", `${JOB_ID}.job.json`), "utf8"));
const promptBytes = await readFile(path.join(PROJECT_ROOT, job.promptFile));
if (sha256(promptBytes) !== job.promptSha256) {
  throw new Error(`PROMPT_SHA_MISMATCH:${JOB_ID}`);
}

const originalAbsolutePath = path.join(PROJECT_ROOT, ORIGINAL_PATH);
const activeAbsolutePath = path.join(PROJECT_ROOT, ACTIVE_PATH);
const originalBytes = await readFile(originalAbsolutePath);
const activeBytes = await readFile(activeAbsolutePath);
const originalStat = await stat(originalAbsolutePath);

const receipt = {
  schemaVersion: "geonma-template4-image-receipt/v1",
  campaign: CAMPAIGN,
  jobId: JOB_ID,
  jobClass: "replacement",
  replacesJobId: REJECTED_JOB_ID,
  generationMode: "built-in image_gen; exactly one call for this replacement asset",
  promptFile: job.promptFile,
  promptSha256: job.promptSha256,
  sourceGeneratedPath: SOURCE_GENERATED_PATH,
  retainedOriginal: {
    path: ORIGINAL_PATH,
    sha256: sha256(originalBytes),
    bytes: originalBytes.length,
    ...identify(originalAbsolutePath),
    capturedAt: originalStat.mtime.toISOString(),
  },
  visualReview: {
    status: "ACCEPTED",
    adultKoreanWoman: true,
    onePersonOnly: true,
    cleanPhysicalMirrorDominant: true,
    completeMirrorOutlineVisible: true,
    allFourMirrorEdgesVisible: true,
    noTextLogoOrWatermark: true,
    noBedBathroomOrSexualizedStyling: true,
    reflectionAndAnatomyPass: true,
    sourceOriginalMirrorAreaEstimate: 0.4,
    integratedOutputMirrorAreaEstimate: 0.452,
    note: "The source preserves the complete mirror. The approved 4:3 release crop removes only excess wall margin and raises the visible reflective surface above the 45% contract while preserving all four frame edges.",
  },
  integratedOutput: {
    path: ACTIVE_PATH,
    sha256: sha256(activeBytes),
    bytes: activeBytes.length,
    ...identify(activeAbsolutePath),
    conversion: "Crop 1333x1000+58+70 from the immutable PNG original; lossy WebP quality 86, method 6, metadata stripped",
  },
};

await writeFile(
  path.join(PROJECT_ROOT, RECEIPT_ROOT, `${JOB_ID}.receipt.json`),
  `${JSON.stringify(receipt, null, 2)}\n`,
  { flag: "wx" },
);

const previousIndex = JSON.parse(await readFile(path.join(PROJECT_ROOT, RECEIPT_ROOT, "index.v1.json"), "utf8"));
const replacementSummary = {
  jobId: receipt.jobId,
  status: receipt.visualReview.status,
  promptSha256: receipt.promptSha256,
  originalSha256: receipt.retainedOriginal.sha256,
  integratedPath: receipt.integratedOutput.path,
  integratedSha256: receipt.integratedOutput.sha256,
  replacesJobId: receipt.replacesJobId,
};
const index = {
  schemaVersion: "geonma-template4-nonregional-receipt-index/v2",
  campaign: CAMPAIGN,
  generationAttempts: previousIndex.generated + 1,
  acceptedAttempts: previousIndex.accepted + 1,
  rejectedAttempts: previousIndex.rejected,
  integratedActiveAssets: previousIndex.integrated + 1,
  replacementRelationships: [{ rejectedJobId: REJECTED_JOB_ID, acceptedReplacementJobId: JOB_ID, activeOutput: ACTIVE_PATH }],
  receipts: [...previousIndex.receipts, replacementSummary],
};

await writeFile(path.join(PROJECT_ROOT, RECEIPT_ROOT, "index.v2.json"), `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify(index, null, 2));
