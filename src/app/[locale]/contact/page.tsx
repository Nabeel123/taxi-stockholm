import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";
import { isContactRecaptchaV3Enabled } from "@/lib/recaptcha-config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function ContactPage() {
  const recaptchaSiteKey = process.env.GOOGLE_CAPTCHA_SITE_KEY?.trim() || null;
  return (
    <ContactPageClient
      recaptchaSiteKey={recaptchaSiteKey}
      recaptchaUseV3={isContactRecaptchaV3Enabled()}
    />
  );
}
