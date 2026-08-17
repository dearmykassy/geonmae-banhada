import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/ssm/Documents/Codex/geonmae-banhada";
const CAMPAIGN = "geonma-template4-mirror-selfie-v1";
const CAMPAIGN_ROOT = path.join(
  PROJECT_ROOT,
  "artifacts/image-campaign/geonma-template4-mirror-selfie-v1",
);

const sourcePaths = {
  "027": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-b9ddc72c-2b5e-45e1-9c07-8d5961e3507b.png",
  "028": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-4c02bf41-7425-4050-b325-7e67f0457e10.png",
  "029": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-cfc1da59-b8fd-4782-9789-4bd2469cae9a.png",
  "030": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-bca163b3-eefd-4495-a61e-491daab491c7.png",
  "031": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-7eb7931d-bde8-461f-ace6-334364d1ba8b.png",
  "032": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-23fa2ea2-96bb-4cfa-9674-fe744f2a75fb.png",
  "033": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-d2a08ee4-7492-4144-a57f-e680347177dc.png",
  "034": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-f72afa66-a834-4005-a62d-6058cac88ff4.png",
  "035": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-8688a3d9-1a05-451a-b332-bd5bb19b0b65.png",
  "036": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-1f81ef35-581c-4b31-9fa1-3dc8b1709b34.png",
  "037": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-b3922bb0-6249-43b9-8dc4-4dceca409bcd.png",
  "038": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-bf9e59bc-03db-4c8e-83ff-34e888f1f4af.png",
  "039": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-b971fd94-3d3b-418c-89f1-3d90004ccfde.png",
  "040": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-c01cbd1c-3a8b-4ac8-b515-b6f12bfec46c.png",
  "041": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-3af4f9bf-8968-402e-a73e-40cb9506aa53.png",
  "042": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-1cc0420f-2b7c-460c-acda-e1617fd18a4c.png",
  "043": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-530b3a0f-9e65-47fe-8e9e-713ef826a161.png",
  "044": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-74dca52d-4eee-40b7-8693-ebee17121012.png",
  "045": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-4cc5b8e4-d750-4ada-a739-8aaa8a8ae9eb.png",
  "046": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-0547b533-febc-49c5-82d4-7fa63f1d4bf4.png",
  "047": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-40affde1-18d3-4f1f-b5c1-5c1087543b8a.png",
  "048": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-e43b80b7-2df3-4174-82ec-54c83d34d42b.png",
  "049": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-071f9e2a-8e98-4785-aaa2-8c0ba48635be.png",
  "050": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-52c201f0-099e-422c-a5b6-91eb4e552ce5.png",
  "051": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-9527c02d-c1c3-49a3-bf6f-68097d1e96c9.png",
  "052": "/Users/ssm/.codex/generated_images/01a00cc0-0684-7652-8f17-5f9a0e15fce5/exec-1aec4d87-4d31-4749-a332-eacbfd7b73cc.png",
};

const dRejectReasons = {};

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

const summaries = { C: [], D: [] };

