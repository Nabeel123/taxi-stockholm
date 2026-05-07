import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import ContactPageClient from "@/components/ContactPageClient";

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
  return <ContactPageClient />;
}
