import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  CAMPAIGN_RELATIVE_ROOT,
  buildCampaign,
  writeCampaign,
} from "../scripts/create-template4-mirror-campaign.mjs";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

describe("Template4 mirror-selfie image campaign", () => {
  it("builds the exact deterministic lane, lighting, and active UI slot inventory", () => {
    const { manifest, jobs } = buildCampaign();
    const regional = jobs.filter((job) => job.jobClass === "regional");
    const editorial = jobs.filter((job) => job.jobClass === "editorial");
    const replacement = jobs.filter((job) => job.jobClass === "replacement");
    const brand = jobs.filter((job) => job.jobClass === "brand");

    expect(manifest.counts).toEqual({
      regionalPhotos: 130,
      editorialPhotos: 17,
      replacementPhotos: 1,
      brandMarks: 1,
      photographicJobs: 148,
      totalJobs: 149,
    });
    expect(regional).toHaveLength(130);
    expect(editorial).toHaveLength(17);
    expect(replacement).toHaveLength(1);
    expect(brand).toHaveLength(1);
    expect(new Set(jobs.map((job) => job.id)).size).toBe(149);
    expect(new Set(jobs.map((job) => job.outputFile)).size).toBe(148);
    expect(new Set(jobs.map((job) => job.prompt)).size).toBe(149);

    expect(regional.map((job) => job.id)).toEqual(
      Array.from({ length: 130 }, (_, index) => `gmb-t4-rgn-${String(index + 1).padStart(3, "0")}-v1`),
    );
    expect(regional.filter((job) => job.illumination === "bright")).toHaveLength(52);
    expect(regional.filter((job) => job.illumination === "softly-dark")).toHaveLength(78);

    for (const lane of "ABCDEFGHIJ") {
      const laneJobs = regional.filter((job) => job.lane === lane);
      expect(laneJobs).toHaveLength(13);
      expect(laneJobs.map((job) => job.laneOrdinal)).toEqual(Array.from({ length: 13 }, (_, index) => index + 1));
    }

    expect(editorial.map((job) => job.outputFile)).toEqual([
      "public/images/geonmae-template4/home/hero-mirror.webp",
      ...Array.from({ length: 8 }, (_, index) => `public/images/geonmae-template4/home/feature-${String(index + 1).padStart(2, "0")}.webp`),
      ...Array.from({ length: 5 }, (_, index) => `public/images/geonmae-template4/home/category-${String(index + 1).padStart(2, "0")}.webp`),
      "public/images/geonmae-template4/home/contact.webp",
      "public/images/geonmae-template4/blog/note-01.webp",
      "public/images/geonmae-template4/blog/note-02.webp",
    ]);
    expect(brand[0].outputFile).toBe("public/images/geonmae-template4/brand/mark.png");
    expect(replacement).toEqual([expect.objectContaining({
      id: "gmb-t4-feature-04-v2",
      replacesJobId: "gmb-t4-feature-04-v1",
      outputFile: "public/images/geonmae-template4/home/feature-04.webp",
      attempt: 2,
    })]);
    expect(manifest.replacementPlan.relationships).toEqual([{
      rejectedJobId: "gmb-t4-feature-04-v1",
      replacementJobId: "gmb-t4-feature-04-v2",
      activeOutput: "public/images/geonmae-template4/home/feature-04.webp",
      attempt: 2,
    }]);
    expect(jobs.some((job) => job.outputFile.endsWith("/contact.webp"))).toBe(true);
    expect(manifest.activeUiSlotPlan.editorialIlluminationDistribution).toEqual({ bright: 6, "softly-dark": 11 });

    for (const job of [...regional, ...editorial, ...replacement]) {
      expect(job.prompt).toContain("clearly adult Korean woman age 26-34");
      expect(job.prompt).toContain("reflective surface occupies at least 45%");
      expect(job.prompt).toContain("at least three frame edges or the complete mirror outline");
      expect(job.prompt).toContain("central x=18%-82% and y=10%-92% crop-safe zone");
      expect(job.prompt).toContain("One person only");
      expect(job.qaContract.ownerExceptionAllowed).toBe(false);
    }
    expect(brand[0].prompt).toContain("transparent-background RGBA brand symbol");
    expect(brand[0].prompt).toContain("do not render the Korean name or any other text");
    expect(brand[0].qaContract.faviconDerivativeAllowedOnlyAfterHumanReview).toBe(true);
  });

  it("keeps every checked-in prompt and job record consistent with the manifest", async () => {
    const campaign = buildCampaign();
    const manifestPath = path.join(PROJECT_ROOT, CAMPAIGN_RELATIVE_ROOT, "campaign.v1.json");
    const checkedInManifest = JSON.parse(await readFile(manifestPath, "utf8"));

    expect(checkedInManifest).toEqual(campaign.manifest);
    expect(checkedInManifest.jobs).toHaveLength(149);

    for (const expectedJob of campaign.jobs) {
      const promptContents = await readFile(path.join(PROJECT_ROOT, expectedJob.promptFile), "utf8");
      const jobContents = JSON.parse(await readFile(path.join(PROJECT_ROOT, expectedJob.jobFile), "utf8"));
      expect(promptContents).toBe(`${expectedJob.prompt}\n`);
      expect(sha256(promptContents)).toBe(expectedJob.promptSha256);
      expect(jobContents).toEqual(expectedJob);
      expect(jobContents.generationStatus).toBe("NOT_GENERATED");
      expect(jobContents.approvalStatus).toBe("NOT_APPROVED");
      expect(jobContents.releaseStatus).toBe("NOT_RELEASED");
    }
  });

  it("is deterministic and refuses to overwrite drifted campaign documents", async () => {
    const temporaryRoot = await mkdtemp(path.join(tmpdir(), "geonma-template4-campaign-"));
    try {
      const campaign = buildCampaign();
      const first = await writeCampaign(campaign, { projectRoot: temporaryRoot });
      const manifestPath = path.join(temporaryRoot, CAMPAIGN_RELATIVE_ROOT, "campaign.v1.json");
      const firstManifest = await readFile(manifestPath, "utf8");
      const second = await writeCampaign(buildCampaign(), { projectRoot: temporaryRoot });
      const secondManifest = await readFile(manifestPath, "utf8");

      expect(first).toMatchObject({ created: 299, exact: 0, documents: 299, promptFiles: 149, jobFiles: 149, manifestFiles: 1 });
      expect(second).toMatchObject({ created: 0, exact: 299, documents: 299, promptFiles: 149, jobFiles: 149, manifestFiles: 1 });
      expect(secondManifest).toBe(firstManifest);

      const driftedPrompt = path.join(temporaryRoot, campaign.jobs[0].promptFile);
      await writeFile(driftedPrompt, "drifted prompt\n");
      await expect(writeCampaign(buildCampaign(), { projectRoot: temporaryRoot })).rejects.toThrow("CAMPAIGN_DRIFT_REFUSED");
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
});
