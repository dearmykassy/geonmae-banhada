import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { COURSE_GROUPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/pricing/",
  "건마에반하다 가격표 | 5개 출장마사지 코스·14개 금액",
  "건마에반하다의 타이·아로마·힐링·스페셜·남성전용 코스 14개 시간표와 현장 후불·카드 결제 방식을 확인합니다.",
  ["건마에반하다 14개 가격", "출장마사지 공개 금액", "출장마사지 코스 시간", "현장 후불 정산"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

const PRICE_STATS = [
  ["코스 구분", "5개"],
  ["가격 항목", "14개"],
  ["결제 시점", "이용 후"],
] as const;

export default function PricingPage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>GEONMAE BANHADA · COURSE &amp; PRICE</p>
            <h1>5개 코스·14개 <br />공개 금액표</h1>
            <p className={"t4-fixed-heroLead"}>
              타이·아로마·힐링·스페셜은 60분, 90분, 120분으로 나뉩니다.
              남성전용은 60분과 90분 두 항목이며 날짜별 일정은 통화에서 확인합니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="공개 금액 구성">
            {PRICE_STATS.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="course-price-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>PRICE TABLE</p>
              <h2 id="course-price-title">시간별 공개 금액</h2>
              <p>원하는 코스의 이용 시간과 표시 금액을 한 줄씩 대조할 수 있습니다.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/guide/">이용 방법 →</Link>
          </div>
          <div className={"t4-fixed-courseGrid"}>
            {COURSE_GROUPS.map((group, index) => (
              <article className={"t4-fixed-courseCard"} key={group.course}>
                <header>
                  <span className={"t4-fixed-courseIndex"}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{group.course}</h3>
                </header>
                <ul>
                  {group.options.map((option) => (
                    <li key={option.minutes}>
                      <b>{option.minutes}분</b>
                      <strong>{option.price}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={"t4-fixed-calloutGrid"} aria-label="정산 방식과 통화 준비">
          <div className={"t4-fixed-callout"}>
            <p className={"t4-fixed-sectionKicker"}>PAYMENT</p>
            <h2>미리 보내는 금액은 없습니다.</h2>
            <p>
              비용은 이용을 마친 장소에서 정산합니다. 현금 또는 현장용 무선 카드 단말기를 사용할 수 있습니다.
            </p>
            <div className={"t4-fixed-buttonRow"}>
              <a className={"t4-fixed-button"} href={PHONE_HREF}>전화 문의</a>
              <Link className={"t4-fixed-buttonAlt"} href="/areas/">운영 지역</Link>
            </div>
          </div>
          <aside className={"t4-fixed-infoCard"}>
            <span>BEFORE YOU CALL</span>
            <strong>받을 주소 · 시각 · 인원</strong>
            <p>
              도로명 주소와 건물명, 가능한 날짜·시각, 인원, 고른 코스와 이용 시간을 통화 중에 알려 주세요.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
