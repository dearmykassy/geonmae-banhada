import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/ssm/Documents/Codex/geonmae-banhada";
const CAMPAIGN = "geonma-template4-mirror-selfie-v1";
const CAMPAIGN_ROOT = path.join(PROJECT_ROOT, "artifacts/image-campaign", CAMPAIGN);
const GENERATED_ROOT =
  "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5";

const sourceFileNames = {
  "105": "exec-b5021df5-9979-4f89-bd62-0f69b2de8918.png",
  "106": "exec-b5347891-cb9a-4bc7-bf8b-81a131aebf0d.png",
  "107": "exec-f267099b-02b9-49e2-bb7f-3cb6895fd96c.png",
  "108": "exec-12cb7bb2-e065-40a4-8502-cca682bf9537.png",
  "109": "exec-fa5fc30d-d60b-4721-acb6-e75a2e21f490.png",
  "110": "exec-97586580-e4a4-438b-ab3b-bace13142444.png",
  "111": "exec-307dbcae-3e22-41b2-b099-fdb1fb92c0f0.png",
  "112": "exec-a4679725-242d-4e08-84a6-b44e1a472ceb.png",
  "113": "exec-ce4f31f4-4c38-4c68-80e7-18ae205ad05f.png",
  "114": "exec-d8d5d903-2f2e-4813-92ca-8009162d6a06.png",
  "115": "exec-2d193348-4877-4c7c-85ec-0d2709a8a4f2.png",
  "116": "exec-5afb2d7f-afc8-4226-9195-22be1ee3188f.png",
  "117": "exec-9282ebac-f29b-4b64-b0a4-f4d66c05163e.png",
  "118": "exec-53a96ce9-d934-4a29-94ce-47299f4786f7.png",
  "119": "exec-657c018b-c653-4ffb-994a-d4a081b564b3.png",
  "120": "exec-292938c2-a489-453e-8fba-32964121e4f0.png",
  "121": "exec-8ae715f8-0fc4-4b03-8f06-7e9d2e12c00c.png",
  "122": "exec-ee38df95-8ffa-4936-9f6c-555bf14508f4.png",
  "123": "exec-4afa3c76-d23f-413d-871d-ed7650b78c0a.png",
  "124": "exec-f76609d1-45d9-4fff-9064-6cafc2655de7.png",
  "125": "exec-031f8673-748b-4eb5-adf1-3ee33fcbbc04.png",
  "126": "exec-c56e2044-8757-45e6-a5d2-52ba37339d4a.png",
  "127": "exec-7a1171ef-8459-4fa5-9b53-8b5a3e5eda01.png",
  "128": "exec-21293cd6-9021-46c1-bfc5-513776c5fa33.png",
  "129": "exec-d7836bef-e78f-4feb-a260-cf006e7210d0.png",
  "130": "exec-8a48bb9c-492d-4245-a6ca-1a42013f6787.png",
};

const rejectionReasons = {
  "107":
    "The 390:620 centered mobile cover crop removes the smartphone and clips a substantial portion of the face.",
  "109":
    "The 390:620 centered mobile cover crop removes the face and smartphone; only part of the reflected body remains.",
  "112":
    "The 390:620 centered mobile cover crop removes the smartphone and clips roughly half of the face.",
  "113":
    "The 390:620 centered mobile cover crop removes the face and smartphone; the reflected subject is outside the safe center.",
  "121":
    "The 390:620 centered mobile cover crop removes the smartphone and clips a substantial portion of the face.",
  "127":
    "The 390:620 centered mobile cover crop removes the smartphone and clips roughly half of the face.",
};

const QA_REVISION = "regional-visual-qa-2026-08-17-r4";
const QA_ADDENDUM =
  "Review the immutable generated output using the final I/J regional standard: reflective mirror area >=20%; the mirror is unmistakable; at least two frame edges or a complete/clear outline are visible; the real reflection is clear; face, phone, and mirror survive a centered mobile cover crop; and no forbidden content, anatomy, or reflection defect is present.";

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

const summaries = { I: [], J: [] };

