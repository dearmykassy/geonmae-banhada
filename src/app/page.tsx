import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { RegionSearch } from "@/components/RegionSearch";
import { Template4Carousel } from "@/components/Template4Carousel";
import { BLOG_POSTS, getBlogPostPath } from "@/data/blog-posts";
import { OPERATING_NOTES, PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { ACTIVE_ROOT_KEYS, getRootNode, ROOT_LABELS } from "@/lib/regions";
import { COURSE_GROUPS, NOTICE_ITEMS, SERVICE_STEPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/",
  "건마에반하다 | 전국 1,291개 지역·출장마사지 가격표",
  "건마에반하다에서 주소별 운영 범위, 5개 코스 14개 가격 항목, 24시간 전화 접수와 현장 후불 방식을 확인합니다.",
  [
    "건마에반하다",
    "출장마사지",
    "출장안마",
    "출장타이마사지",
    "출장스웨디시",
    "출장홈타이",
    "남성전용마사지",
    "여성전용마사지",
  ],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

function imageStyle(path: string): CSSProperties {
  return { "--card-image": `url(${path})` } as CSSProperties;
}

export default function Home() {
  const roots = ACTIVE_ROOT_KEYS.map((key) => {
    const node = getRootNode(key);
    return {
      key,
      name: ROOT_LABELS[key].short,
      fullName: ROOT_LABELS[key].full,
      path: `${node.path}/`,
      count: node.records.length,
    };
  });

  return (
    <main className="t4-home">
      <section
        aria-labelledby="home-hero-title"
        className="hero"
        style={{ "--hero-image": "url(/images/geonmae-template4/home/hero-mirror.webp)" } as CSSProperties}
      >
        <div className="hero-copy page-width">
          <p>24H PHONE CONSULTATION</p>
          <h1 id="home-hero-title">건마에반하다</h1>
          <h2>주소별 운영 범위와 공개 가격표</h2>
          <span>받을 곳의 주소와 가능한 시각을 준비해 전화로 일정 여부를 맞춥니다.</span>
        </div>
        <div className="region-search-dock page-width">
          <div className="region-brand"><strong>지역 검색</strong><span>1,291개 안내 페이지</span></div>
          <RegionSearch className="search-form search-form--dock" />
        </div>
      </section>

      <section className="location-strip" aria-label="운영 범위">
        <span>주소 기준 지역 안내</span>
        <strong><i aria-hidden="true">●</i> 11개 권역 · 상세 경로 1,291개</strong>
      </section>

      <div className="page-width content-wrap">
        <section className="section-space" aria-labelledby="featured-regions-title">
          <header className="section-head">
            <div><span className="section-kicker">SERVICE AREA</span><h2 id="featured-regions-title">권역 바로가기</h2></div>
            <Link href="/areas/">전체 지역 +</Link>
          </header>
          <Template4Carousel ariaLabel="주요 운영 지역">
            {roots.slice(0, 8).map((root, index) => (
              <article className="new-card" key={root.path}>
                <Link
                  aria-label={`${root.fullName} 지역 안내 보기`}
                  className="shop-photo"
                  href={root.path}
                  style={imageStyle(`/images/geonmae-template4/home/feature-${String(index + 1).padStart(2, "0")}.webp`)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>지역 안내</b>
                </Link>
                <div className="new-copy">
                  <div><em>{root.name}</em><h3>{root.fullName} 출장마사지</h3></div>
                  <p>주소 단계별 운영 범위 조회</p>
                  <footer><span>{root.count}개 하위 지역</span><Link href={root.path}>확인 →</Link></footer>
                </div>
              </article>
            ))}
          </Template4Carousel>
        </section>

        <section className="section-space" aria-labelledby="operation-title">
          <header className="section-head">
            <div><span className="section-kicker">OPERATION</span><h2 id="operation-title">전화·정산 공지</h2></div>
            <Link href="/notice/">공지사항 +</Link>
          </header>
          <div className="operation-list">
            {NOTICE_ITEMS.map((notice, index) => (
              <article className="operation-card" id={`home-${notice.slug}`} key={notice.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{notice.title}</h3><p>{notice.summary}</p></div>
                <Link href={`/notice/#${notice.slug}`}>자세히 →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-space" aria-labelledby="course-title">
          <header className="section-head">
            <div><span className="section-kicker">COURSE &amp; PRICE</span><h2 id="course-title">5개 코스 첫 금액</h2></div>
            <Link href="/pricing/">전체 가격표 +</Link>
          </header>
          <div className="category-grid">
            {COURSE_GROUPS.map((group, index) => (
              <Link
                className="category-card"
                href="/pricing/"
                key={group.course}
                style={imageStyle(`/images/geonmae-template4/home/category-${String(index + 1).padStart(2, "0")}.webp`)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{group.course}</h3><p>{group.options[0]?.price}부터</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-space" aria-labelledby="process-title">
          <header className="section-head">
            <div><span className="section-kicker">HOW TO USE</span><h2 id="process-title">주소 조회부터 현장 정산까지</h2></div>
            <Link href="/guide/">이용 안내 +</Link>
          </header>
          <ol className="home-process-list">
            {SERVICE_STEPS.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
            ))}
          </ol>
        </section>

        <section className="section-space" aria-labelledby="blog-preview-title">
          <header className="section-head">
            <div><span className="section-kicker">GEONMAE NOTE</span><h2 id="blog-preview-title">상황별 확인 메모</h2></div>
            <Link href="/blog/">블로그 +</Link>
          </header>
          <div className="home-blog-grid">
            {BLOG_POSTS.map((post, index) => (
              <article className="home-blog-card" key={post.slug}>
                <Link
                  aria-label={`${post.title} 읽기`}
                  className="home-blog-visual"
                  href={getBlogPostPath(post)}
                  style={imageStyle(post.image.src)}
                >
                  <span>NOTE {String(index + 1).padStart(2, "0")}</span>
                </Link>
                <div><span>{post.category}</span><h3><Link href={getBlogPostPath(post)}>{post.title}</Link></h3><p>{post.description}</p><Link href={getBlogPostPath(post)}>글 읽기 →</Link></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-space all-regions" aria-labelledby="all-regions-title">
          <header className="section-head">
            <div><span className="section-kicker">REGION DIRECTORY</span><h2 id="all-regions-title">11개 시작 권역</h2></div>
            <Link href="/areas/">지역 검색 +</Link>
          </header>
          <div className="root-region-grid">
            {roots.map((root, index) => (
              <Link className="root-region-card" href={root.path} key={root.path}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{root.name}</strong>
                <small>{root.count}개 지역</small>
                <b>→</b>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section
        className="partner-section"
        style={{ "--contact-image": "url(/images/geonmae-template4/home/contact.webp)" } as CSSProperties}
      >
        <div>
          <span>24H CONSULTATION</span>
          <h2>받을 주소와 가능한 시각을 준비해 주세요.</h2>
          <p>{OPERATING_NOTES.join(" · ")} · 코스명과 이용 시간 확인</p>
          <a href={PHONE_HREF}>{PHONE_DISPLAY} 전화 문의</a>
        </div>
      </section>
    </main>
  );
}
