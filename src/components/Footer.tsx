"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Phone, MapPin } from "lucide-react";
import { COMPANY, formatSwedishOrgNumber, googleReviewsInviteUrl } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");
  const tSite = useTranslations("site");
  const pathname = usePathname();
  const telHref = COMPANY.phoneE164.replace(/\s/g, "");
  const waHref = `https://wa.me/${COMPANY.whatsappDigits}`;

  const quickLinks = [
    { href: "/#about", label: t("about") },
    { href: "/#services", label: t("services") },
    { href: "/#reviews", label: t("reviews") },
    { href: "/#contact", label: t("contact") },
  ] as const;

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") return;
    const hash = href.split("#")[1];
    if (!hash) return;
    e.preventDefault();
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer
      id="contact"
      className="bg-[var(--dark-slate)] pb-[max(3.25rem,calc(env(safe-area-inset-bottom,0px)+2.75rem))] pt-14 sm:pb-[max(3.75rem,calc(env(safe-area-inset-bottom,0px)+2.75rem))] sm:pt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-start gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 17h14v-5H5v5zm2-8h10V6H7v3z" />
                  <circle cx="7.5" cy="16" r="1.5" />
                  <circle cx="16.5" cy="16" r="1.5" />
                </svg>
              </div>
              <span className="font-heading text-left text-base font-bold uppercase leading-snug tracking-wide text-white sm:text-lg">
                {tSite("brandTitle")}
              </span>
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">{tSite("description")}</p>
            <p className="mt-4 text-sm text-white/55">
              © {new Date().getFullYear()} {COMPANY.legalName}. {t("rights")}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{t("quickLinks")}</h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleHashLink(e, item.href)}
                    className="-mx-2 block min-h-11 px-2 py-2.5 text-sm text-white/80 transition-colors hover:text-white md:min-h-0 md:p-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  {t("bookNow")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t("refunds")}
                </Link>
              </li>
              <li>
                <a
                  href={googleReviewsInviteUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t("googleReviews")}
                </a>
              </li>
              <li>
                <a
                  href={COMPANY.workMailto}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t("workAt", { company: COMPANY.legalName })}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{t("contact")}</h3>
              <ul className="mt-4 space-y-4 text-sm text-white/80">
                <li>
                  <a href={`tel:${telHref}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    {COMPANY.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-[var(--whatsapp-green)]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.151 1.03 7.045 2.903 1.894 1.903 2.903 4.375 2.903 7.034 0 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t("whatsapp")}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY.emails.company}`}
                    className="block underline-offset-2 hover:text-white hover:underline"
                  >
                    {COMPANY.emails.company}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY.emails.bookings}`}
                    className="block underline-offset-2 hover:text-white hover:underline"
                  >
                    {COMPANY.emails.bookings}
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 text-white/80 hover:text-white"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <span>{COMPANY.address.line}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY.allabolagUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 underline-offset-2 hover:text-white hover:underline"
                  >
                    {t("orgNumber", {
                      number: formatSwedishOrgNumber(COMPANY.organizationNumber),
                    })}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{t("followUs")}</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                <li>
                  <a
                    href={COMPANY.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white"
                  >
                    {t("facebook")}
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white"
                  >
                    {t("instagram")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
