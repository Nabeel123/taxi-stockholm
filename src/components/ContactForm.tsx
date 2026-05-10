"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { contactSubmissionSchema, type ContactSubmission } from "@/lib/contact-schema";
import { COMPANY } from "@/lib/site";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

type ContactFormInput = z.input<typeof contactSubmissionSchema>;

type Props = {
  /** From `GOOGLE_CAPTCHA_SITE_KEY` (server-passed); if missing, CAPTCHA widget is omitted and API skips verification when secret is unset. */
  recaptchaSiteKey: string | null;
  /** v3 Score keys: `execute()` + api.js?render=; v2 Checkbox: checkbox widget. Wrong mode → “Invalid key type”. */
  recaptchaUseV3: boolean;
};

export default function ContactForm({ recaptchaSiteKey, recaptchaUseV3 }: Props) {
  const t = useTranslations("contactPage");
  const pathname = usePathname();
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [captchaClientError, setCaptchaClientError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(() => !recaptchaSiteKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (recaptchaUseV3) return;
    if (!recaptchaSiteKey || !recaptchaReady || !containerRef.current) return;
    if (widgetIdRef.current !== null) return;
    const g = window.grecaptcha;
    if (!g) return;
    g.ready(() => {
      if (!containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = g.render(containerRef.current, {
        sitekey: recaptchaSiteKey,
        theme: "dark",
      });
    });
  }, [recaptchaSiteKey, recaptchaReady, recaptchaUseV3, status]);

  useEffect(() => {
    const node = containerRef.current;
    return () => {
      widgetIdRef.current = null;
      if (node) node.innerHTML = "";
    };
  }, [recaptchaSiteKey]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactSubmission>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const resetCaptcha = () => {
    const id = widgetIdRef.current;
    if (id !== null && window.grecaptcha) {
      window.grecaptcha.reset(id);
    }
  };

  const onSubmit = async (values: ContactSubmission) => {
    setCaptchaClientError(null);
    setStatus("loading");

    let recaptchaToken: string | undefined;
    if (recaptchaSiteKey) {
      const g = window.grecaptcha;
      if (!g) {
        setCaptchaClientError(t("captchaNotReady"));
        setStatus("idle");
        return;
      }
      if (recaptchaUseV3) {
        try {
          await new Promise<void>((resolve) => {
            g.ready(() => resolve());
          });
          recaptchaToken = await g.execute(recaptchaSiteKey, { action: "contact_form" });
          if (!recaptchaToken?.trim()) {
            setCaptchaClientError(t("captchaRequired"));
            setStatus("idle");
            return;
          }
        } catch {
          setCaptchaClientError(t("captchaVerifyFailed"));
          setStatus("idle");
          return;
        }
      } else {
        const id = widgetIdRef.current;
        if (id === null) {
          setCaptchaClientError(t("captchaNotReady"));
          setStatus("idle");
          return;
        }
        recaptchaToken = g.getResponse(id)?.trim() || "";
        if (!recaptchaToken) {
          setCaptchaClientError(t("captchaRequired"));
          setStatus("idle");
          return;
        }
      }
    }

    try {
      const qs =
        typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          locale,
          pagePath: pathname,
          ...(qs
            ? {
                utmSource: qs.get("utm_source") ?? undefined,
                utmMedium: qs.get("utm_medium") ?? undefined,
                utmCampaign: qs.get("utm_campaign") ?? undefined,
              }
            : {}),
          ...(recaptchaToken ? { recaptchaToken } : {}),
        }),
      });

      let payload: { error?: string } = {};
      try {
        payload = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        setStatus("error");
        if (payload.error === "captcha_required" || payload.error === "captcha_invalid") {
          setCaptchaClientError(t("captchaVerifyFailed"));
          resetCaptcha();
        }
        return;
      }

      widgetIdRef.current = null;
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      resetCaptcha();
    }
  };

  const inputClass =
    "w-full rounded-lg border border-neutral-600 bg-[var(--dark-slate)]/50 px-3.5 py-3 text-[15px] text-white outline-none placeholder:text-white/35 focus:border-neutral-400 focus:ring-2 focus:ring-[var(--accent)]/30";

  return (
    <>
      {recaptchaSiteKey ? (
        <Script
          src={
            recaptchaUseV3
              ? `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`
              : "https://www.google.com/recaptcha/api.js"
          }
          strategy="afterInteractive"
          onLoad={() => setRecaptchaReady(true)}
        />
      ) : null}

      {status === "success" ? (
      <div className="rounded-xl border border-[var(--accent)]/35 bg-neutral-950/70 px-5 py-6 text-center">
        <p className="font-semibold text-white">{t("successTitle")}</p>
        <p className="mt-2 text-sm text-white/70">{t("successBody")}</p>
        <button
          type="button"
          onClick={() => {
            widgetIdRef.current = null;
            setStatus("idle");
          }}
          className="mt-6 min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black hover:bg-[var(--accent-hover)]"
        >
          {t("sendAnother")}
        </button>
      </div>
      ) : (
      <form
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e);
        }}
      >
        {status === "error" ? (
          <div
            className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100"
            role="alert"
          >
            <p>{t("errorBanner")}</p>
            <a
              href={`mailto:${COMPANY.emails.bookings}`}
              className="mt-2 inline-block font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              {COMPANY.emails.bookings}
            </a>
          </div>
        ) : null}

        {captchaClientError ? (
          <p className="text-sm text-amber-200" role="alert">
            {captchaClientError}
          </p>
        ) : null}

        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-white/85">
            {t("labelName")}
          </label>
          <input id="contact-name" type="text" autoComplete="name" className={`mt-1.5 ${inputClass}`} {...register("name")} />
          {errors.name?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{t(`errors.${errors.name.message}`)}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-white/85">
            {t("labelEmail")}
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className={`mt-1.5 ${inputClass}`}
            {...register("email")}
          />
          {errors.email?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{t(`errors.${errors.email.message}`)}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-white/85">
            {t("labelPhone")}
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            className={`mt-1.5 ${inputClass}`}
            {...register("phone")}
          />
          {errors.phone?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{t(`errors.${errors.phone.message}`)}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-white/85">
            {t("labelMessage")}
          </label>
          <textarea
            id="contact-message"
            rows={5}
            className={`mt-1.5 resize-y min-h-[8rem] ${inputClass}`}
            {...register("message")}
          />
          {errors.message?.message ? (
            <p className="mt-1.5 text-sm text-red-300">{t(`errors.${errors.message.message}`)}</p>
          ) : null}
        </div>

        {recaptchaSiteKey && !recaptchaUseV3 ? (
          <div className="flex justify-center [&_iframe]:max-w-full">
            <div ref={containerRef} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-black hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </button>
      </form>
      )}
    </>
  );
}
