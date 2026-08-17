import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  calculateFocalCoverExtraction,
  getAssetFocalPoint,
  validateFocalPointDocument,
} from "./lib/template4-regional-focal-crop.mjs";
import {
  getRegionalImageAssetId,
} from "../src/lib/regional-image-assignment.ts";
import {
  ACTIVE_REGION_NODES,
  getDirectChildren,
  getParentNode,
} from "../src/lib/regions.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/campaign.v1.json";
const INVENTORY_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01/inventory.v1.json";
const REVIEW_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01/review.v1.json";
const FOCAL_CONFIG_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const FOCAL_ANALYSIS_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis.v1.json";
const MANIFEST_RELATIVE = "src/data/regional-image-assignments.template4.generated.json";
const RECEIPT_RELATIVE = "artifacts/image-release/geonmae-banhada-template4-regional-release.v1.json";
const PUBLIC_ROOT = "public/assets/geonmae-banhada/template4-regional";
const EXPECTED_ROUTES = 1291;
const EXPECTED_ASSETS = 130;
const PROFILES = {
  desktop: [1600, 900],
  tablet: [1200, 675],
  mobile: [768, 600],
};

function fail(code) {
  throw new Error(`GEONMAE_T4_IMAGE_RELEASE_${code}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function readJson(relativePath, code) {
  const bytes = await readFile(path.join(ROOT, relativePath)).catch(() => fail(`${code}:MISSING`));
  try {
    return { bytes, value: JSON.parse(bytes.toString("utf8")), sha256: sha256(bytes) };
  } catch {
    fail(`${code}:JSON`);
  }
}

function jsonBytes(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

async function writeNewOrExact(relativePath, bytes) {
  const absolutePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  try {
    await writeFile(absolutePath, bytes, { flag: "wx" });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readFile(absolutePath);
    if (!existing.equals(bytes)) fail(`NO_CLOBBER:${relativePath}`);
  }
}

const campaignDoc = await readJson(CAMPAIGN_RELATIVE, "CAMPAIGN");
const inventoryDoc = await readJson(INVENTORY_RELATIVE, "INVENTORY");
const reviewDoc = await readJson(REVIEW_RELATIVE, "REVIEW");
const focalConfigDoc = await readJson(FOCAL_CONFIG_RELATIVE, "FOCAL_CONFIG");
const focalAnalysisDoc = await readJson(FOCAL_ANALYSIS_RELATIVE, "FOCAL_ANALYSIS");
const campaign = campaignDoc.value;
const inventory = inventoryDoc.value;
const review = reviewDoc.value;
const focalAnalysis = focalAnalysisDoc.value;
const regionalJobs = campaign.jobs?.filter((job) => job.jobClass === "regional") ?? [];
const regionalJobIds = regionalJobs.map((job) => job.id);
const focalDocument = validateFocalPointDocument(focalConfigDoc.value, regionalJobIds);

if (
  campaign.schemaVersion !== "geonma-template4-mirror-selfie-campaign/v1" ||
  campaign.platform?.id !== "geonmae-banhada" ||
  regionalJobs.length !== EXPECTED_ASSETS ||
  inventory.schemaVersion !== "geonma-template4-mirror-contact-sheet-inventory/v1" ||
  inventory.status !== "PENDING_ROOT_VISUAL_REVIEW" ||
  inventory.entries?.length !== EXPECTED_ASSETS ||
  review.schemaVersion !== "geonma-template4-mirror-root-review/v1" ||
  review.status !== "ROOT_APPROVED" ||
  review.reviewer !== "root" ||
  review.routeAssignmentAuthorized !== true ||
  review.inventory?.sha256 !== inventoryDoc.sha256 ||
  review.campaignSha256 !== campaignDoc.sha256 ||
  review.focalCropMetadata?.sha256 !== focalConfigDoc.sha256 ||
  review.focalCropMetadata?.analysisSha256 !== focalAnalysisDoc.sha256 ||
  review.focalCropMetadata?.contactSheetSha256 !== focalAnalysis.contactSheet?.sha256 ||
  review.assets?.length !== EXPECTED_ASSETS ||
  focalAnalysis.schemaVersion !== "geonmae-banhada-template4-regional-focal-analysis/v1" ||
  focalAnalysis.status !== "READY_FOR_ROOT_VISUAL_REVIEW" ||
  focalAnalysis.platformKey !== "geonmae-banhada" ||
  focalAnalysis.rootApprovalGranted !== false ||
  focalAnalysis.releasePerformed !== false ||
  focalAnalysis.focalMetadata?.sha256 !== focalConfigDoc.sha256 ||
  focalAnalysis.inventory?.sha256 !== inventoryDoc.sha256 ||
  focalAnalysis.inspectedAssets !== focalConfigDoc.value.overrides.length ||
  focalAnalysis.entries?.length !== focalConfigDoc.value.overrides.length
) {
  fail("AUTHORITY_CONTRACT");
}

const inventoryById = new Map(inventory.entries.map((entry) => [entry.jobId, entry]));
const reviewById = new Map(review.assets.map((entry) => [entry.jobId, entry]));
const focalAnalysisById = new Map(focalAnalysis.entries.map((entry) => [entry.assetId, entry]));
for (const [assetId, focalPoint] of focalDocument.overrides) {
  const analysisEntry = focalAnalysisById.get(assetId);
  const inventoryEntry = inventoryById.get(assetId);
  if (
    !analysisEntry ||
    !inventoryEntry ||
    analysisEntry.decision !== "FEASIBLE_WITH_FOCAL_CROP" ||
    analysisEntry.rootApproval !== false ||
    analysisEntry.source?.sha256 !== inventoryEntry.sha256 ||
    analysisEntry.focalPoint?.xPermille !== focalPoint.xPermille ||
    analysisEntry.focalPoint?.yPermille !== focalPoint.yPermille ||
    analysisEntry.observedInSimulation?.adultWomanFaceRetained !== true ||
    analysisEntry.observedInSimulation?.phoneRetained !== true ||
    analysisEntry.observedInSimulation?.physicalMirrorRetained !== true ||
    analysisEntry.observedInSimulation?.passes390x620 !== true ||
    analysisEntry.observedInSimulation?.passes320x620 !== true
  ) {
    fail(`FOCAL_ANALYSIS:${assetId}`);
  }
}
const released = new Map();
for (const job of regionalJobs) {
  const inventoryEntry = inventoryById.get(job.id);
  const reviewEntry = reviewById.get(job.id);
  const circularMirrorReview =
    job.lane === "D" &&
    reviewEntry?.circularMirrorGeometryException === true &&
    reviewEntry?.criteria?.mirrorAreaAtLeast20Percent === null &&
    reviewEntry?.criteria?.mirrorAreaAtLeast30Percent === true &&
    reviewEntry?.criteria?.circularOutlineAtLeast75Percent === true;
  const standardMirrorReview =
    job.lane !== "D" &&
    reviewEntry?.circularMirrorGeometryException === false &&
    reviewEntry?.criteria?.mirrorAreaAtLeast20Percent === true;
  if (
    !inventoryEntry ||
    !reviewEntry ||
    reviewEntry.decision !== "ACCEPT" ||
    reviewEntry.sourceSha256 !== inventoryEntry.sha256 ||
    reviewEntry.criteria?.clearPhysicalMirrorReflection !== true ||
    (!standardMirrorReview && !circularMirrorReview) ||
    reviewEntry.criteria?.twoMirrorEdgesOrCompleteOutline !== true ||
    reviewEntry.criteria?.responsiveFocalCropSafe !== true ||
    reviewEntry.criteria?.noForbiddenContent !== true
  ) {
    fail(`VISUAL_REVIEW:${job.id}`);
  }
  const source = await readFile(path.join(ROOT, job.outputFile));
  if (sha256(source) !== inventoryEntry.sha256) fail(`SOURCE_SHA:${job.id}`);
  const focalPoint = getAssetFocalPoint(focalDocument, job.id);
  const outputs = {};
  for (const [profile, [width, height]] of Object.entries(PROFILES)) {
    const relativePath = `${PUBLIC_ROOT}/${job.id}/${profile}.webp`;
    const extraction = profile === "mobile"
      ? calculateFocalCoverExtraction({
          sourceWidth: inventoryEntry.width,
          sourceHeight: inventoryEntry.height,
          targetWidth: width,
          targetHeight: height,
          ...focalPoint,
        })
      : null;
    const pipeline = sharp(source, { failOn: "error" });
    const bytes = await (extraction
      ? pipeline
          .extract({
            left: extraction.left,
            top: extraction.top,
            width: extraction.width,
            height: extraction.height,
          })
          .resize(width, height, { fit: "fill" })
      : pipeline.resize(width, height, { fit: "cover", position: "centre" }))
      .webp({ quality: 86, smartSubsample: true })
      .toBuffer();
    await writeNewOrExact(relativePath, bytes);
    outputs[profile] = {
      publicPath: `/${relativePath.replace(/^public\//u, "")}`,
      sha256: sha256(bytes),
      width,
      height,
      bytes: bytes.length,
      crop: extraction
        ? {
            mode: "asset-focal-cover",
            metadata: FOCAL_CONFIG_RELATIVE,
            focalPoint,
            extraction: {
              left: extraction.left,
              top: extraction.top,
              width: extraction.width,
              height: extraction.height,
            },
          }
        : { mode: "center-cover" },
    };
  }
  const provenanceRelative = `${PUBLIC_ROOT}/${job.id}/provenance.json`;
  const provenance = {
    schemaVersion: "geonmae-banhada-template4-regional-image-provenance/v1",
    platform: "geonmae-banhada",
    assetId: job.id,
    lane: job.lane,
    campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: campaignDoc.sha256 },
    rootReview: { relativePath: REVIEW_RELATIVE, sha256: reviewDoc.sha256 },
    focalCropAnalysis: {
      relativePath: FOCAL_ANALYSIS_RELATIVE,
      sha256: focalAnalysisDoc.sha256,
      rootApprovalGrantedByAnalysis: false,
    },
    source: {
      relativePath: job.outputFile,
      sha256: inventoryEntry.sha256,
      width: inventoryEntry.width,
      height: inventoryEntry.height,
      format: inventoryEntry.format,
    },
    outputs,
  };
  await writeNewOrExact(provenanceRelative, jsonBytes(provenance));
  released.set(job.id, { outputs, provenanceRelative });
}

