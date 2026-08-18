import {
  getDirectChildren,
  getKeywordRegionLabel,
  getParentNode,
  getRegionOrdinal,
  getSearchRegionLabel,
  shortenRegionSearchName,
  type RegionNode,
} from "@/lib/regions";

export const REGION_KEYWORD_SUFFIXES = [
  "출장마사지",
  "출장안마",
  "출장타이마사지",
  "출장스웨디시",
  "출장홈타이",
  "건마에반하다",
  "남성전용마사지",
  "여성전용마사지",
] as const;

export type ContentSection = {
  id: string;
  heading: string;
  paragraphs: [string, string];
};

export type RegionContent = {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  eyebrow: string;
  hooks: [string, string];
  sections: ContentSection[];
  ctaLabels: [string, string, string];
};

const TITLE_PATTERNS = [
  (name: string, key: string) => `건마에반하다 ${name} | ${key}출장마사지 코스·가격`,
  (name: string, key: string) => `${name} 건마에반하다 | ${key}출장안마 이용 정보`,
  (name: string, key: string) => `건마에반하다 ${name} 가격표 | ${key}출장마사지`,
  (name: string, key: string) => `${key}출장마사지 코스 안내 | 건마에반하다 ${name}`,
  (name: string, key: string) => `${name} 출장마사지 전화 안내 | ${key} 건마에반하다`,
  (name: string, key: string) => `건마에반하다 ${name} 이용 안내 | ${key}출장안마`,
  (name: string, key: string) => `${key}출장홈타이 시간·금액 | 건마에반하다 ${name}`,
  (name: string, key: string) => `${name} 코스·현장결제 안내 | ${key} 건마에반하다`,
  (name: string, key: string) => `건마에반하다 ${name} 지역 안내 | ${key}출장마사지`,
  (name: string, key: string) => `${key}출장안마 가격 확인 | 건마에반하다 ${name}`,
  (name: string, key: string) => `${name} 24시간 전화상담 | ${key} 건마에반하다`,
] as const;

const H1_PATTERNS = [
  (name: string) => `${name} 출장마사지 코스와 가격`,
  (name: string) => `${name} 건마에반하다 이용 정보`,
  (name: string) => `${name} 출장마사지 전화상담 안내`,
  (name: string) => `${name} 코스 시간과 현장 결제`,
  (name: string) => `${name} 출장홈타이 이용 전 확인사항`,
  (name: string) => `${name} 받을 주소와 희망 일정`,
  (name: string) => `${name} 건마에반하다 공개 금액`,
  (name: string) => `${name} 출장마사지 지역 안내`,
  (name: string) => `${name} 코스 선택과 이용 절차`,
  (name: string) => `${name} 현장 후불 이용 안내`,
  (name: string) => `${name} 출장마사지 문의 항목`,
] as const;

const INTRO_PATTERNS = [
  (name: string) => `${name}에서 이용할 주소를 기준으로 지역 페이지를 확인하고, 희망 날짜와 시작 시각은 전화로 문의해 주세요.`,
  (name: string) => `${name} 서비스 문의에는 도로명 주소, 희망 시각, 이용 인원과 코스 후보가 필요합니다.`,
  (name: string) => `${name} 지역의 코스별 시간과 공개 금액, 현장 결제 기준을 이 페이지에서 확인할 수 있습니다.`,
  (name: string) => `${name} 이용 가능 여부는 정확한 주소와 희망 시간을 전달한 뒤 전화상담에서 확인합니다.`,
  (name: string) => `${name} 출장마사지 상담 전에 주소와 코스 시간을 정리하면 확인할 항목을 빠뜨리지 않습니다.`,
  (name: string) => `${name} 기준 지역 안내와 가격표를 먼저 보고, 실제 일정은 24시간 전화상담으로 확인해 주세요.`,
  (name: string) => `${name} 서비스 주소가 정해졌다면 코스, 이용 시간, 결제 방법을 차례대로 확인하면 됩니다.`,
  (name: string) => `${name} 출장마사지 문의에 필요한 지역 범위와 코스 가격을 확인할 수 있도록 정리했습니다.`,
  (name: string) => `${name} 이용 전에는 주소 표기와 희망 시각을 확인하고 원하는 코스의 금액을 살펴보세요.`,
  (name: string) => `${name} 전화상담에서는 서비스 주소와 일정, 인원, 코스 시간을 기준으로 가능 여부를 확인합니다.`,
  (name: string) => `${name} 지역 페이지에서 하위 지역과 가격표를 확인한 뒤 필요한 내용을 전화로 문의해 주세요.`,
] as const;

