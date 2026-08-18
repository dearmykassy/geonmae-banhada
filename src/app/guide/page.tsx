import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/business";
import { createRouteMetadataContract, toNextMetadata } from "@/lib/metadata";
import { SERVICE_FAQS, SERVICE_STEPS } from "@/lib/site-content";

export const metadataContract = createRouteMetadataContract(
  "/guide/",
  "건마에반하다 이용 순서 | 주소 조회·시간표·후불 결제",
  "건마에반하다 이용 전 준비할 실제 주소와 가능한 시각, 인원, 코스·이용 시간 및 현장 후불 결제 순서를 확인합니다.",
  ["건마에반하다 준비 순서", "출장마사지 통화 준비", "출장마사지 현장 후불", "출장마사지 무선 단말기"],
);
export const metadata: Metadata = toNextMetadata(metadataContract);

const OPERATING_STANDARDS = [
  ["CALL", "하루 24시간 접수", "365일 동안 시간대 구분 없이 전화 창구를 운영합니다."],
  ["PAYMENT", "일정을 마친 뒤 정산", "사전에 예약금을 보내지 않고 이용 장소에서 후불로 처리합니다."],
  ["CARD", "현장용 카드 단말기", "현금 대신 무선 단말기로 카드를 결제할 수 있습니다."],
  ["TWO PERSON & HYGIENE", "2인 이용 · 비품 관리", "커플·부부 2인 동시 프로그램, 일회용 비품, 관리 전후 소독을 운영 기준으로 둡니다."],
] as const;

export default function GuidePage() {
  return (
    <main className={"t4-fixed-page"}>
      <div className={"t4-fixed-frame"}>
        <header className={"t4-fixed-hero"}>
          <div className={"t4-fixed-heroCopy"}>
            <p className={"t4-fixed-eyebrow"}>GEONMAE BANHADA · SERVICE GUIDE</p>
            <h1>통화에 앞서 <br />적어둘 내용</h1>
            <p className={"t4-fixed-heroLead"}>
              실제 받을 주소, 가능한 날짜와 시각, 인원, 코스명과 이용 시간을 적고 전화에서 일정 여부를 맞춥니다.
            </p>
          </div>
          <div className={"t4-fixed-statRow"} aria-label="통화 준비 세 항목">
            <div><span>장소</span><strong>도로명 · 건물명</strong></div>
            <div><span>일정</span><strong>날짜 · 시각</strong></div>
            <div><span>선택</span><strong>코스 · 시간</strong></div>
          </div>
        </header>

        <section className={"t4-fixed-section"} aria-labelledby="guide-process-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>STEP BY STEP</p>
              <h2 id="guide-process-title">네 단계 확인표</h2>
              <p>주소 조회, 통화, 시간표 대조, 현장 정산 순서입니다.</p>
            </div>
            <Link className={"t4-fixed-textLink"} href="/pricing/">코스 가격 →</Link>
          </div>
          <ol className={"t4-fixed-steps"}>
            {SERVICE_STEPS.map(([number, title, copy]) => (
              <li key={number}>
                <span className={"t4-fixed-stepNumber"}>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={"t4-fixed-section"} aria-labelledby="guide-standard-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>SERVICE STANDARD</p>
              <h2 id="guide-standard-title">공통 적용 기준</h2>
              <p>전화 창구와 결제 수단, 2인 이용, 비품 관리에 적용되는 내용입니다.</p>
            </div>
          </div>
          <div className={"t4-fixed-standardGrid"}>
            {OPERATING_STANDARDS.map(([label, title, copy]) => (
              <article className={"t4-fixed-standardCard"} key={label}>
                <span>{label}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={"t4-fixed-section"} aria-labelledby="guide-faq-title">
          <div className={"t4-fixed-sectionHeader"}>
            <div>
              <p className={"t4-fixed-sectionKicker"}>FAQ</p>
              <h2 id="guide-faq-title">질문별 답변</h2>
              <p>선입금, 주소 검색, 통화 준비, 결제 수단, 2인 이용과 비품 기준을 확인할 수 있습니다.</p>
            </div>
          </div>
          <div className={"t4-fixed-faqList"}>
            {SERVICE_FAQS.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary><span>{question}</span><b aria-hidden="true">+</b></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`${"t4-fixed-section"} ${"t4-fixed-contactPanel"}`} aria-label="일정 확인 전화 연결">
          <p className={"t4-fixed-sectionKicker"}>24H CONSULTATION</p>
          <h2>받을 곳과 가능한 시각을 알려 주세요.</h2>
          <p>도로명 주소·건물명, 날짜·시각, 인원, 코스명·이용 시간을 한 번에 전달하면 됩니다.</p>
          <div className={"t4-fixed-buttonRow"}>
            <a className={"t4-fixed-button"} href={PHONE_HREF}>{PHONE_DISPLAY} 문의</a>
            <Link className={"t4-fixed-buttonAlt"} href="/areas/">지역 목록</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
