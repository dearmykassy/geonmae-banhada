import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/ssm/Documents/Codex/geonmae-banhada";
const CAMPAIGN = "geonma-template4-mirror-selfie-v1";
const CAMPAIGN_ROOT = path.join(PROJECT_ROOT, "artifacts/image-campaign", CAMPAIGN);
const GENERATED_ROOT = "/Users/ssm/.codex/generated_images/01a00cbc-09c0-7441-92ff-bbd40dda9b35";
const QA_REVISION = "regional-visual-qa-2026-08-17-r3-root";

const generatedFiles = {
  "053": "exec-88c86360-d41e-469c-b82d-5ba86673c410.png",
  "054": "exec-38047de5-b948-4ec6-9666-0477d89bc832.png",
  "055": "exec-009cb562-2ede-445b-80d8-2da29616c5a6.png",
  "056": "exec-e22ef0dc-7c5c-44ac-8c67-815991634632.png",
  "057": "exec-64140c6d-7325-43e1-ac44-bbac6f3cb484.png",
  "058": "exec-b0b060c3-b1c5-4124-b410-2ef0f390978c.png",
  "059": "exec-7944a0b2-4fb7-4a0e-84f3-856fcfe1cf9d.png",
  "060": "exec-e62a1212-e8fe-41ad-a46a-c6051cacff51.png",
  "061": "exec-ddcf0837-2cd4-474d-86fc-4b5e7b6dfd45.png",
  "062": "exec-643144d2-6531-4c56-82ac-130c670b0d0c.png",
  "063": "exec-af36c0d6-d580-4207-9692-844109c7e3ff.png",
  "064": "exec-20f7a3e8-7c2d-4dee-a2f1-5d03d7b196ba.png",
  "065": "exec-28d8848f-c4da-4515-91cb-2f2c28ea58e2.png",
  "066": "exec-f3a5f889-79c4-4dcb-9c93-1cd2ea3c4f98.png",
  "067": "exec-5f0d9039-2c68-4f15-a003-7c971f455933.png",
  "068": "exec-8cf7015e-9415-44b8-89c5-69fe4c4a85b2.png",
  "069": "exec-ce098ca6-4d5f-4391-a544-5918520ee138.png",
  "070": "exec-4df14908-a728-45b7-a3e1-39aa3a4dc3d4.png",
  "071": "exec-31679cd9-a1a3-4d18-87fe-3dde1a806461.png",
  "072": "exec-9406164d-1f6e-4a64-8aa5-012f4deb57c8.png",
  "073": "exec-81036a50-5e6d-4f54-8203-7464176d50bb.png",
  "074": "exec-a9f7671b-d020-404e-8fc0-08537b2e8261.png",
  "075": "exec-6aa95374-422e-42a8-9dc9-222bdd80a75d.png",
  "076": "exec-4ab6401a-f4ee-4a38-a4fb-493f0da26cfa.png",
  "077": "exec-eee4a29f-0f63-4523-bad9-6a60c39e7e8f.png",
  "078": "exec-c9dcfd1c-ddc9-4529-9123-100a8ef863f8.png",
};

const mirrorAreaEstimates = {
  "053": 0.39,
  "054": 0.42,
  "055": 0.50,
  "056": 0.38,
  "057": 0.43,
  "058": 0.46,
  "059": 0.39,
  "060": 0.44,
  "061": 0.49,
  "062": 0.50,
  "063": 0.34,
  "064": 0.37,
  "065": 0.58,
  "066": 0.40,
  "067": 0.45,
  "068": 0.54,
  "069": 0.39,
  "070": 0.35,
  "071": 0.51,
  "072": 0.33,
  "073": 0.38,
  "074": 0.48,
  "075": 0.49,
  "076": 0.34,
  "077": 0.44,
  "078": 0.34,
};

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function relative(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join("/");
}

