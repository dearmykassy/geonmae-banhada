import { COURSE_SCORES, formatWon } from "@/lib/business";

export const SERVICE_STEPS = [
  ["01", "받을 곳 조회", "지역 검색에 주소의 행정구역을 입력해 해당 안내 페이지를 엽니다."],
  ["02", "통화 내용 전달", "도로명 주소와 건물명, 원하는 날짜·시각, 인원을 말합니다."],
  ["03", "시간표 대조", "공개 가격표에서 고른 코스와 이용 시간을 알리고 일정 여부를 확인합니다."],
  ["04", "이용 장소에서 결제", "일정을 마친 다음 현금이나 무선 카드 단말기로 처리합니다."],
] as const;

export const SERVICE_FAQS = [
  ["먼저 입금할 금액이 있나요?", "없습니다. 비용은 이용을 마친 장소에서 후불로 정산합니다."],
  ["주소에 맞는 페이지는 어떻게 찾나요?", "검색창에 시·군·구, 동·읍·면 또는 지역 별칭을 입력하면 상세 페이지가 표시됩니다."],
  ["통화에 필요한 내용은 무엇인가요?", "실제 받을 주소, 가능한 날짜와 시각, 인원, 선택한 코스와 이용 시간을 준비하면 됩니다."],
  ["현금 외 결제도 되나요?", "현장에 가져가는 무선 단말기로 카드 결제를 할 수 있습니다."],
  ["2인 신청도 받나요?", "커플과 부부를 대상으로 한 2인 동시 관리 프로그램을 상담할 수 있습니다."],
  ["전화는 몇 시까지 받나요?", "전화 창구는 365일 24시간 열려 있습니다."],
  ["사용 물품의 위생 기준은 무엇인가요?", "일회용 비품을 쓰며 관리 전과 후에 소독합니다."],
] as const;

export const NOTICE_ITEMS = [
  {
    slug: "phone-consultation",
    title: "전화 창구 운영 시간",
    summary: "0508-202-3906 번호는 365일 24시간 상담을 받습니다.",
  },
  {
    slug: "consultation-details",
    title: "통화에서 확인하는 항목",
    summary: "받을 주소와 가능한 시각, 인원, 코스명과 이용 시간을 서로 맞춥니다.",
  },
  {
    slug: "onsite-payment",
    title: "사전 송금 없는 후불 방식",
    summary: "예약금을 요구하지 않으며 비용은 이용을 마친 장소에서 처리합니다.",
  },
  {
    slug: "card-payment",
    title: "무선 단말기 결제",
    summary: "현금 또는 현장용 무선 카드 단말기 중에서 결제 방식을 고를 수 있습니다.",
  },
] as const;

export const COURSE_GROUPS = [...new Set(COURSE_SCORES.map((item) => item.course))].map(
  (course) => ({
    course,
    options: COURSE_SCORES.filter((item) => item.course === course).map((item) => ({
      minutes: item.minutes,
      price: formatWon(item.price),
    })),
  }),
);
