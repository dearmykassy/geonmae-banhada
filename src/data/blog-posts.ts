import type { Metadata } from "next";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/metadata";

export type BlogPost = {
  slug: "masaji-shop-gagi-himdeul-ttae" | "jibeseo-masaji-badeul-su-issnayo";
  category: string;
  title: string;
  description: string;
  keywords: readonly string[];
  publishedAt: string;
  modifiedAt: string;
  intro: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
  checklist: readonly string[];
  relatedSlug: BlogPost["slug"];
  image: {
    assetId: "geonmae-note-01" | "geonmae-note-02";
    src: string;
    alt: string;
  };
};

export const BLOG_POSTS = [
  {
    slug: "masaji-shop-gagi-himdeul-ttae",
    category: "외출이 어려운 날",
    title: "샵 방문 대신 출장 문의를 할 때 적어둘 내용",
    description:
      "샵까지 이동하기 어려운 날, 머무는 주소와 가능한 시각을 기준으로 출장마사지 코스·이용 시간·현장 후불 항목을 준비하는 방법입니다.",
    keywords: [
      "건마에반하다",
      "출장마사지 이용 방법",
      "출장마사지 코스",
      "출장마사지 현장 결제",
    ],
    publishedAt: "2026-08-17T00:00:00+09:00",
    modifiedAt: "2026-08-17T00:00:00+09:00",
    intro:
      "샵 방문에는 왕복 이동과 준비 시간이 듭니다. 그 시간을 내기 어렵다면 현재 머무는 주소, 비어 있는 시간대, 원하는 코스를 메모한 뒤 출장 가능 여부를 전화로 확인하면 됩니다.",
    sections: [
      {
        heading: "왕복 시간을 빼고 비어 있는 구간 적기",
        paragraphs: [
          "다음 일정 전까지 남은 시간을 먼저 확인합니다. 가격표의 60분·90분·120분 항목 가운데 일정에 맞는 시간을 고르면 됩니다.",
          "시작 시각 하나로 정하기 어렵다면 가능한 범위를 두 개 정도 적어도 됩니다. 확정 가능한 일정은 통화에서 맞춥니다.",
        ],
      },
      {
        heading: "코스명과 이용 시간을 한 줄로 기록하기",
        paragraphs: [
          "타이·아로마·힐링·스페셜은 세 가지 이용 시간, 남성전용은 60분과 90분 금액이 공개되어 있습니다.",
          "예를 들어 ‘아로마 90분’처럼 이름과 이용 시간을 함께 적으면 통화 중 다른 항목과 혼동하지 않습니다.",
        ],
      },
      {
        heading: "현재 머무는 장소의 실제 주소 확인하기",
        paragraphs: [
          "상권명이나 가까운 역 이름만으로는 받을 곳을 특정하기 어렵습니다. 도로명 주소와 건물명을 준비해야 합니다.",
          "날짜, 가능한 시각, 인원까지 주소와 함께 알립니다. 전화 접수는 365일 24시간 운영합니다.",
        ],
      },
      {
        heading: "비용은 일정을 마친 장소에서 처리하기",
        paragraphs: [
          "예약금이나 선결제를 따로 보내지 않습니다. 이용을 마친 뒤 같은 장소에서 후불로 정산합니다.",
          "현금과 카드 중에서 선택할 수 있으며 카드는 현장용 무선 단말기로 처리합니다.",
        ],
      },
    ],
    checklist: ["비어 있는 날짜·시간대", "현재 장소의 도로명 주소", "이용 인원", "코스명과 이용 시간"],
    relatedSlug: "jibeseo-masaji-badeul-su-issnayo",
    image: {
      assetId: "geonmae-note-01",
      src: "/images/geonmae-template4/blog/note-01.webp",
      alt: "정돈된 실내 거울 앞에서 휴대전화를 확인하는 성인 여성",
    },
  },
  {
    slug: "jibeseo-masaji-badeul-su-issnayo",
    category: "집·숙소 주소 문의",
    title: "집이나 숙소 주소로 문의할 때 확인할 순서",
    description:
      "집과 숙소에서 출장마사지를 받을 때 장소 종류에 맞는 주소, 출입 안내, 일정·인원·코스와 결제 방식을 확인하는 순서입니다.",
    keywords: [
      "건마에반하다",
      "집에서 받는 출장마사지",
      "숙소 방문 마사지",
      "출장마사지 통화 준비",
    ],
    publishedAt: "2026-08-17T00:00:00+09:00",
    modifiedAt: "2026-08-17T00:00:00+09:00",
    intro:
      "집은 건물명과 상세 주소가 중요하고, 숙소는 상호와 도로명 주소를 함께 확인해야 합니다. 장소 정보를 먼저 적은 뒤 일정·인원·코스를 더해 전화로 전달합니다.",
    sections: [
      {
        heading: "집은 건물명과 상세 위치를 구분하기",
        paragraphs: [
          "아파트나 오피스텔이라면 도로명 주소와 건물명을 먼저 확인합니다. 동·호수 같은 상세 정보는 공개 입력창이 아니라 통화에서 전달합니다.",
          "동네 이름이나 역명은 검색에 쓸 수 있지만 일정 확인에는 실제 받을 주소가 필요합니다.",
        ],
      },
      {
        heading: "숙소는 상호와 도로명 주소를 대조하기",
        paragraphs: [
          "호텔·숙소는 같은 이름이 다른 지역에도 있을 수 있습니다. 예약 내역에 적힌 상호와 도로명 주소가 일치하는지 봅니다.",
          "공동 출입구나 안내 데스크처럼 별도 출입 내용이 있다면 주소 다음에 따로 말하면 됩니다.",
        ],
      },
      {
        heading: "장소 다음에 날짜·인원·코스 붙이기",
        paragraphs: [
          "받을 장소를 정했다면 가능한 날짜와 시각, 인원, 코스명과 이용 시간을 차례로 적습니다.",
          "커플·부부 두 명이 함께 받을 경우 2인 동시 프로그램의 가능 여부도 같은 통화에서 확인합니다.",
        ],
      },
      {
        heading: "후불과 카드 사용 여부까지 맞추기",
        paragraphs: [
          "사전 송금 항목은 없고 비용은 이용 장소에서 후불로 처리합니다. 무선 단말기를 이용한 카드 결제도 가능합니다.",
          "일회용 비품 사용과 관리 전후 소독 기준이 궁금하면 결제 방식과 함께 전화에서 확인할 수 있습니다.",
        ],
      },
    ],
    checklist: ["집 또는 숙소 구분", "건물명·숙소 상호와 도로명 주소", "날짜·시각과 인원", "코스명·이용 시간과 결제 수단"],
    relatedSlug: "masaji-shop-gagi-himdeul-ttae",
    image: {
      assetId: "geonmae-note-02",
      src: "/images/geonmae-template4/blog/note-02.webp",
      alt: "밝은 실내 전신거울 앞에서 휴대전화를 든 성인 여성",
    },
  },
] as const satisfies readonly BlogPost[];

export function findBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((candidate) => candidate.slug === slug);
}

export function getBlogPost(slug: BlogPost["slug"]): BlogPost {
  const post = findBlogPost(slug);
  if (!post) throw new Error(`GEONMAE_BLOG_POST_NOT_FOUND:${slug}`);
  return post;
}

export function getBlogPostPath(post: Pick<BlogPost, "slug">): string {
  return `/blog/${post.slug}/`;
}

export function createBlogMetadata(post: BlogPost): Metadata {
  const path = getBlogPostPath(post);
  const url = new URL(path, SITE_ORIGIN).href;
  const title = `${post.title} | ${SITE_NAME}`;
  return {
    title: { absolute: title },
    description: post.description,
    keywords: [...post.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
    },
    twitter: {
      card: "summary",
      title,
      description: post.description,
    },
    robots: { index: false, follow: false, nocache: true },
  };
}