if (ACTIVE_REGION_NODES.length !== EXPECTED_ROUTES || released.size !== EXPECTED_ASSETS) {
  fail("RELEASE_COUNTS");
}

const usage = new Map([...released.keys()].map((assetId) => [assetId, 0]));
const routes = {};
for (const node of ACTIVE_REGION_NODES) {
  const assetId = getRegionalImageAssetId(node);
  const asset = released.get(assetId);
  if (!asset) fail(`MAPPED_ASSET:${node.path}`);
  usage.set(assetId, (usage.get(assetId) ?? 0) + 1);
  routes[node.path] = {
    assetId,
    sources: Object.fromEntries(Object.entries(asset.outputs).map(([profile, output]) => [profile, output.publicPath])),
    provenance: `/${asset.provenanceRelative.replace(/^public\//u, "")}`,
  };
}

for (const node of ACTIVE_REGION_NODES) {
  const parent = getParentNode(node);
  if (parent && routes[parent.path].assetId === routes[node.path].assetId) {
    fail(`PARENT_CHILD_COLLISION:${node.path}`);
  }
  const childAssets = getDirectChildren(node).map((child) => routes[child.path].assetId);
  if (new Set(childAssets).size !== childAssets.length) fail(`SIBLING_COLLISION:${node.path}`);
}

