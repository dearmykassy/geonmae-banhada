# 건마에반하다

Template4를 기반으로 한 전국 출장마사지 지역·코스 안내 플랫폼입니다.

## 개발 상태

- 지역 정본: 마사지봄 활성 지역과 동일한 1,291개 경로
- 전체 사이트맵: 지역 1,291개 + 고정 6개 + 블로그 2개 = 1,299개 URL
- 공개 상태: `https://gban.kr`, production canonical + `index,follow`
- 운영 사실: 0508-202-3906, 24시간 전화상담, 선입금 없는 현장 후불, 현장 카드 결제, 확정 14개 가격 행
- 메타데이터: 홈·고정·블로그·지역 전 페이지에 title, keywords, description 적용
- 지역 이미지: Template4 전용 거울 셀피 원본 130개, 반응형 WebP 390개 릴리스 완료
- 비지역 이미지: 홈·기능·카테고리·블로그·연락 배너 17개와 투명 브랜드 마크 1개 적용
- 분석: `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 있을 때만 GA4 태그와 전화 CTA 클릭 이벤트를 출력

## 명령어

```bash
pnpm install --frozen-lockfile
pnpm verify
```

정적 출력은 `out/`에 생성됩니다.

## 이미지 검증·릴리스

```bash
pnpm images:t4:contact-sheets
pnpm images:t4:focal-analysis
pnpm images:t4:approve
pnpm images:t4:release
```

지역 배너는 130개 사진을 1,291개 경로에 최대 10회씩 배정합니다. 재사용 분포는 `121×10 + 9×9`이며 부모·자식 및 같은 부모의 자식 카드 사이에는 같은 사진을 배정하지 않습니다. 모바일 파생본은 768×600이고, 별도 초점이 필요한 19개 이미지는 390×620과 320×620 실제 노출을 검수한 좌표를 사용합니다.

## 공개 전환 체크

운영 canonical·Open Graph·sitemap·robots는 `https://gban.kr`로 통일합니다. 도메인이나 배포 설정을 바꿀 때는 `pnpm verify`를 다시 실행하고 운영 HTTPS, canonical, robots, sitemap 호스트를 함께 확인합니다.
