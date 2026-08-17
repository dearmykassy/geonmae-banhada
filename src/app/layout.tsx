import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { Ga4Tracker } from "@/components/Ga4Tracker";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { parseGaMeasurementId } from "@/lib/analytics";
import { SITE_ORIGIN } from "@/lib/metadata";
import "./fixed-pages.css";
import "./globals.css";

const GA_MEASUREMENT_ID = parseGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "건마에반하다 | 1,291개 지역·5개 출장마사지 코스",
    template: "%s | 건마에반하다",
  },
  description:
    "건마에반하다의 주소별 운영 범위 1,291개와 5개 코스 14개 금액, 24시간 전화 접수 및 현장 후불 방식을 확인합니다.",
  keywords: [
    "건마에반하다",
    "전국 출장마사지",
    "출장안마",
    "출장타이마사지",
    "출장스웨디시",
    "출장홈타이",
    "남성전용마사지",
    "여성전용마사지",
  ],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/images/geonmae-template4/brand/heart-mark-v1-32.png", type: "image/png", sizes: "32x32" },
      { url: "/images/geonmae-template4/brand/heart-mark-v1-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/images/geonmae-template4/brand/heart-mark-v1-32.png",
    apple: [{ url: "/images/geonmae-template4/brand/heart-mark-v1-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d52656",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell" id="top">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
        {GA_MEASUREMENT_ID ? (
          <Suspense fallback={null}>
            <Ga4Tracker measurementId={GA_MEASUREMENT_ID} platformId="geonmae-banhada" />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