const DETAIL_PATTERNS = [
  (name: string) => `${name} 주소는 시·군·구와 읍·면·동, 도로명, 건물명 순서로 준비해 주세요.`,
  (name: string) => `${name} 동일 지명이 다른 행정구역에도 있다면 상위 지역까지 확인해야 합니다.`,
  (name: string) => `${name} 서비스 범위는 화면의 지역명보다 실제 이용 주소를 기준으로 확인합니다.`,
  (name: string) => `${name} 하위 지역이 표시되면 서비스 장소의 주소와 같은 항목을 선택해 주세요.`,
  (name: string) => `${name} 지역명만으로 판단하지 말고 도로명과 건물명을 함께 전달해 주세요.`,
  (name: string) => `${name} 페이지를 선택한 뒤에도 상세 주소는 전화상담에서 다시 확인합니다.`,
  (name: string) => `${name} 주소가 변경되면 기존 문의와 구분해 새 주소를 알려 주세요.`,
  (name: string) => `${name}의 공동현관이나 출입 관련 정보는 주소 뒤에 따로 설명해 주세요.`,
  (name: string) => `${name} 검색 결과가 여러 개면 전체 행정명과 서비스 주소를 대조해 주세요.`,
  (name: string) => `${name} 이용 장소의 동·호수는 공개 화면이 아닌 전화상담에서 전달해 주세요.`,
  (name: string) => `${name} 지역 선택은 실제 서비스 주소의 행정구역 표기를 따릅니다.`,
] as const;

type RegionalMetaPattern = (fullName: string, scope: string) => string;

const DESCRIPTION_PATTERNS: readonly RegionalMetaPattern[] = [
  (name, scope) => `${name} 출장마사지의 코스별 시간·금액과 현장 후불·카드 결제 기준을 확인할 수 있도록 안내합니다. ${scope}`,
  (name, scope) => `건마에반하다 ${name} 지역의 서비스 주소 확인 순서, 공개 가격표와 24시간 전화상담 정보를 정리했습니다. ${scope}`,
  (name, scope) => `${name} 출장마사지 문의 전에 주소·희망 시각·코스 시간을 확인하고 현장 결제 기준을 살펴보세요. ${scope}`,
  (name, scope) => `${name} 건마에반하다 이용에 필요한 지역 확인, 코스별 공개 금액, 선입금 없는 현장 후불 안내입니다. ${scope}`,
  (name, scope) => `${name} 출장홈타이의 주소 전달 항목과 코스 시간표, 현장 카드 결제 여부를 확인할 수 있습니다. ${scope}`,
  (name, scope) => `건마에반하다 ${name} 페이지에서 이용 지역과 코스·시간별 금액, 전화상담 전달 항목을 확인하세요. ${scope}`,
  (name, scope) => `${name} 출장마사지의 이용 주소와 일정 확인 방법, 공개 코스 가격과 서비스 종료 후 결제 기준입니다. ${scope}`,
  (name, scope) => `${name} 건마에반하다 지역 안내입니다. 24시간 전화상담 전에 주소, 인원, 코스와 이용 시간을 준비해 주세요. ${scope}`,
  (name, scope) => `${name} 출장마사지 코스와 가격을 확인하고 서비스 주소와 희망 시각을 전화로 문의하는 순서를 안내합니다. ${scope}`,
  (name, scope) => `건마에반하다 ${name} 이용 전 확인할 주소·일정·코스 정보와 100% 현장 후불·카드 결제 기준입니다. ${scope}`,
  (name, scope) => `${name} 출장마사지 지역 페이지입니다. 코스별 이용 시간과 금액, 주소 확인 및 현장 결제 절차를 정리했습니다. ${scope}`,
];

