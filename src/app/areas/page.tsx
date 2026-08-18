import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "@/components/SiteLink";
import { RegionSearch } from "@/components/RegionSearch";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { ACTIVE_ROOT_KEYS, getRootNode, ROOT_LABELS } from "@/lib/regions";

export const metadataContract = createRouteMetadataContract(
  "/areas/",
  "건마에반하다 지역 검색 | 1,291개 주소 단계 조회",
  "건마에반하다의 11개 시작 권역에서 시·군·구와 동·읍·면까지 이어지는 1,291개 출장마사지 지역 페이지를 찾습니다.",
  ["건마에반하다 지역", "전국 출장마사지 주소 찾기", "출장안마 권역 목록", "출장홈타이 상세 지역"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

export default function AreasPage() {
  const roots = ACTIVE_ROOT_KEYS.map((key, index) => {
    const node = getRootNode(key);
    return {
      key,
      name: ROOT_LABELS[key].full,
      scope: ROOT_LABELS[key].scope,
      path: `${node.path}/`,
      count: node.records.length,
      image: `/images/geonmae-template4/home/feature-${String((index % 8) + 1).padStart(2, "0")}.webp`,
    };
  });

  return (
    <main className="t4-areas-page">
      <header className="t4-directory-hero">
        <div className="page-width t4-directory-hero-inner">
          <p>GEONMAE BANHADA · REGION DIRECTORY</p>
          <h1>주소 단계로 지역 찾기</h1>
          <span>실제 받을 곳의 행정구역이나 지역 별칭을 입력하거나 시작 권역을 고르세요.</span>
          <RegionSearch className="search-form search-form--directory" />
          <div className="t4-directory-stats" aria-label="지역 페이지 요약">
            <div><span>권역</span><strong>11개</strong></div>
            <div><span>지역 페이지</span><strong>1,291개</strong></div>
            <div><span>검색 범위</span><strong>동·읍·면</strong></div>
          </div>
        </div>
      </header>

      <section className="page-width t4-directory-section" aria-labelledby="root-directory-title">
        <header className="section-head">
          <div><span className="section-kicker">REGION LIST</span><h2 id="root-directory-title">첫 단계 권역 목록</h2></div>
        </header>
        <div className="t4-directory-grid">
          {roots.map((root, index) => (
            <Link
              className="t4-directory-card"
              href={root.path}
              key={root.path}
              style={{ "--card-image": `url(${root.image})` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{root.name}</h2><p>{root.scope} · 하위 경로 {root.count}개</p></div>
              <b>다음 단계 →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