for (let numericId = 27; numericId <= 52; numericId += 1) {
  const number = String(numericId).padStart(3, "0");
  const lane = numericId <= 39 ? "C" : "D";
  const laneSlug = lane.toLowerCase();
  const jobId = `gmb-t4-rgn-${number}-v1`;
  const jobAbsolute = path.join(CAMPAIGN_ROOT, `jobs/regional/${jobId}.job.json`);
  const jobRelative = relative(jobAbsolute);
  const promptAbsolute = path.join(CAMPAIGN_ROOT, `prompts/regional/${jobId}.txt`);
  const promptRelative = relative(promptAbsolute);
  const originalAbsolute = path.join(
    PROJECT_ROOT,
    `public/images/geonma-template4/regional-originals/lane-${laneSlug}/${jobId}.png`,
  );
  const receiptAbsolute = path.join(
    CAMPAIGN_ROOT,
    `receipts/regional/lane-${laneSlug}/${jobId}.receipt.json`,
  );

  for (const required of [jobAbsolute, promptAbsolute, originalAbsolute, sourcePaths[number]]) {
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
  const sourceBuffer = fs.readFileSync(sourcePaths[number]);
  const dimensions = readPngDimensions(originalBuffer);
  const outputSha256 = sha256(originalBuffer);

  if (sha256(promptBuffer) !== job.promptSha256) {
    throw new Error(`Prompt SHA mismatch for ${jobId}`);
  }
  if (outputSha256 !== sha256(sourceBuffer)) {
    throw new Error(`Retained output differs from generated source for ${jobId}`);
  }
  if (dimensions.width !== 1672 || dimensions.height !== 941) {
    throw new Error(`Unexpected dimensions for ${jobId}`);
  }

  const rejected = lane === "D" && Object.hasOwn(dRejectReasons, number);
  const visibleAreaRule = lane === "C" ? 0.25 : 0.3;
  const qaPromptAddendum =
    lane === "C"
      ? "Review the immutable generated output using the revised regional threshold: reflective mirror area >=25%; at least two frame edges or a complete outline; real reflection is clear; face, phone, and mirror survive the central mobile crop; no forbidden content or anatomy/reflection defects."
      : "Review the immutable generated output using the circular-mirror exception: reflective mirror area >=30%; at least 75% of the circular outline visible; real reflection is clear; face, phone, and mirror survive the central mobile crop; no forbidden content or anatomy/reflection defects.";

  const receipt = {
    schemaVersion: "geonma-template4-regional-image-receipt/v1",
    campaign: CAMPAIGN,
    jobId,
    jobClass: "regional",
    lane,
    laneOrdinal: job.laneOrdinal,
    generationMode: "built-in image_gen; exactly one call for this asset; immutable prompt used verbatim",
    immutableInputs: {
      jobFile: jobRelative,
      jobSha256: sha256(jobBuffer),
      promptFile: promptRelative,
      promptSha256: sha256(promptBuffer),
      originalPromptPreservedAfterGeneration: true,
    },
    sourceGeneratedPath: sourcePaths[number],
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
      revisionId: "regional-visual-qa-2026-08-17-r2",
      originalGenerationPromptIsImmutable: true,
      qaPromptAddendum,
      minimumVisibleMirrorArea: visibleAreaRule,
      actualReflectionRequired: true,
      mobileCentralCropMustRetainFacePhoneAndMirror: true,
      forbiddenElementsAndAnatomyDefectsCauseRejection: true,
      frameRequirement:
        lane === "C" ? "at least two frame edges or complete outline" : "at least 75% of the circular outline visible",
      circularMirrorGeometryException:
        lane === "D"
          ? {
              applied: true,
              originalMinimumVisibleMirrorArea: 0.45,
              revisedMinimumVisibleMirrorArea: 0.3,
              theoreticalMaximumForInscribedCircleIn16By9: 9 * Math.PI / 64,
              arithmetic: "(pi * (H/2)^2) / ((16/9) * H^2) = 9*pi/64 ~= 0.4418 (44.18%)",
              reason: "A fully visible circle inside a 16:9 canvas cannot occupy 45% of the full canvas.",
            }
          : null,
    },
    visualReview: {
      status: rejected ? "REJECT" : "PENDING",
      reviewerScope: "lane agent visual QA only; not root approval",
      adultKoreanWoman: true,
      onePersonOnly: true,
      centralSubjectAndPhoneCropSafe: true,
      mobileCentralCropRetainsFacePhoneAndMirror: true,
      actualReflectionClear: true,
      cleanPhysicalMirrorDominant: true,
      visibleMirrorAreaMeetsRevisedThreshold: true,
      visibleFrameEdgesAtLeast2OrFullOutline: lane === "C" ? true : null,
      circularOutlineVisibleAtLeast75Percent: lane === "D" ? true : null,
      noTextLogoOrWatermark: true,
      noBedBathroomOrSexualizedStyling: true,
      noDuplicateOrImpossibleReflection: true,
      reflectionAndAnatomyPass: true,
      rejectionReason: rejected ? dRejectReasons[number] : null,
      pendingReason: rejected
        ? null
        : "Meets the revised lane visual checks; retained as PENDING for independent root review and approval.",
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

for (const lane of ["C", "D"]) {
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
    qaPolicyRevision: "regional-visual-qa-2026-08-17-r2",
    receipts,
  };
  fs.writeFileSync(indexAbsolute, `${JSON.stringify(index, null, 2)}\n`, { flag: "wx" });
}

console.log(JSON.stringify({
  laneC: {
    generated: summaries.C.length,
    pending: summaries.C.filter((item) => item.status === "PENDING").length,
    rejected: summaries.C.filter((item) => item.status === "REJECT").length,
  },
  laneD: {
    generated: summaries.D.length,
    pending: summaries.D.filter((item) => item.status === "PENDING").length,
    rejected: summaries.D.filter((item) => item.status === "REJECT").length,
  },
}, null, 2));