const SECOND_HOOK_PATTERNS: readonly RegionalMetaPattern[] = [
  (name, scope) => `${scope} ${name} 일정은 정확한 주소와 희망 시각을 전화로 전달한 뒤 확인합니다.`,
  (name, scope) => `${name} 문의는 서비스 주소부터 확인합니다. ${scope}`,
  (name, scope) => `${scope} ${name}에서 가능한 코스와 시작 시각은 전화상담 내용으로 확정합니다.`,
  (name, scope) => `${name} 서비스 여부는 화면의 지역명만으로 정하지 않습니다. ${scope}`,
  (name, scope) => `${scope} ${name} 상담에는 도로명 주소와 희망 날짜·시각이 필요합니다.`,
  (name, scope) => `${name} 페이지에서 지역 범위를 확인한 다음 전화로 상세 주소를 전달해 주세요. ${scope}`,
  (name, scope) => `${scope} ${name} 이용 시간과 코스는 공개 가격표를 본 뒤 상담에서 확인합니다.`,
  (name, scope) => `${name} 일정 확인 전 서비스 주소와 이용 인원을 준비해 주세요. ${scope}`,
  (name, scope) => `${scope} ${name} 문의 시 주소, 시작 시각, 코스 후보를 차례로 전달합니다.`,
  (name, scope) => `${name}에서 주소나 시각이 바뀌면 변경된 내용을 다시 알려 주세요. ${scope}`,
  (name, scope) => `${scope} ${name} 이용 가능 여부와 최종 일정은 24시간 전화상담에서 확인합니다.`,
];

type RegionSentence = (fullName: string, displayName: string) => string;

const REQUEST_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 문의에는 서비스를 받을 주소, 희망 날짜와 시작 시각, 이용 인원, 코스명을 전달합니다.`,
  (name) => `${name} 상담을 시작할 때 받을 곳의 도로명 주소와 희망 시각을 먼저 알려 주세요.`,
  (name) => `${name} 일정 확인에는 상세 주소와 날짜, 대략적인 시작 시간, 이용 인원이 필요합니다.`,
  (name) => `${name} 전화 문의 전 주소·희망 시각·인원·코스 후보를 한 줄씩 적어 두면 됩니다.`,
  (name) => `${name} 서비스 가능 여부는 받을 주소와 원하는 시작 시각을 기준으로 확인합니다.`,
  (name) => `${name} 상담 시 주소를 먼저 전달하고 이어서 날짜, 시각, 인원과 코스를 말해 주세요.`,
  (name) => `${name} 이용 문의는 서비스 주소와 희망 일정, 이용 인원, 선택할 코스 순서로 진행합니다.`,
];

const REQUEST_SECOND: readonly RegionSentence[] = [
  (name) => `${name} 건물 출입에 필요한 내용은 도로명과 건물명을 말한 뒤 별도로 전달합니다.`,
  (name) => `${name} 주소에 같은 건물명이 있으면 도로명과 건물 번호까지 함께 확인해 주세요.`,
  (name) => `${name} 숙소나 공동주택은 건물명과 출입 관련 내용을 주소와 구분해 알려 주세요.`,
  (name) => `${name}의 동·호수처럼 공개 화면에 남기기 어려운 정보는 전화에서 전달합니다.`,
  (name) => `${name} 상담 중 주소가 달라지면 변경된 도로명과 건물명을 다시 확인해 주세요.`,
  (name) => `${name} 출입 안내가 있다면 주소 확인이 끝난 뒤 필요한 내용만 덧붙이면 됩니다.`,
  (name) => `${name} 상세 주소는 지역 페이지 선택과 별개로 통화에서 다시 맞춥니다.`,
];

const COURSE_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 가격표는 타이·아로마·힐링·스페셜·남성전용 코스를 시간별로 구분합니다.`,
  (name) => `${name} 문의 전 공개 가격표에서 코스명과 60분·90분·120분 항목을 확인할 수 있습니다.`,
  (name) => `${name} 코스는 다섯 종류이며 각 코스에 표시된 시간과 금액을 한 항목으로 봅니다.`,
  (name) => `${name} 이용 시간은 코스별 가격표에 표시된 분 단위로 선택합니다.`,
  (name) => `${name} 페이지의 가격 안내는 코스명, 이용 시간, 공개 금액 순서로 읽으면 됩니다.`,
  (name) => `${name} 상담 전에 다섯 코스 가운데 후보와 이용 시간을 정해 두세요.`,
  (name) => `${name} 코스 선택은 공개된 코스명과 시간표를 기준으로 합니다.`,
];

