"use client";

import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

type ContactPageClientProps = {
  recaptchaSiteKey: string | null;
  /** From server env: v3 Score keys vs v2 “I'm not a robot” Checkbox. */
  recaptchaUseV3: boolean;
};

export default function ContactPageClient({ recaptchaSiteKey, recaptchaUseV3 }: ContactPageClientProps) {
  const t = useTranslations("contactPage");

  return (
    <div className="min-h-screen bg-[var(--dark-slate)]">
      <Header />
      <main className="pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-4xl">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-white/65 sm:text-base">{t("subtitle")}</p>

          <div className="mt-8 rounded-xl border border-neutral-700 bg-neutral-900/35 p-6 sm:p-8">
            <ContactForm recaptchaSiteKey={recaptchaSiteKey} recaptchaUseV3={recaptchaUseV3} />
          </div>

          <p className="mt-6 text-center text-xs text-white/45">{t("privacyNote")}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
