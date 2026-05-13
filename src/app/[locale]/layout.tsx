import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { Poppins, Roboto } from "next/font/google";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import WhatsAppStickyFab from "@/components/WhatsAppStickyFab";
import { PWA_THEME_COLOR } from "@/lib/pwa";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-6TX3DHHXDZ";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    applicationName: t("appName"),
    appleWebApp: {
      capable: true,
      title: t("appName"),
      statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false },
  };
}

export const viewport = {
  width: "device-width" as const,
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
  themeColor: PWA_THEME_COLOR,
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale === "sv" ? "sv" : "en"} suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${poppins.variable} min-w-0 w-full overflow-x-hidden antialiased`}
        suppressHydrationWarning
      >
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <WhatsAppStickyFab />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
