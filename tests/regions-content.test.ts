import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createRegionContent, REGION_KEYWORD_SUFFIXES } from "@/lib/content";
import {
  ACTIVE_REGION_NODES,
  ACTIVE_ROOT_KEYS,
  getDirectChildren,
  getKeywordRegionLabel,
  getParentNode,
  getSearchRegionLabel,
  shortenRegionSearchName,
} from "@/lib/regions";
import {
  getRegionalImageAssetNumber,
  REGIONAL_IMAGE_ASSET_COUNT,
} from "@/lib/regional-image-assignment";
import { createRegionPageModel } from "@/lib/region-page-model";

const FORBIDDEN_COPY = [
  "필링홈타이",
  "랑테라피",
  "마사지봄",
  "마사지러브",
  "콜미토닥이",
  "한눈에",
  "차분하게",
  "부담 없이",
  "맞춤",
  "여유롭게",
  "특별한",
  "섬세한",
  "나만의",
  "프리미엄",
  "최고",
  "완벽",
  "즉시",
  "도착 예정",
  "배정 완료",
  "출발 완료",
  "분수",
] as const;

const KNOWN_FEELING_NORMALIZED_COPY = new Set([
  "{지역} 서비스 주소와 일정 확인",
  "{지역} {브랜드} 가격 안내",
  "도로명과 건물명을 전화로 확인하는 지역",
]);

function normalizeRegionalCopy(value: string, node: (typeof ACTIVE_REGION_NODES)[number]): string {
  const regionLabels = [
    node.qualifiedName,
    node.displayName,
    getSearchRegionLabel(node),
    getKeywordRegionLabel(node),
  ]
    .filter((label, index, labels) => label.length > 0 && labels.indexOf(label) === index)
    .sort((left, right) => right.length - left.length);

  return regionLabels
    .reduce((copy, label) => copy.replaceAll(label, "{지역}"), value)
    .replaceAll("건마에반하다", "{브랜드}")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeGeneratedPrefix(
  value: string,
  node: (typeof ACTIVE_REGION_NODES)[number],
): string {
  return value
    .replaceAll(node.qualifiedName, "{지역}")
    .replaceAll("건마에반하다", "{브랜드}")
    .replace(/\s+/gu, " ")
    .trim();
}

describe("MassageBom-equivalent regional graph", () => {
  it("keeps the exact MassageBom source snapshots and canonical route set", () => {
    const snapshots = [
      ["capital-regions.generated.json", "0242e5d86894321cba66b7f747675115520d856c7aaada870869e19f247500d2"],
      ["service-city-regions.generated.json", "72a318974585509632ba229307a954d01c40adcb8d98ff4ba6fbd1f1655f0d3d"],
    ] as const;

    for (const [fileName, expectedSha256] of snapshots) {
      const bytes = readFileSync(path.join(process.cwd(), "src/data", fileName));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(expectedSha256);
    }

    const sortedRouteSet = ACTIVE_REGION_NODES.map((node) => node.path).sort().join("\n");
    expect(createHash("sha256").update(sortedRouteSet).digest("hex")).toBe(
      "8a80b8a8d68fd6e1f0db9e4c662c82d3dafd24b7a70a532fe8f71b0d16d8c29d",
    );
  });

  it("keeps the exact 1,291-node structure", () => {
    expect(ACTIVE_ROOT_KEYS).toHaveLength(11);
    expect(ACTIVE_REGION_NODES).toHaveLength(1291);
    expect(new Set(ACTIVE_REGION_NODES.map((node) => node.path)).size).toBe(1291);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "root")).toHaveLength(11);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "hub")).toHaveLength(127);
    expect(ACTIVE_REGION_NODES.filter((node) => node.kind === "representative")).toHaveLength(1153);
  });

  it("links every non-representative node to direct children", () => {
    const parents = ACTIVE_REGION_NODES.filter((node) => node.kind !== "representative");
    expect(parents.every((node) => getDirectChildren(node).length > 0)).toBe(true);
  });

  it("assigns 130 regional images without parent or sibling collisions", () => {
    const usage = new Map<number, number>();
    for (const node of ACTIVE_REGION_NODES) {
      const asset = getRegionalImageAssetNumber(node);
      usage.set(asset, (usage.get(asset) ?? 0) + 1);
      const parent = getParentNode(node);
      if (parent) expect(asset).not.toBe(getRegionalImageAssetNumber(parent));

      const childAssets = getDirectChildren(node).map((child) => {
        const childNode = ACTIVE_REGION_NODES.find((candidate) => candidate.path === child.path);
        expect(childNode).toBeDefined();
        return getRegionalImageAssetNumber(childNode!);
      });
      expect(new Set(childAssets).size).toBe(childAssets.length);
    }

    expect(usage.size).toBe(REGIONAL_IMAGE_ASSET_COUNT);
    const distribution = [...usage.values()].reduce(
      (counts, count) => counts.set(count, (counts.get(count) ?? 0) + 1),
      new Map<number, number>(),
    );
    expect(distribution.get(10)).toBe(121);
    expect(distribution.get(9)).toBe(9);
  });
});

