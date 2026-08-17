"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegionSearch } from "@/components/RegionSearch";
import { PHONE_HREF } from "@/lib/business";

const NAV = [
  ["/areas/", "지역 안내"],
  ["/pricing/", "가격 안내"],
  ["/guide/", "이용 안내"],
  ["/notice/", "공지사항"],
  ["/blog/", "블로그"],
] as const;

const QUICK_REGIONS = [
  ["/areas/seoul/", "서울"],
  ["/areas/incheon/", "인천"],
  ["/areas/gyeonggi/", "경기"],
  ["/areas/busan/", "부산"],
  ["/areas/jeju/", "제주"],
] as const;

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => searchButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    const syncScroll = () => setScrolled(window.scrollY > 44);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };

    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSearch]);

  useEffect(() => {
    if (!searchOpen) return;
    window.requestAnimationFrame(() => {
      searchPanelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    });
  }, [searchOpen]);

  useEffect(() => {
    document.body.classList.toggle("search-active", searchOpen);
    document.body.classList.toggle("notice-closed", !noticeOpen);
    return () => {
      document.body.classList.remove("search-active", "notice-closed");
    };
  }, [noticeOpen, searchOpen]);

  return (
    <>
      {noticeOpen ? (
        <div className="notice-bar">
          <div className="notice-inner">
            <p><b>24시간 전화 접수</b><span>받을 주소와 가능한 시각을 기준으로 일정을 확인합니다.</span></p>
            <button aria-label="상단 안내 닫기" className="notice-close" onClick={() => setNoticeOpen(false)} type="button">×</button>
          </div>
        </div>
      ) : null}

      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="header-inner page-width">
          <Link className="brand" href="/" aria-label="건마에반하다 홈">
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">건마에반하다</span>
          </Link>
          <nav className="desktop-nav" aria-label="주요 메뉴">
            {NAV.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <a className="header-phone" href={PHONE_HREF}>전화 문의</a>
            <button
              aria-expanded={searchOpen}
              aria-label="지역 검색 열기"
              className="round-search"
              onClick={() => setSearchOpen(true)}
              ref={searchButtonRef}
              type="button"
            >
              <svg aria-hidden="true" className="search-glyph" viewBox="0 0 24 24">
                <circle cx="10.5" cy="10.5" r="6.25" />
                <path d="m15.2 15.2 4.55 4.55" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!searchOpen}
        className={`search-panel${searchOpen ? " is-open" : ""}`}
        inert={!searchOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeSearch();
            return;
          }
          if (event.key !== "Tab") return;
          const focusable = [...(searchPanelRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled])',
          ) ?? [])].filter((element) => element.offsetParent !== null);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        ref={searchPanelRef}
      >
        <button aria-label="검색 닫기" className="search-close" onClick={closeSearch} type="button">×</button>
        <div className="search-panel-inner">
          <p className="search-panel-label">REGION SEARCH</p>
          <h2>주소에 맞는 상세 페이지 찾기</h2>
          <p>시·군·구, 동·읍·면 또는 지역 별칭을 입력하면 해당 경로를 바로 엽니다.</p>
          <RegionSearch className="search-form search-form--panel" onNavigate={closeSearch} />
          <div className="search-quick-links" aria-label="빠른 지역 링크">
            {QUICK_REGIONS.map(([href, label]) => <Link href={href} key={href} onClick={closeSearch}>{label}</Link>)}
          </div>
          <nav className="search-menu-links" aria-label="전체 메뉴">
            {NAV.map(([href, label]) => <Link href={href} key={href} onClick={closeSearch}>{label}</Link>)}
          </nav>
        </div>
      </div>

      <button
        aria-label="맨 위로 이동"
        className={`scroll-top${scrolled ? " is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        type="button"
      >
        ↑
      </button>
    </>
  );
}
