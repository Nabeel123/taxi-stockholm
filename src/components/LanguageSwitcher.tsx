"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  return (
    <div
      className="flex min-h-[2.75rem] items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 p-1 text-[10px] font-bold uppercase tracking-wide sm:min-h-0 sm:text-xs"
      role="group"
      aria-label={t("label")}
    >
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "sv" })}
        className={`touch-manipulation rounded-full px-3 py-2 transition sm:px-2.5 sm:py-1 ${
          locale === "sv"
            ? "bg-[var(--accent)] text-black shadow-sm"
            : "text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/80"
        }`}
        aria-pressed={locale === "sv"}
      >
        SV
      </button>
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "en" })}
        className={`touch-manipulation rounded-full px-3 py-2 transition sm:px-2.5 sm:py-1 ${
          locale === "en"
            ? "bg-[var(--accent)] text-black shadow-sm"
            : "text-neutral-600 hover:text-neutral-900 active:bg-neutral-200/80"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