function readPngDimensions(buffer) {
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error("Expected PNG input");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const summaries = { E: [], F: [] };

for (let numericId = 53; numericId <= 78; numericId += 1) {
  const number = String(numericId).padStart(3, "0");
  const lane = numericId <= 65 ? "E" : "F";
  const laneSlug = lane.toLowerCase();
  const jobId = `gmb-t4-rgn-${number}-v1`;
  const jobAbsolute = path.join(CAMPAIGN_ROOT, `jobs/regional/${jobId}.job.json`);
  const promptAbsolute = path.join(CAMPAIGN_ROOT, `prompts/regional/${jobId}.txt`);
  const originalAbsolute = path.join(
    PROJECT_ROOT,
    `public/images/geonma-template4/regional-originals/lane-${laneSlug}/${jobId}.png`,
  );
  const sourceGeneratedPath = path.join(GENERATED_ROOT, generatedFiles[number]);
  const receiptAbsolute = path.join(
    CAMPAIGN_ROOT,
    `receipts/regional/lane-${laneSlug}/${jobId}.receipt.json`,
  );

  for (const required of [jobAbsolute, promptAbsolute, originalAbsolute, sourceGeneratedPath]) {
    if (!fs.existsSync(required)) {
      throw new Error(`Missing required file: ${required}`);
    }
  }
  if (fs.existsSync(receiptAbsolute)) {
    throw new Error(`Refusing to overwrite existing receipt: ${receiptAbsolute}`);
  }

  const jobBuffer = fs.readFileSync(jobAbsolute);
  const job = JSON.parse(jobBuffer.toString("utf8"));
  const promptBuffer = fs.readFileSync(promptAbsolute);
  const originalBuffer = fs.readFileSync(originalAbsolute);
  const sourceBuffer = fs.readFileSync(sourceGeneratedPath);
  const dimensions = readPngDimensions(originalBuffer);
  const outputSha256 = sha256(originalBuffer);

  if (job.id !== jobId || job.lane !== lane || job.outputFile !== relative(originalAbsolute)) {
    throw new Error(`Immutable job contract mismatch for ${jobId}`);
  }
  if (job.illumination !== "softly-dark") {
    throw new Error(`Unexpected illumination contract for ${jobId}`);
  }
  if (sha256(promptBuffer) !== job.promptSha256) {
    throw new Error(`Prompt SHA mismatch for ${jobId}`);
  }
  if (job.prompt !== promptBuffer.toString("utf8").trimEnd()) {
    throw new Error(`Prompt file/job prompt mismatch for ${jobId}`);
  }
  if (outputSha256 !== sha256(sourceBuffer)) {
    throw new Error(`Retained output differs from generated source for ${jobId}`);
  }
  if (dimensions.width !== 1672 || dimensions.height !== 941) {
    throw new Error(`Unexpected dimensions for ${jobId}`);
  }
  if (mirrorAreaEstimates[number] < 0.2) {
    throw new Error(`Visual mirror-area estimate fails revised QA for ${jobId}`);
  }

  const receipt = {
    schemaVersion: "geonma-template4-regional-image-receipt/v1",
    campaign: CAMPAIGN,
    jobId,
    jobClass: "regional",
    lane,
    laneOrdinal: job.laneOrdinal,
    illumination: job.illumination,
    generationMode: "built-in image_gen; exactly one call for this asset; immutable prompt used verbatim",
    immutableInputs: {
      jobFile: relative(jobAbsolute),
      jobSha256: sha256(jobBuffer),
      promptFile: relative(promptAbsolute),
      promptSha256: sha256(promptBuffer),
      originalPromptPreservedAfterGeneration: true,
    },
    sourceGeneratedPath,
    retainedOriginal: {
      path: relative(originalAbsolute),
      sha256: outputSha256,
      bytes: originalBuffer.byteLength,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: `${dimensions.width}:${dimensions.height}`,
      format: "PNG",
    },
    qaPolicyRevision: {
      revisionId: QA_REVISION,
      authority: "root",
      originalGenerationPromptIsImmutable: true,
      supersedesReviewThreshold: 0.25,
      minimumVisibleMirrorArea: 0.2,
      actualReflectionRequired: true,
      mobileCentralCropMustRetainFacePhoneAndMirror: true,
      forbiddenElementsAndAnatomyDefectsCauseRejection: true,
      frameRequirement: "at least two frame edges or a complete/clearly readable outline",
      qaPromptAddendum: "Review the immutable generated output using root's final regional standard: reflective mirror area >=20%; the mirror and real reflection are clear; at least two frame edges or a complete/clearly readable outline; face, phone, and mirror survive the central mobile crop; no forbidden content or anatomy/reflection defects.",
    },
    visualReview: {
      status: "PENDING",
      reviewerScope: "lane agent visual QA only; not root approval",
      adultKoreanWoman: true,
      onePersonOnly: true,
      softlyDarkWithReadableDetail: true,
      centralSubjectAndPhoneCropSafe: true,
      mobileCentralCropRetainsFacePhoneAndMirror: true,
      actualReflectionClear: true,
      cleanPhysicalMirrorClear: true,
      visibleMirrorAreaEstimate: mirrorAreaEstimates[number],
      visibleMirrorAreaMeetsRevisedThreshold: true,
      visibleFrameEdgesAtLeast2OrFullOutline: true,
      noTextLogoOrWatermark: true,
      noBedBathroomOrSexualizedStyling: true,
      noDuplicateOrImpossibleReflection: true,
      reflectionAndAnatomyPass: true,
      rejectionReason: null,
      pendingReason: "Meets root's final revised lane checks; retained as PENDING for independent root review and approval.",
    },
    approvalStatus: "NOT_APPROVED",
    releaseStatus: "NOT_RELEASED",
    integratedOutput: null,
  };

  fs.mkdirSync(path.dirname(receiptAbsolute), { recursive: true });
  fs.writeFileSync(receiptAbsolute, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx" });

  summaries[lane].push({
    jobId,
    status: receipt.visualReview.status,
    receiptFile: relative(receiptAbsolute),
    jobSha256: receipt.immutableInputs.jobSha256,
    promptSha256: receipt.immutableInputs.promptSha256,
    outputPath: receipt.retainedOriginal.path,
    outputSha256,
    width: dimensions.width,
    height: dimensions.height,
  });
}

for (const lane of ["E", "F"]) {
  const laneSlug = lane.toLowerCase();
  const indexAbsolute = path.join(CAMPAIGN_ROOT, `receipts/regional/lane-${laneSlug}.index.v1.json`);
  if (fs.existsSync(indexAbsolute)) {
    throw new Error(`Refusing to overwrite existing index: ${indexAbsolute}`);
  }
  const receipts = summaries[lane];
  const index = {
    schemaVersion: "geonma-template4-regional-lane-receipt-index/v1",
    campaign: CAMPAIGN,
    lane,
    generated: receipts.length,
    pending: receipts.filter((item) => item.status === "PENDING").length,
    rejected: receipts.filter((item) => item.status === "REJECT").length,
    approved: 0,
    released: 0,
    qaPolicyRevision: QA_REVISION,
    receipts,
  };
  fs.writeFileSync(indexAbsolute, `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
}

console.log(JSON.stringify({
  laneE: {
    generated: summaries.E.length,
    pending: summaries.E.filter((item) => item.status === "PENDING").length,
    rejected: summaries.E.filter((item) => item.status === "REJECT").length,
  },
  laneF: {
    generated: summaries.F.length,
    pending: summaries.F.filter((item) => item.status === "PENDING").length,
    rejected: summaries.F.filter((item) => item.status === "REJECT").length,
  },
}, null, 2));