const COURSE_SECOND: readonly RegionSentence[] = [
  (name) => `${name} 희망 시각에 선택한 코스가 가능한지는 전화상담에서 확인합니다.`,
  (name) => `${name} 가격표에 없는 시간 조합은 임의로 계산하지 않고 통화에서 문의합니다.`,
  (name) => `${name} 상담에서는 고른 코스명과 이용 시간을 그대로 전달해 주세요.`,
  (name) => `${name} 일정과 코스 확정 전에는 시간별 금액을 각각 확인해 주세요.`,
  (name) => `${name} 코스 후보가 둘 이상이면 우선순위와 각 이용 시간을 함께 말하면 됩니다.`,
  (name) => `${name} 이용 시간 변경 시 금액도 달라질 수 있으므로 가격표를 다시 확인합니다.`,
  (name) => `${name} 현재 가능한 시간과 선택 코스는 통화 내용으로 최종 확인합니다.`,
];

const PAYMENT_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 공개 금액은 코스와 이용 시간 조합별로 정해져 있습니다.`,
  (name) => `${name} 가격은 가격표에 표시된 코스명과 이용 시간별 항목을 기준으로 합니다.`,
  (name) => `${name} 이용 금액을 확인할 때는 코스와 시간을 함께 대조해 주세요.`,
  (name) => `${name} 가격표에 없는 항목은 기존 금액을 더하거나 나눠 계산하지 않습니다.`,
  (name) => `${name} 코스별 첫 금액과 전체 시간표는 가격 안내 페이지에서 확인합니다.`,
  (name) => `${name} 상담 전 가격표에서 선택한 항목의 코스명·시간·금액을 확인해 주세요.`,
  (name) => `${name} 공개 가격은 같은 코스라도 이용 시간에 따라 구분됩니다.`,
];

const PAYMENT_SECOND: readonly RegionSentence[] = [
  (name) => `${name} 이용은 예약금이나 선입금 없이 종료 뒤 현장에서 결제하며 카드도 사용할 수 있습니다.`,
  (name) => `${name} 결제는 서비스를 마친 뒤 현장에서 진행하고 현장 카드 결제를 지원합니다.`,
  (name) => `${name} 사전 송금 없이 현장 후불로 정산하며 카드 결제 여부도 상담에서 확인할 수 있습니다.`,
  (name) => `${name} 선결제는 받지 않으며 이용이 끝난 뒤 현금 또는 현장 카드로 결제합니다.`,
  (name) => `${name} 정산 시점은 서비스 종료 후이며 무선 단말기를 통한 카드 결제가 가능합니다.`,
  (name) => `${name} 예약 단계에서 입금하지 않고 이용 완료 뒤 현장에서 금액을 정산합니다.`,
  (name) => `${name} 결제 방식은 100% 현장 후불이고 카드 이용도 가능합니다.`,
];

const PROCESS_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 문의는 지역 선택, 상세 주소, 희망 일정, 인원, 코스 확인 순서로 진행합니다.`,
  (name) => `${name} 페이지에서 지역과 가격을 본 뒤 전화로 주소와 희망 시각을 전달합니다.`,
  (name) => `${name} 이용 절차는 주소 확인부터 시작해 일정과 코스를 정하는 단계로 이어집니다.`,
  (name) => `${name} 지역 페이지 선택 후 상세 주소와 시간을 전달하고 가능한 일정을 확인합니다.`,
  (name) => `${name} 상담에서는 주소를 확인한 다음 이용 인원과 코스, 시간을 맞춥니다.`,
  (name) => `${name} 주소와 일정 확인이 끝나면 선택한 코스와 이용 시간을 다시 대조합니다.`,
  (name) => `${name} 이용 전 확인 항목은 주소, 날짜·시각, 인원, 코스와 시간입니다.`,
];