const counts = [...usage.values()].sort((left, right) => left - right);
const assetsAtNine = counts.filter((count) => count === 9).length;
const assetsAtTen = counts.filter((count) => count === 10).length;
if (assetsAtNine !== 9 || assetsAtTen !== 121 || counts.at(-1) !== 10) {
  fail("REUSE_DISTRIBUTION");
}

const distribution = {
  routes: EXPECTED_ROUTES,
  assets: EXPECTED_ASSETS,
  maxReuse: 10,
  assetsAtTen,
  assetsAtNine,
  parentChildCollisions: 0,
  siblingCollisions: 0,
};
const manifest = {
  schemaVersion: "geonmae-banhada-regional-image-assignments/v1",
  status: "ROOT_APPROVED_RELEASED",
  platformKey: "geonmae-banhada",
  rootReview: { relativePath: REVIEW_RELATIVE, sha256: reviewDoc.sha256, reviewer: "root" },
  derivativeProfiles: Object.fromEntries(Object.entries(PROFILES).map(([name, [width, height]]) => [name, { width, height }])),
  focalCropMetadata: {
    relativePath: FOCAL_CONFIG_RELATIVE,
    sha256: focalConfigDoc.sha256,
    analysisRelativePath: FOCAL_ANALYSIS_RELATIVE,
    analysisSha256: focalAnalysisDoc.sha256,
    overrideAssets: focalDocument.overrides.size,
  },
  distribution,
  routes,
};
const manifestBytes = jsonBytes(manifest);
await writeNewOrExact(MANIFEST_RELATIVE, manifestBytes);

const receipt = {
  schemaVersion: "geonmae-banhada-template4-regional-image-release-receipt/v1",
  status: "ROOT_APPROVED_RELEASED",
  platformKey: "geonmae-banhada",
  assignmentManifest: { relativePath: MANIFEST_RELATIVE, sha256: sha256(manifestBytes) },
  rootReview: { relativePath: REVIEW_RELATIVE, sha256: reviewDoc.sha256, reviewer: "root" },
  focalCropMetadata: {
    relativePath: FOCAL_CONFIG_RELATIVE,
    sha256: focalConfigDoc.sha256,
    analysisRelativePath: FOCAL_ANALYSIS_RELATIVE,
    analysisSha256: focalAnalysisDoc.sha256,
    overrideAssets: focalDocument.overrides.size,
  },
  distribution,
  sourceAssets: regionalJobs.map((job) => ({
    assetId: job.id,
    sourceSha256: inventoryById.get(job.id).sha256,
    provenance: released.get(job.id).provenanceRelative,
  })),
};
await writeNewOrExact(RECEIPT_RELATIVE, jsonBytes(receipt));
console.log(JSON.stringify({ status: receipt.status, routes: EXPECTED_ROUTES, assets: EXPECTED_ASSETS, webps: 390 }));
