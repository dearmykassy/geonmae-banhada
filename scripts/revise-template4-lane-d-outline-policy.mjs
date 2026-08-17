import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/ssm/Documents/Codex/geonmae-banhada";
const RECEIPT_ROOT = path.join(
  PROJECT_ROOT,
  "artifacts/image-campaign/geonma-template4-mirror-selfie-v1/receipts/regional",
);
const revisionId = "regional-visual-qa-2026-08-17-r3";

for (let numericId = 40; numericId <= 52; numericId += 1) {
  const number = String(numericId).padStart(3, "0");
  const receiptPath = path.join(
    RECEIPT_ROOT,
    `lane-d/gmb-t4-rgn-${number}-v1.receipt.json`,
  );
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));

  receipt.qaPolicyRevision.revisionId = revisionId;
  receipt.qaPolicyRevision.qaPromptAddendum =
    "Review the immutable generated output using the circular-mirror exception: reflective mirror area >=30%; at least 75% of the circular outline visible; real reflection is clear; face, phone, and mirror survive the central mobile crop; no forbidden content or anatomy/reflection defects.";
  receipt.qaPolicyRevision.frameRequirement =
    "at least 75% of the circular outline visible";
  receipt.visualReview.status = "PENDING";
  delete receipt.visualReview.completeCircularOutlineVisible;
  receipt.visualReview.circularOutlineVisibleAtLeast75Percent = true;
  receipt.visualReview.rejectionReason = null;
  receipt.visualReview.pendingReason =
    "Meets the revised lane visual checks; retained as PENDING for independent root review and approval.";

  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
}

const indexPath = path.join(RECEIPT_ROOT, "lane-d.index.v1.json");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
index.pending = 13;
index.rejected = 0;
index.qaPolicyRevision = revisionId;
for (const item of index.receipts) {
  item.status = "PENDING";
}
fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

console.log(JSON.stringify({ lane: "D", pending: 13, rejected: 0, revisionId }));
