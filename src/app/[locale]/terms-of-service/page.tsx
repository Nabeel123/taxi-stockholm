import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("terms");
  const dateLocale = locale === "sv" ? "sv-SE" : "en-GB";

  return (
    <div className="min-h-screen bg-[var(--dark-slate)]">
      <Header />
      <main className="pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-block text-white/60 transition-colors hover:text-white"
            aria-label={t("backToHome")}
          >
            {t("backToHome")}
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-white/60">
            {t("lastUpdated")} {new Date().toLocaleDateString(dateLocale)}
          </p>

          <div className="mt-8 space-y-6 text-sm text-white/80 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-white">{t("s1h")}</h2>
              <p className="mt-2">{t("s1p", { company: COMPANY.legalName })}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">{t("s2h")}</h2>
              <p className="mt-2">{t("s2p")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">{t("s3h")}</h2>
              <p className="mt-2">{t("s3p")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">{t("s4h")}</h2>
              <p className="mt-2">{t("s4p")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">{t("s5h")}</h2>
              <p className="mt-2">{t("s5p", { phone: COMPANY.phoneDisplay })}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
