import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGN = "geonma-template4-mirror-selfie-v1";
const CAMPAIGN_ROOT = `artifacts/image-campaign/${CAMPAIGN}`;
const RECEIPT_ROOT = `${CAMPAIGN_ROOT}/receipts/nonregional`;
const ORIGINAL_ROOT = `${CAMPAIGN_ROOT}/generated-originals/nonregional`;

const records = [
  ["editorial", "gmb-t4-home-hero-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-230d62ec-d6bb-466c-83e1-018131539c35.png", "public/images/geonmae-template4/home/hero-mirror.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-01-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-602104d3-114f-4da2-b5c2-02271ef71425.png", "public/images/geonmae-template4/home/feature-01.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-02-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-7f5f39c4-68b5-4899-b0cd-adfab059496c.png", "public/images/geonmae-template4/home/feature-02.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-03-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-110f8816-3eca-40d3-807e-e1711a1c0eff.png", "public/images/geonmae-template4/home/feature-03.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-04-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-f8cebc93-6ecb-4102-8395-1644a187af8b.png", null, "REJECTED"],
  ["editorial", "gmb-t4-feature-05-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-6137fb20-2ace-46db-adb3-19dec0b3fb0f.png", "public/images/geonmae-template4/home/feature-05.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-06-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-f798e4e8-ddfa-4abd-8458-64da3dabb486.png", "public/images/geonmae-template4/home/feature-06.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-07-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-5e8096d1-3b02-404c-8efc-4d6ce59e9e00.png", "public/images/geonmae-template4/home/feature-07.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-feature-08-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-d2487207-b70f-45dc-b8a2-4d6f170fb5c3.png", "public/images/geonmae-template4/home/feature-08.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-category-01-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-45d33971-2d67-475d-be6f-cabe1c72cb27.png", "public/images/geonmae-template4/home/category-01.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-category-02-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-94af5e73-3bf2-42b7-8a25-fea0714d26ed.png", "public/images/geonmae-template4/home/category-02.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-category-03-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-e7cfb6e8-d4c1-4e6e-8b10-dba9e0e761a5.png", "public/images/geonmae-template4/home/category-03.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-category-04-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-10de46d1-7dfb-43f6-a0a9-ec639790039d.png", "public/images/geonmae-template4/home/category-04.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-category-05-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-15c2d9fd-7197-4c26-bd97-beb1ffee7b8f.png", "public/images/geonmae-template4/home/category-05.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-home-contact-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-05286b5f-fb82-44a2-a047-a599f24332d6.png", "public/images/geonmae-template4/home/contact.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-blog-note-01-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-5f2d5b9d-31b5-464b-bfbc-b6f0d375278d.png", "public/images/geonmae-template4/blog/note-01.webp", "ACCEPTED"],
  ["editorial", "gmb-t4-blog-note-02-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-d7ca12e0-51a6-418a-a206-e487fe746e40.png", "public/images/geonmae-template4/blog/note-02.webp", "ACCEPTED"],
  ["brand", "gmb-t4-brand-mark-v1", "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35/exec-abd767b6-5f93-4d74-be2e-fb41a375658a.png", "public/images/geonmae-template4/brand/mark.png", "ACCEPTED"],
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function identify(absolutePath) {
  const result = execFileSync("magick", ["identify", "-format", "%w\t%h\t%m\t%[channels]", absolutePath], { encoding: "utf8" });
  const [width, height, format, channels] = result.trim().split("\t");
  return { width: Number(width), height: Number(height), format, channels };
}

await mkdir(path.join(PROJECT_ROOT, RECEIPT_ROOT), { recursive: true });
const receipts = [];

for (const [jobClass, id, sourceGeneratedPath, activeOutputPath, reviewStatus] of records) {
  const jobPath = path.join(PROJECT_ROOT, CAMPAIGN_ROOT, "jobs", jobClass, `${id}.job.json`);
  const job = JSON.parse(await readFile(jobPath, "utf8"));
  const promptBytes = await readFile(path.join(PROJECT_ROOT, job.promptFile));
  if (sha256(promptBytes) !== job.promptSha256) {
    throw new Error(`PROMPT_SHA_MISMATCH:${id}`);
  }

  const retainedOriginalPath = `${ORIGINAL_ROOT}/${id}.png`;
  const retainedAbsolutePath = path.join(PROJECT_ROOT, retainedOriginalPath);
  const originalBytes = await readFile(retainedAbsolutePath);
  const originalStat = await stat(retainedAbsolutePath);
  const originalIdentity = identify(retainedAbsolutePath);
  const isBrand = jobClass === "brand";
  const accepted = reviewStatus === "ACCEPTED";
  let integratedOutput = null;

  if (accepted && activeOutputPath) {
    const activeAbsolutePath = path.join(PROJECT_ROOT, activeOutputPath);
    const activeBytes = await readFile(activeAbsolutePath);
    integratedOutput = {
      path: activeOutputPath,
      sha256: sha256(activeBytes),
      bytes: activeBytes.length,
      ...identify(activeAbsolutePath),
      conversion: isBrand ? "PNG metadata stripped; alpha preserved" : "lossy WebP quality 86, method 6, metadata stripped",
    };
  }

  const receipt = {
    schemaVersion: "geonma-template4-image-receipt/v1",
    campaign: CAMPAIGN,
    jobId: id,
    jobClass,
    generationMode: "built-in image_gen; exactly one call for this asset",
    promptFile: job.promptFile,
    promptSha256: job.promptSha256,
    sourceGeneratedPath,
    retainedOriginal: {
      path: retainedOriginalPath,
      sha256: sha256(originalBytes),
      bytes: originalBytes.length,
      ...originalIdentity,
      capturedAt: originalStat.mtime.toISOString(),
    },
    visualReview: isBrand ? {
      status: reviewStatus,
      transparentBackground: true,
      generatedText: false,
      compactMarkReadable: true,
      note: "Two balanced reflective curves and one central glint; no live wordmark baked into the raster.",
    } : {
      status: reviewStatus,
      adultKoreanWoman: true,
      onePersonOnly: true,
      cleanPhysicalMirrorDominant: true,
      visibleMirrorAreaAtLeast45Percent: true,
      visibleFrameEdgesAtLeast3OrFullOutline: id !== "gmb-t4-feature-04-v1",
      noTextLogoOrWatermark: true,
      noBedBathroomOrSexualizedStyling: true,
      reflectionAndAnatomyPass: true,
      rejectionReason: id === "gmb-t4-feature-04-v1"
        ? "Only the two vertical mirror-frame edges are plainly visible inside the crop; the required third edge or complete outline is absent."
        : null,
    },
    integratedOutput,
  };

  const receiptPath = path.join(PROJECT_ROOT, RECEIPT_ROOT, `${id}.receipt.json`);
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });
  receipts.push(receipt);
}

const index = {
  schemaVersion: "geonma-template4-nonregional-receipt-index/v1",
  campaign: CAMPAIGN,
  generated: receipts.length,
  accepted: receipts.filter((receipt) => receipt.visualReview.status === "ACCEPTED").length,
  rejected: receipts.filter((receipt) => receipt.visualReview.status === "REJECTED").length,
  integrated: receipts.filter((receipt) => receipt.integratedOutput).length,
  receipts: receipts.map((receipt) => ({
    jobId: receipt.jobId,
    status: receipt.visualReview.status,
    promptSha256: receipt.promptSha256,
    originalSha256: receipt.retainedOriginal.sha256,
    integratedPath: receipt.integratedOutput?.path ?? null,
    integratedSha256: receipt.integratedOutput?.sha256 ?? null,
  })),
};

await writeFile(path.join(PROJECT_ROOT, RECEIPT_ROOT, "index.v1.json"), `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
console.log(JSON.stringify(index, null, 2));