const PROCESS_SECOND: readonly RegionSentence[] = [
  (name) => `${name} 상담에서 확인한 일정에 따라 이용하고 종료 뒤 현장에서 결제합니다.`,
  (name) => `${name} 이용 가능 여부를 확인한 뒤 현장 관리와 후불 결제 순서로 진행합니다.`,
  (name) => `${name} 확정된 주소와 시각을 기준으로 이용하며 정산은 마지막에 합니다.`,
  (name) => `${name} 전화에서 맞춘 코스와 시간으로 진행한 뒤 현장에서 금액을 정산합니다.`,
  (name) => `${name} 서비스가 끝나기 전에는 별도 선입금 절차가 없습니다.`,
  (name) => `${name} 이용 종료 뒤 선택한 방식으로 현장 결제를 진행합니다.`,
  (name) => `${name} 현장에서는 상담에서 확인한 코스와 시간을 기준으로 이용합니다.`,
];

const CONFIRM_FIRST: readonly RegionSentence[] = [
  (name) => `${name} 주소나 희망 시각, 인원, 코스가 바뀌면 변경 내용을 전화로 다시 전달해 주세요.`,
  (name) => `${name} 상담 뒤 주소가 달라졌다면 새 주소를 기준으로 일정 여부를 재확인합니다.`,
  (name) => `${name} 코스 또는 이용 시간을 바꿀 때는 변경된 항목의 금액도 다시 확인합니다.`,
  (name) => `${name} 이용 인원이나 시작 시각 변경은 기존 상담 내용과 구분해 알려 주세요.`,
  (name) => `${name} 예약 내용에 변동이 생기면 주소·시각·코스 가운데 달라진 항목을 말합니다.`,
  (name) => `${name} 출입 정보가 추가되면 방문 전 전화상담에 반영해 주세요.`,
  (name) => `${name} 일정 변경 요청에는 현재 주소와 새 희망 시각을 함께 전달합니다.`,
];

const CONFIRM_SECOND: readonly RegionSentence[] = [
  (name) => `${name} 통화를 마치기 전 주소, 시작 시각, 코스·시간과 결제 방식을 확인합니다.`,
  (name) => `${name} 최종 확인 항목은 받을 주소와 일정, 인원, 코스, 현장 결제입니다.`,
  (name) => `${name} 상담 마지막에 선택한 코스의 시간과 금액을 한 번 더 대조해 주세요.`,
  (name) => `${name} 이용 전에는 현재 주소와 희망 시각이 맞는지 다시 확인합니다.`,
  (name) => `${name} 전화 종료 전에 현장 후불과 카드 결제 여부까지 확인하면 됩니다.`,
  (name) => `${name} 주소와 일정 확인이 끝났다면 코스명과 이용 시간을 마지막으로 맞춥니다.`,
  (name) => `${name} 전달한 내용과 안내받은 내용을 통화가 끝나기 전에 대조해 주세요.`,
];

function pick<T>(values: readonly T[], ordinal: number, offset = 0): T {
  return values[(ordinal * 5 + offset * 3) % values.length];
}

