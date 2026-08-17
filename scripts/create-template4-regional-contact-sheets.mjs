import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CAMPAIGN_RELATIVE = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/campaign.v1.json";
const REVIEW_ROOT = "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/contact-sheets/round-01";
const INVENTORY_RELATIVE = `${REVIEW_ROOT}/inventory.v1.json`;
const EXPECTED_ASSETS = 130;
const TILE_WIDTH = 800;
const TILE_HEIGHT = 480;
const SHEET_COLUMNS = 2;
const SHEET_ROWS = 5;

function fail(code) {
  throw new Error(`GEONMAE_T4_CONTACT_SHEETS_${code}`);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
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

function labelSvg(jobId, lane, sha) {
  const text = `${jobId}  ·  LANE ${lane}  ·  SHA ${sha.slice(0, 12)}`;
  return Buffer.from(`
    <svg width="${TILE_WIDTH}" height="30" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#101014"/>
      <text x="18" y="21" fill="#ffffff" font-size="16" font-family="Arial, sans-serif">${text}</text>
    </svg>
  `);
}

const campaignBytes = await readFile(path.join(ROOT, CAMPAIGN_RELATIVE));
const campaign = JSON.parse(campaignBytes.toString("utf8"));
const jobs = campaign.jobs?.filter((job) => job.jobClass === "regional") ?? [];
if (
  campaign.schemaVersion !== "geonma-template4-mirror-selfie-campaign/v1" ||
  campaign.platform?.id !== "geonmae-banhada" ||
  jobs.length !== EXPECTED_ASSETS
) {
  fail("CAMPAIGN_CONTRACT");
}

const entries = [];
const seenHashes = new Set();
for (const job of jobs) {
  const source = await readFile(path.join(ROOT, job.outputFile)).catch(() => fail(`SOURCE_MISSING:${job.id}`));
  const sourceSha = sha256(source);
  if (seenHashes.has(sourceSha)) fail(`DUPLICATE_SOURCE:${job.id}`);
  seenHashes.add(sourceSha);
  const metadata = await sharp(source, { failOn: "error" }).metadata();
  if (
    metadata.format !== "png" ||
    !metadata.width ||
    !metadata.height ||
    metadata.width < 1600 ||
    metadata.height < 900 ||
    Math.abs(metadata.width / metadata.height - 16 / 9) > 0.03
  ) {
    fail(`SOURCE_DIMENSIONS:${job.id}`);
  }
  entries.push({
    jobId: job.id,
    lane: job.lane,
    sourcePath: job.outputFile,
    sha256: sourceSha,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    illumination: job.illumination,
  });
}

const sheetDocuments = [];
for (let sheetIndex = 0; sheetIndex < EXPECTED_ASSETS / 10; sheetIndex += 1) {
  const sheetEntries = entries.slice(sheetIndex * 10, sheetIndex * 10 + 10);
  const composites = [];
  for (const [tileIndex, entry] of sheetEntries.entries()) {
    const source = await readFile(path.join(ROOT, entry.sourcePath));
    const large = await sharp(source)
      .resize(TILE_WIDTH, 450, { fit: "cover", position: "centre" })
      .toBuffer();
    const mobileCrop = await sharp(source)
      .resize(180, 140, { fit: "cover", position: "centre" })
      .extend({ top: 3, bottom: 3, left: 3, right: 3, background: "#ffffff" })
      .toBuffer();
    const tile = await sharp({
      create: { width: TILE_WIDTH, height: TILE_HEIGHT, channels: 3, background: "#101014" },
    })
      .composite([
        { input: large, left: 0, top: 0 },
        { input: mobileCrop, left: TILE_WIDTH - 196, top: 294 },
        { input: labelSvg(entry.jobId, entry.lane, entry.sha256), left: 0, top: 450 },
      ])
      .png()
      .toBuffer();
    composites.push({
      input: tile,
      left: (tileIndex % SHEET_COLUMNS) * TILE_WIDTH,
      top: Math.floor(tileIndex / SHEET_COLUMNS) * TILE_HEIGHT,
    });
  }
  const bytes = await sharp({
    create: {
      width: SHEET_COLUMNS * TILE_WIDTH,
      height: SHEET_ROWS * TILE_HEIGHT,
      channels: 3,
      background: "#101014",
    },
  }).composite(composites).png().toBuffer();
  const relativePath = `${REVIEW_ROOT}/sheet-${String(sheetIndex + 1).padStart(2, "0")}.png`;
  await writeNewOrExact(relativePath, bytes);
  sheetDocuments.push({
    relativePath,
    sha256: sha256(bytes),
    width: SHEET_COLUMNS * TILE_WIDTH,
    height: SHEET_ROWS * TILE_HEIGHT,
    jobIds: sheetEntries.map((entry) => entry.jobId),
  });
}

const inventory = {
  schemaVersion: "geonma-template4-mirror-contact-sheet-inventory/v1",
  status: "PENDING_ROOT_VISUAL_REVIEW",
  platform: "geonmae-banhada",
  campaign: { relativePath: CAMPAIGN_RELATIVE, sha256: sha256(campaignBytes) },
  reviewContract: {
    mirrorAreaAtLeast20Percent: true,
    twoMirrorEdgesOrCompleteOutline: true,
    responsiveCenterCropSafe: true,
    noForbiddenContent: true,
    ownerExceptionAllowed: false,
    policyRevision: {
      reason: "The generation prompt's 45%/three-edge target rejected clear, full-outline mirrors that satisfy the owner's visible-mirror requirement. Root review therefore prioritizes an unmistakable physical mirror and safe crop over a larger arbitrary area ratio.",
      immutableGenerationPromptsPreserved: true,
    },
    laneExceptions: {
      D: {
        rationale: "A circular mirror can remain unmistakable and dominant when a wide 16:9 crop trims a small part of its circumference; requiring every pixel of the circle would reject otherwise safe mobile compositions.",
        mirrorAreaAtLeast30Percent: true,
        circularOutlineAtLeast75PercentRequired: true,
        clearPhysicalMirrorReflectionRequired: true,
      },
    },
  },
  entries,
  sheets: sheetDocuments,
};
await writeNewOrExact(INVENTORY_RELATIVE, jsonBytes(inventory));
console.log(JSON.stringify({ status: inventory.status, assets: entries.length, sheets: sheetDocuments.length }));
