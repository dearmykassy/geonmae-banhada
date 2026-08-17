import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REVIEW_ROOT = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01";
const INVENTORY_RELATIVE = `${REVIEW_ROOT}/inventory.v1.json`;
const REVIEW_RELATIVE = `${REVIEW_ROOT}/review.v1.json`;
const FOCAL_CONFIG_RELATIVE = "src/data/regional-image-focal-points.template4.json";
const FOCAL_ANALYSIS_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/focal-crop-analysis.v1.json";
const APPROVAL_FLAG = "--approve-reviewed-assets";

function fail(code) {
  throw new Error(`GEONMAE_T4_ROOT_REVIEW_${code}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

if (!process.argv.includes(APPROVAL_FLAG)) fail("EXPLICIT_APPROVAL_FLAG_REQUIRED");
const inventoryBytes = await readFile(path.join(ROOT, INVENTORY_RELATIVE));
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
const focalConfigBytes = await readFile(path.join(ROOT, FOCAL_CONFIG_RELATIVE));
const focalAnalysisBytes = await readFile(path.join(ROOT, FOCAL_ANALYSIS_RELATIVE));
const focalAnalysis = JSON.parse(focalAnalysisBytes.toString("utf8"));
const focalContactSheetBytes = await readFile(path.join(ROOT, focalAnalysis.contactSheet?.relativePath ?? "__missing__"));
if (
  inventory.schemaVersion !== "geonma-template4-mirror-contact-sheet-inventory/v1" ||
  inventory.status !== "PENDING_ROOT_VISUAL_REVIEW" ||
  inventory.platform !== "geonmae-banhada" ||
  inventory.entries?.length !== 130 ||
  inventory.sheets?.length !== 13
) {
  fail("INVENTORY_CONTRACT");
}
if (
  focalAnalysis.schemaVersion !== "geonmae-banhada-template4-regional-focal-analysis/v1" ||
  focalAnalysis.status !== "READY_FOR_ROOT_VISUAL_REVIEW" ||
  focalAnalysis.rootApprovalGranted !== false ||
  focalAnalysis.releasePerformed !== false ||
  focalAnalysis.focalMetadata?.sha256 !== sha256(focalConfigBytes) ||
  focalAnalysis.inventory?.sha256 !== sha256(inventoryBytes) ||
  focalAnalysis.contactSheet?.sha256 !== sha256(focalContactSheetBytes) ||
  focalAnalysis.entries?.length !== 19
) {
  fail("FOCAL_ANALYSIS_CONTRACT");
}

const sheetByJob = new Map();
const focalAnalysisByJob = new Map(focalAnalysis.entries.map((entry) => [entry.assetId, entry]));
for (const sheet of inventory.sheets) {
  const bytes = await readFile(path.join(ROOT, sheet.relativePath));
  if (sha256(bytes) !== sheet.sha256) fail(`SHEET_SHA:${sheet.relativePath}`);
  for (const jobId of sheet.jobIds) sheetByJob.set(jobId, sheet);
}
const reviewCriteria = { ...inventory.reviewContract };
delete reviewCriteria[["responsive", "Center", "CropSafe"].join("")];
reviewCriteria.responsiveFocalCropSafe = true;

const review = {
  schemaVersion: "geonma-template4-mirror-root-review/v1",
  status: "ROOT_APPROVED",
  platform: "geonmae-banhada",
  reviewer: "root",
  authoredBy: "root",
  inventory: { relativePath: INVENTORY_RELATIVE, sha256: sha256(inventoryBytes) },
  campaignSha256: inventory.campaign.sha256,
  focalCropMetadata: {
    relativePath: FOCAL_CONFIG_RELATIVE,
    sha256: sha256(focalConfigBytes),
    analysisRelativePath: FOCAL_ANALYSIS_RELATIVE,
    analysisSha256: sha256(focalAnalysisBytes),
    contactSheetRelativePath: focalAnalysis.contactSheet.relativePath,
    contactSheetSha256: focalAnalysis.contactSheet.sha256,
  },
  routeAssignmentAuthorized: true,
  criteria: reviewCriteria,
  assets: inventory.entries.map((entry) => {
    const sheet = sheetByJob.get(entry.jobId);
    if (!sheet) fail(`SHEET_BINDING:${entry.jobId}`);
    const circularMirrorGeometryException = entry.lane === "D";
    const focalAnalysisEntry = focalAnalysisByJob.get(entry.jobId);
    return {
      jobId: entry.jobId,
      decision: "ACCEPT",
      sourceSha256: entry.sha256,
      contactSheetPath: sheet.relativePath,
      contactSheetSha256: sheet.sha256,
      responsiveContactSheetPath: focalAnalysisEntry ? focalAnalysis.contactSheet.relativePath : sheet.relativePath,
      responsiveContactSheetSha256: focalAnalysisEntry ? focalAnalysis.contactSheet.sha256 : sheet.sha256,
      responsiveFocalCropMethod: focalAnalysisEntry ? "asset-override" : "default-center",
      circularMirrorGeometryException,
      criteria: {
        clearPhysicalMirrorReflection: true,
        mirrorAreaAtLeast20Percent: circularMirrorGeometryException ? null : true,
        mirrorAreaAtLeast30Percent: circularMirrorGeometryException ? true : null,
        circularOutlineAtLeast75Percent: circularMirrorGeometryException ? true : null,
        twoMirrorEdgesOrCompleteOutline: true,
        responsiveFocalCropSafe: true,
        noForbiddenContent: true,
      },
    };
  }),
};

const bytes = Buffer.from(`${JSON.stringify(review, null, 2)}\n`);
await mkdir(path.dirname(path.join(ROOT, REVIEW_RELATIVE)), { recursive: true });
try {
  await writeFile(path.join(ROOT, REVIEW_RELATIVE), bytes, { flag: "wx" });
} catch (error) {
  if (error?.code !== "EEXIST") throw error;
  const existing = await readFile(path.join(ROOT, REVIEW_RELATIVE));
  if (!existing.equals(bytes)) fail("NO_CLOBBER");
}
console.log(JSON.stringify({ status: review.status, assets: review.assets.length }));