function stableNodeIndex(node: RegionNode, salt: number, length: number): number {
  let hash = 2166136261;
  const input = `${node.path}\u001f${salt}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function regionSentence(
  values: readonly RegionSentence[],
  node: RegionNode,
  ordinal: number,
  offset: number,
): string {
  void ordinal;
  return values[stableNodeIndex(node, offset, values.length)](
    node.qualifiedName,
    node.displayName,
  );
}

function metadataScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const examples = children
      .slice(0, 2)
      .map((child) => shortenRegionSearchName(child.name))
      .join("·");
    if (!examples) return `하위 지역 ${children.length}개가 연결되어 있습니다.`;
    return children.length > 2
      ? `하위 지역 ${children.length}개가 연결되어 있으며 ${examples} 등을 확인할 수 있습니다.`
      : `하위 지역 ${children.length}개가 연결되어 있으며 ${examples} 지역으로 이어집니다.`;
  }

  const sourceNames = node.representative?.sourceNames ?? [];
  if (sourceNames.length > 1) {
    return `${sourceNames.slice(0, 3).map(shortenRegionSearchName).join("·")} 행정동 정보를 함께 반영했습니다.`;
  }

  const parent = getParentNode(node);
  if (parent) {
    return `${shortenRegionSearchName(parent.qualifiedName)}에 연결된 세부 지역 페이지입니다.`;
  }

  return "실제 서비스 주소는 도로명과 건물명까지 전화로 확인합니다.";
}

function hookScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const examples = children.slice(0, 3).map((child) => child.name).join("·");
    const suffix = children.length > 3 ? " 등" : "";
    return `${examples || node.displayName}${suffix} ${children.length}개 하위 지역을 이 페이지에서 선택할 수 있습니다.`;
  }

  const sourceNames = node.representative?.sourceNames ?? [];
  if (sourceNames.length > 1) {
    return `${sourceNames.slice(0, 3).join("·")} 행정동을 묶어 안내합니다.`;
  }

  const parent = getParentNode(node);
  return parent
    ? `${parent.qualifiedName}에서 ${node.displayName}으로 이어지는 지역 안내입니다.`
    : "상세 주소는 공개 화면이 아닌 전화상담에서 확인합니다.";
}

function localScope(node: RegionNode): string {
  const children = getDirectChildren(node);
  if (children.length > 0) {
    const examples = children.slice(0, 3).map((child) => child.name).join("·");
    return `${node.qualifiedName} 페이지에는 ${children.length}개 하위 지역이 연결되어 있습니다${examples ? `: ${examples}${children.length > 3 ? " 외" : ""}` : ""}.`;
  }
  const sourceNames = node.representative?.sourceNames ?? [];
  if (sourceNames.length > 1) {
    return `${node.qualifiedName} 안내에는 ${sourceNames.slice(0, 4).join("·")} 행정동 정보가 함께 반영되어 있습니다.`;
  }
  return `${node.qualifiedName} 상세 페이지는 도로명과 건물명을 전화로 확인하는 단계까지 안내합니다.`;
}

function section(id: string, heading: string, first: string, second: string): ContentSection {
  return { id, heading, paragraphs: [first, second] };
}

export function createRegionContent(node: RegionNode): RegionContent {
  const ordinal = getRegionOrdinal(node);

  const keywordLabel = getKeywordRegionLabel(node);
  const searchName = getSearchRegionLabel(node);
  const fullName = node.qualifiedName;
  const title = pick(TITLE_PATTERNS, ordinal)(searchName, keywordLabel);
  const h1 = pick(H1_PATTERNS, ordinal, 1)(fullName);
  const intro = pick(INTRO_PATTERNS, ordinal, 2)(fullName);
  const detail = pick(DETAIL_PATTERNS, ordinal, 3)(fullName);
  const description = DESCRIPTION_PATTERNS[
    stableNodeIndex(node, 101, DESCRIPTION_PATTERNS.length)
  ](searchName, metadataScope(node));
  const secondHook = SECOND_HOOK_PATTERNS[
    stableNodeIndex(node, 211, SECOND_HOOK_PATTERNS.length)
  ](fullName, hookScope(node));

  return {
    title,
    description,
    keywords: REGION_KEYWORD_SUFFIXES.map((suffix) => `${keywordLabel}${suffix}`),
    h1,
    eyebrow: "GEONMAE BANHADA · AREA GUIDE",
    hooks: [intro, secondHook],
    sections: [
      section("local-boundary", `${fullName} 안내 지역 범위`, localScope(node), detail),
      section(
        "request-details",
        `${fullName} 전화상담 전달 항목`,
        regionSentence(REQUEST_FIRST, node, ordinal, 4),
        regionSentence(REQUEST_SECOND, node, ordinal, 5),
      ),
      section(
        "course-duration",
        `${fullName} 코스와 이용 시간`,
        regionSentence(COURSE_FIRST, node, ordinal, 6),
        regionSentence(COURSE_SECOND, node, ordinal, 7),
      ),
      section(
        "price-payment",
        `${fullName} 공개 가격과 결제 기준`,
        regionSentence(PAYMENT_FIRST, node, ordinal, 8),
        regionSentence(PAYMENT_SECOND, node, ordinal, 9),
      ),
      section(
        "visit-process",
        `${fullName} 문의부터 현장 결제까지`,
        regionSentence(PROCESS_FIRST, node, ordinal, 10),
        regionSentence(PROCESS_SECOND, node, ordinal, 11),
      ),
      section(
        "confirmation",
        `${fullName} 변경 사항 최종 확인`,
        regionSentence(CONFIRM_FIRST, node, ordinal, 12),
        regionSentence(CONFIRM_SECOND, node, ordinal, 13),
      ),
    ],
    ctaLabels: [
      "전화상담",
      "코스·가격 보기",
      node.kind === "representative" ? "상위 지역 보기" : "하위 지역 보기",
    ],
  };
}