for (let numericId = 105; numericId <= 130; numericId += 1) {
  const number = String(numericId).padStart(3, "0");
  const lane = numericId <= 117 ? "I" : "J";
  const laneSlug = lane.toLowerCase();
  const jobId = `gmb-t4-rgn-${number}-v1`;
  const sourceAbsolute = path.join(GENERATED_ROOT, sourceFileNames[number]);
  const jobAbsolute = path.join(CAMPAIGN_ROOT, `jobs/regional/${jobId}.job.json`);
  const promptAbsolute = path.join(CAMPAIGN_ROOT, `prompts/regional/${jobId}.txt`);
  const originalAbsolute = path.join(
    PROJECT_ROOT,
    `public/images/geonma-template4/regional-originals/lane-${laneSlug}/${jobId}.png`,
  );
  const receiptAbsolute = path.join(
    CAMPAIGN_ROOT,
    `receipts/regional/lane-${laneSlug}/${jobId}.receipt.json`,
  );

  for (const required of [jobAbsolute, promptAbsolute, originalAbsolute, sourceAbsolute]) {
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
  const sourceBuffer = fs.readFileSync(sourceAbsolute);
  const dimensions = readPngDimensions(originalBuffer);
  const outputSha256 = sha256(originalBuffer);

  if (job.id !== jobId || job.lane !== lane || job.outputFile !== relative(originalAbsolute)) {
    throw new Error(`Job/output contract mismatch for ${jobId}`);
  }
  if (sha256(promptBuffer) !== job.promptSha256) {
    throw new Error(`Prompt SHA mismatch for ${jobId}`);
  }
  if (outputSha256 !== sha256(sourceBuffer)) {
    throw new Error(`Retained output differs from generated source for ${jobId}`);
  }
  if (dimensions.width !== 1672 || ![940, 941].includes(dimensions.height)) {
    throw new Error(`Unexpected dimensions for ${jobId}: ${dimensions.width}x${dimensions.height}`);
  }

  const rejected = Object.hasOwn(rejectionReasons, number);
  const receipt = {
    schemaVersion: "geonma-template4-regional-image-receipt/v1",
    campaign: CAMPAIGN,
    jobId,
    jobClass: "regional",
    lane,
    laneOrdinal: job.laneOrdinal,
    generationMode: "built-in image_gen; exactly one call for this asset; immutable prompt used verbatim",
    immutableInputs: {
      jobFile: relative(jobAbsolute),
      jobSha256: sha256(jobBuffer),
      promptFile: relative(promptAbsolute),
      promptSha256: sha256(promptBuffer),
      originalPromptPreservedAfterGeneration: true,
    },
    sourceGeneratedPath: sourceAbsolute,
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
      originalGenerationPromptIsImmutable: true,
      qaPromptAddendum: QA_ADDENDUM,
      minimumVisibleMirrorArea: 0.2,
      actualReflectionRequired: true,
      mobileCentralCropMustRetainFacePhoneAndMirror: true,
      forbiddenElementsAndAnatomyDefectsCauseRejection: true,
      frameRequirement: "at least two visible frame edges or a complete/clear outline",
      circularMirrorGeometryException: null,
      mobileQaReference: {
        centeredCoverCropViewport: "390:620",
        sourceCropWidthFormula: "round(sourceHeight * 390 / 620)",
        backgroundPosition: "center top",
      },
    },
    visualReview: {
      status: rejected ? "REJECT" : "PENDING",
      reviewerScope: "lane agent visual QA only; not root approval",
      adultKoreanWoman: true,
      onePersonOnly: true,
      centralSubjectAndPhoneCropSafe: !rejected,
      mobileCentralCropRetainsFacePhoneAndMirror: !rejected,
      actualReflectionClear: true,
      cleanPhysicalMirrorDominant: true,
      visibleMirrorAreaMeetsRevisedThreshold: true,
      visibleFrameEdgesAtLeast2OrFullOutline: true,
      noTextLogoOrWatermark: true,
      noBedBathroomOrSexualizedStyling: true,
      noDuplicateOrImpossibleReflection: true,
      reflectionAndAnatomyPass: true,
      rejectionReason: rejected ? rejectionReasons[number] : null,
      pendingReason: rejected
        ? null
        : "Meets the final I/J visual checks; retained as PENDING for independent root review and approval.",
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

for (const lane of ["I", "J"]) {
  const laneSlug = lane.toLowerCase();
  const indexAbsolute = path.join(
    CAMPAIGN_ROOT,
    `receipts/regional/lane-${laneSlug}.index.v1.json`,
  );
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

console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(summaries).map(([lane, receipts]) => [
        `lane${lane}`,
        {
          generated: receipts.length,
          pending: receipts.filter((item) => item.status === "PENDING").length,
          rejected: receipts.filter((item) => item.status === "REJECT").length,
          rejectedIds: receipts
            .filter((item) => item.status === "REJECT")
            .map((item) => item.jobId),
        },
      ]),
    ),
    null,
    2,
  ),
);
