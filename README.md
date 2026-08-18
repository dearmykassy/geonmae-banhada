# 건마에반하다

[건마에반하다 운영 사이트](https://gban.kr/)는 지역별 이용 범위, 공개 코스와 예약 전 확인사항을 안내하는 정적 웹사이트입니다. 화면은 Template4를 기준으로 구성하고 운영 URL은 `https://gban.kr` 하나로 통일합니다.

## 운영 페이지

- [지역 찾기](https://gban.kr/areas/)
- [가격 안내](https://gban.kr/pricing/)
- [이용 안내](https://gban.kr/guide/)
- [공지사항](https://gban.kr/notice/)
- [블로그](https://gban.kr/blog/)
- [XML 사이트맵](https://gban.kr/sitemap.xml)
- [RSS 2.0 피드](https://gban.kr/rss.xml)

위 링크는 2026-08-18 KST 기준 운영 HTTPS에서 모두 HTTP 200 응답을 확인했습니다.

## 페이지와 검색 수집 계약

- 지역 페이지 1,291개, 고정 페이지 6개, 블로그 글 2개를 제공하며 사이트맵에는 canonical 공개 URL 1,299개가 들어갑니다.
- 지역 페이지는 같은 지역 그래프를 사용하는 계층형 경로로 연결하고, 검색창은 시·군·구와 동·읍·면, 등록된 지역 별칭을 상세 페이지로 연결합니다.
- 공개 페이지는 self canonical과 `index,follow`를 사용합니다. `robots.txt`는 전체 경로 수집을 허용하고 운영 사이트맵을 명시합니다.
- `rss.xml`은 블로그 글 2편의 canonical GUID, 실제 발행일과 전체 본문을 제공합니다. 전체 URL 발견은 사이트맵이 담당합니다.
- 홈·고정·블로그·지역 페이지에는 각각의 title, keywords, description을 적용합니다. 제목과 본문은 실제 페이지 내용을 설명하며 반복 키워드나 확인되지 않은 운영 주장을 넣지 않습니다.

## 확인된 운영 정보

- 전화상담: 365일 24시간
- 결제: 선입금 없이 이용 뒤 현장 정산, 현장 카드 결제 가능
- 가격표: 5개 코스, 14개 시간·금액 항목
- 전화: 0508-202-3906

특정 주소의 이용 가능 여부와 시작 시각은 페이지에서 확정하지 않고, 상세 주소와 희망 시간을 전달한 전화에서 확인합니다.

## 개발과 검증

```bash
pnpm install --frozen-lockfile
pnpm verify
```

정적 출력은 `out/`에 생성됩니다. `pnpm verify`는 테스트, 타입 검사, 린트, 정적 빌드와 공개 산출물 감사를 함께 실행합니다. 도메인이나 배포 설정을 바꿀 때는 canonical, Open Graph URL, robots, sitemap과 RSS의 origin을 함께 확인합니다.

GA4는 배포 환경에 `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있을 때만 로드합니다. 전화 CTA 클릭 이벤트도 같은 조건에서 전송합니다.

## 이미지 계약

- 지역 배너: 승인된 원본 130개와 반응형 WebP 390개를 1,291개 지역 경로에 최대 10회씩 배정합니다.
- 홈·기능·코스·블로그·연락 배너와 투명 브랜드 마크는 용도별 자산을 사용합니다.
- 코스 카드는 거울 셀피가 아니라 코스의 동작·도구·대상을 구분할 수 있는 전용 이미지를 사용합니다.

이미지 검증과 릴리스 명령은 다음과 같습니다.

```bash
pnpm images:t4:contact-sheets
pnpm images:t4:focal-analysis
pnpm images:t4:approve
pnpm images:t4:release
```

네이버 서치어드바이저 온보딩에서는 사이트맵과 RSS를 제출하고 수집 주기를 `빠르게`로 설정합니다.
