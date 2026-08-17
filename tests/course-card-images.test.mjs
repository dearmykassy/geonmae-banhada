import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { COURSE_SCORES } from "../src/lib/business.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const COURSE_ROOT = "public/images/geonmae-template4/courses/v1";
const V1_EXPECTED = [
  ["타이마사지", "thai-massage-v1"],
  ["아로마마사지", "aroma-massage-v1"],
  ["힐링마사지", "healing-massage-v1"],
  ["스페셜마사지", "special-massage-v1"],
  ["남성전용", "men-only-massage-v1"],
];
const ACTIVE_EXPECTED = [
  ["타이마사지", "v1", "thai-massage-v1"],
  ["아로마마사지", "v1", "aroma-massage-v1"],
  ["힐링마사지", "v1", "healing-massage-v1"],
  ["스페셜마사지", "v1", "special-massage-v1"],
  ["남성전용", "v2", "men-only-massage-v2"],
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("course-specific home card images", () => {
  it("maps the five live course names to the exact non-selfie asset order", async () => {
    const courseOrder = [...new Set(COURSE_SCORES.map(({ course }) => course))];
    expect(courseOrder).toEqual(ACTIVE_EXPECTED.map(([course]) => course));

    const page = await readFile(path.join(ROOT, "src/app/page.tsx"), "utf8");
    const positions = ACTIVE_EXPECTED.map(([, version, id]) => page.indexOf(
      `"/images/geonmae-template4/courses/${version}/${id}.webp"`,
    ));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(page).not.toContain("/images/geonmae-template4/home/category-");
  });

  it("retains five PNG originals and verifies exact 4:5 WebP derivatives by provenance hash", async () => {
    const provenance = JSON.parse(await readFile(
      path.join(ROOT, COURSE_ROOT, "provenance.v1.json"),
      "utf8",
    ));
    expect(provenance).toMatchObject({
      schema: "geonmae-banhada-course-card-images/v1",
      status: "ACTIVE",
      generationMode: "exactly one built-in image_gen call per course asset",
    });
    expect(provenance.assets).toHaveLength(5);
    expect(provenance.assets.map(({ course, id }) => [course, id])).toEqual(V1_EXPECTED);

    const activeHashes = new Set();
    for (const asset of provenance.assets) {
      const originalBytes = await readFile(path.join(ROOT, asset.original.path));
      const activePath = path.join(ROOT, "public", asset.activeDerivative.path);
      const activeBytes = await readFile(activePath);
      const [originalMetadata, activeMetadata] = await Promise.all([
        sharp(originalBytes).metadata(),
        sharp(activeBytes).metadata(),
      ]);

      expect(sha256(originalBytes)).toBe(asset.original.sha256);
      expect(originalBytes.byteLength).toBe(asset.original.bytes);
      expect(originalMetadata).toMatchObject({
        width: asset.original.width,
        height: asset.original.height,
        format: "png",
      });

      expect(sha256(activeBytes)).toBe(asset.activeDerivative.sha256);
      expect(activeBytes.byteLength).toBe(asset.activeDerivative.bytes);
      expect(activeMetadata).toMatchObject({ width: 800, height: 1000, format: "webp" });
      expect(asset.visualReview).toMatchObject({
        status: "ACCEPTED",
        cropSafe: true,
        noMirrorSelfiePhone: true,
        noTextLogoWatermark: true,
        noNudityOrSuggestivePose: true,
        anatomyPass: true,
      });
      activeHashes.add(asset.activeDerivative.sha256);
    }
    expect(activeHashes.size).toBe(5);

    const oldMirrorHashes = await Promise.all(Array.from({ length: 5 }, async (_, index) => {
      const bytes = await readFile(path.join(
        ROOT,
        `public/images/geonmae-template4/home/category-${String(index + 1).padStart(2, "0")}.webp`,
      ));
      return sha256(bytes);
    }));
    expect(oldMirrorHashes.every((hash) => !activeHashes.has(hash))).toBe(true);
  });

  it("uses a reviewed female practitioner and male customer in the active men's card", async () => {
    const provenance = JSON.parse(await readFile(
      path.join(ROOT, "public/images/geonmae-template4/courses/v2/provenance.v2.json"),
      "utf8",
    ));
    const original = await readFile(path.join(ROOT, provenance.original.path));
    const active = await readFile(path.join(ROOT, "public", provenance.activeDerivative.path));
    const [originalMetadata, activeMetadata] = await Promise.all([
      sharp(original).metadata(),
      sharp(active).metadata(),
    ]);

    expect(provenance).toMatchObject({
      status: "ACTIVE",
      course: "남성전용",
      visualReview: {
        status: "ACCEPTED",
        femalePractitioner: true,
        maleClient: true,
        horizontalMassageTable: true,
        ordinaryPillowNoMachine: true,
      },
    });
    expect(sha256(original)).toBe(provenance.original.sha256);
    expect(sha256(active)).toBe(provenance.activeDerivative.sha256);
    expect(originalMetadata).toMatchObject({ width: 1122, height: 1402, format: "png" });
    expect(activeMetadata).toMatchObject({ width: 800, height: 1000, format: "webp" });
  });

  it("keeps the image-placement rule durable for future course-card work", async () => {
    const agents = await readFile(path.join(ROOT, "AGENTS.md"), "utf8");
    expect(agents).toContain("코스 소개 카드는 거울 셀피를 사용하지 않는다.");
    expect(agents).toContain("각 코스의 동작·도구·대상이 구분되는 전용 이미지를 사용");
    expect(agents).toContain("성인 여성 관리사");
  });
});
