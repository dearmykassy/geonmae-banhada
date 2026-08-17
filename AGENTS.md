# 건마에반하다 작업 규칙

- 새 활동을 시작하기 전에 이 파일과 `DIARY.md`를 끝까지 읽고, 확인된 변경과 검증 결과를 `DIARY.md` 맨 위에 최신순으로 기록한다.
- 시각·레이아웃 정본은 `/Users/ssm/Documents/Services/Templetes/Template4`다. 템플릿의 안내 바, 오버레이 헤더, 검색 패널, 히어로 검색 도크, 카드·리스트 구조를 Next.js 정적 사이트로 옮긴다.
- 지역 정본은 `/Users/ssm/Documents/Codex/massagebom`의 활성 1,291개 지역 경로와 계층이다. 마사지봄에 없는 지역을 추가하지 않고 sitemap과 지역 페이지는 같은 데이터 집합을 사용한다.
- 마사지봄의 전화번호, 확정 가격표, 24시간 전화상담, 선입금 없는 현장 후불, 현장 카드 결제, 이용 절차와 Q&A 운영 사실은 공유할 수 있다. 다른 플랫폼의 고객 문장·메타 문장·이미지·브랜드 표현은 그대로 복사하지 않는다.
- 브랜드는 `건마에반하다`, 플랫폼 ID는 `geonmae-banhada`로 고정한다. 고객 화면과 메타에 다른 플랫폼 브랜드를 남기지 않는다.
- 모든 공개 페이지는 meta title, meta keywords, meta description과 self canonical 계약을 가진다. 지역 페이지의 8개 키워드 틀은 사장님 지시를 따른다.
- 상단 검색은 장식 링크가 아니라 1,291개 지역명과 상위 지역·별칭을 검색해 상세 페이지로 직접 이동해야 한다.
- 운영 도메인은 `https://gban.kr`이다. 모든 공개 페이지의 canonical·Open Graph·sitemap은 이 origin을 사용하고 `index,follow`, robots 전체 허용 상태를 유지한다.
- 모든 신규 플랫폼은 전체 canonical 공개 URL을 담은 `sitemap.xml`과 최신 게시글의 실제 발행일·canonical GUID·본문 전체를 담은 `rss.xml`을 함께 제공한다. 네이버 서치어드바이저 온보딩에서는 `설정 → 수집 주기 설정 → 빠르게`를 선택한다.
- 지역 페이지와 메인 홈·블로그·배너의 편집 이미지는 성인 한국인 여성의 깔끔한 실내 거울 셀피를 사용한다. 거울 반사면과 프레임이 분명해야 하며 문자·로고·워터마크·선정적 의상·참고 인물 복제는 허용하지 않는다.
- 코스 소개 카드는 거울 셀피를 사용하지 않는다. 타이·아로마·힐링·스페셜·남성전용 각 코스의 동작·도구·대상이 구분되는 전용 이미지를 사용하며 문자·로고·워터마크·노출·선정적 연출·실제 업체로 오인할 표식은 넣지 않는다.
- `남성전용` 코스 카드는 일반 수평 마사지 베드에 편하게 엎드린 성인 남성 고객과 옷 위로 등·어깨를 관리하는 성인 여성 관리사를 사용한다. 체어 마사지, 얼굴을 기계·장치에 밀어 넣는 구도, 남성 관리사, 의료 장비처럼 보이는 소품은 사용하지 않는다.
- 토닥이 계열을 제외한 플랫폼의 마사지 서비스 이미지에서 마사지사는 항상 성인 여성으로 표현한다. 코스 대상 고객의 성별과 마사지사의 성별을 혼동하지 않는다.
- 쓸데없는 수식, 과장, 후기·평점·인기·최고 표현, 배정·출발·도착 시간 약속, 의료 효능 표현을 고객 문구에 넣지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