describe("Geonmae Banhada regional copy and metadata", () => {
  const records = ACTIVE_REGION_NODES.map((node) => ({
    node,
    content: createRegionContent(node),
  }));

  it("emits unique title, description and H1 for every route", () => {
    expect(new Set(records.map(({ content }) => content.title)).size).toBe(1291);
    expect(new Set(records.map(({ content }) => content.description)).size).toBe(1291);
    expect(new Set(records.map(({ content }) => content.h1)).size).toBe(1291);
  });

  it("emits the owner-required eight-keyword family", () => {
    for (const { node, content } of records) {
      const label = getKeywordRegionLabel(node);
      expect(content.keywords).toEqual(
        REGION_KEYWORD_SUFFIXES.map((suffix) => `${label}${suffix}`),
      );
      expect(new Set(content.keywords).size).toBe(8);
    }
  });

  it("uses concise customer search names in all three regional meta fields", () => {
    const examples = new Map([
      ["서울특별시", "서울"],
      ["인천광역시", "인천"],
      ["경기도", "경기"],
      ["제주특별자치도", "제주"],
      ["수원시", "수원"],
      ["천안시", "천안"],
    ]);
    for (const [official, concise] of examples) {
      expect(shortenRegionSearchName(official)).toBe(concise);
    }

    const forbiddenBeforeService =
      /(?:특별자치도|특별자치시|특별시|광역시|도|시)\s*(?=출장마사지|출장안마|출장타이마사지|출장스웨디시|출장홈타이)/u;
    for (const { node, content } of records) {
      const searchLabel = getSearchRegionLabel(node);
      const keywordLabel = getKeywordRegionLabel(node);
      const metaSurface = [content.title, content.description, ...content.keywords].join("\n");

      expect(content.title).toContain(keywordLabel);
      expect(content.description).toContain(searchLabel);
      expect(content.keywords.every((keyword) => keyword.startsWith(keywordLabel))).toBe(true);
      expect(metaSurface).not.toMatch(forbiddenBeforeService);
      expect(content.h1).toContain(node.qualifiedName);
    }
  });

  it("uses the new six-section structure and plain verified wording", () => {
    const expectedIds = [
      "local-boundary",
      "request-details",
      "course-duration",
      "price-payment",
      "visit-process",
      "confirmation",
    ];
    for (const { content } of records) {
      expect(content.sections.map((section) => section.id)).toEqual(expectedIds);
      expect(content.sections.every((section) => section.paragraphs.length === 2)).toBe(true);
      const visible = JSON.stringify(content);
      for (const phrase of FORBIDDEN_COPY) expect(visible).not.toContain(phrase);
    }
  });

  it("keeps every regional hook, heading and paragraph route-specific", () => {
    const hooks = records.flatMap(({ content }) => content.hooks);
    const headings = records.flatMap(({ content }) => content.sections.map((section) => section.heading));
    const paragraphs = records.flatMap(({ content }) => content.sections.flatMap((section) => section.paragraphs));

    expect(hooks).toHaveLength(2582);
    expect(new Set(hooks).size).toBe(hooks.length);
    expect(headings).toHaveLength(7746);
    expect(new Set(headings).size).toBe(headings.length);
    expect(paragraphs).toHaveLength(15492);
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it("keeps normalized metadata, hooks and paragraph slots genuinely varied", () => {
    const normalizedDescriptions = new Set(
      records.map(({ node, content }) => normalizeGeneratedPrefix(content.description, node)),
    );
    const normalizedFirstHooks = new Set(
      records.map(({ node, content }) => normalizeGeneratedPrefix(content.hooks[0], node)),
    );
    const normalizedSecondHooks = new Set(
      records.map(({ node, content }) => normalizeGeneratedPrefix(content.hooks[1], node)),
    );

    expect(normalizedDescriptions.size).toBeGreaterThanOrEqual(100);
    expect(normalizedFirstHooks.size).toBe(11);
    expect(normalizedSecondHooks.size).toBeGreaterThanOrEqual(100);

    for (let sectionIndex = 1; sectionIndex < 6; sectionIndex += 1) {
      for (let paragraphIndex = 0; paragraphIndex < 2; paragraphIndex += 1) {
        const slot = new Set(
          records.map(({ node, content }) =>
            normalizeGeneratedPrefix(
              content.sections[sectionIndex].paragraphs[paragraphIndex],
              node,
            ),
          ),
        );
        expect(slot.size).toBe(7);
      }
    }

    const pageSignatures = new Set(
      records.map(({ node, content }) =>
        [
          content.description,
          ...content.hooks,
          ...content.sections.flatMap((section) => section.paragraphs),
        ]
          .map((value) => normalizeGeneratedPrefix(value, node))
          .join("\u001f"),
      ),
    );
    expect(pageSignatures.size).toBeGreaterThanOrEqual(1250);
  });

  it("does not reuse known Feeling copy after region and brand normalization", () => {
    for (const { node, content } of records) {
      const model = createRegionPageModel(node);
      const customerCopy = [
        content.title,
        content.description,
        ...model.renderedSurface.map((entry) => entry.value),
      ];

      for (const value of customerCopy) {
        expect(KNOWN_FEELING_NORMALIZED_COPY).not.toContain(
          normalizeRegionalCopy(value, node),
        );
      }
    }
  });

  it("uses natural duration wording instead of the unrelated word 분수", () => {
    const customerCopyFiles = [
      "src/app/blog/page.tsx",
      "src/app/guide/page.tsx",
      "src/app/notice/page.tsx",
      "src/app/page.tsx",
      "src/app/pricing/page.tsx",
      "src/data/blog-posts.ts",
      "src/lib/content.ts",
      "src/lib/region-page-model.ts",
      "src/lib/site-content.ts",
    ];

    for (const fileName of customerCopyFiles) {
      expect(readFileSync(path.join(process.cwd(), fileName), "utf8")).not.toContain("분수");
    }
  });
});
