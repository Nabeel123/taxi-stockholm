"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, X } from "lucide-react";

const SESSION_DISMISS_KEY = "pwa-location-prompt-dismissed";

function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || Boolean(iosStandalone);
}

export default function LocationPermissionPrompt() {
  const t = useTranslations("locationPrompt");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  /** Permission API says denied before user taps Allow */
  const [alreadyDenied, setAlreadyDenied] = useState(false);

  useEffect(() => {
    if (!isInstalledPwa()) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return;

    let cancelled = false;

    const evaluate = async () => {
      try {
        const perm = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (cancelled) return;
        if (perm?.state === "granted") return;
        if (perm?.state === "denied") setAlreadyDenied(true);
      } catch {
        /* Safari / some browsers: no Permissions API for geolocation */
      }
      if (!cancelled) setVisible(true);
    };

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setVisible(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      dismiss();
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
        setVisible(false);
        setBusy(false);
      },
      () => {
        setBusy(false);
        dismiss();
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-[38] border-t border-neutral-200 bg-white px-4 pt-3 shadow-[0_-8px_28px_rgb(0_0_0/0.12)] pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] sm:px-5 lg:pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="location-prompt-title"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--primary)_12%,white)] text-primary">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p id="location-prompt-title" className="font-heading text-sm font-bold text-neutral-900">
              {t("title")}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-neutral-600 sm:text-sm">
              {alreadyDenied ? t("deniedHint") : t("body")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:justify-end">
          {alreadyDenied ? (
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-10 min-w-[5.5rem] touch-manipulation items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              {t("gotIt")}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={dismiss}
                className="inline-flex min-h-10 touch-manipulation items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 underline-offset-2 hover:underline"
              >
                {t("notNow")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={requestLocation}
                className="inline-flex min-h-10 min-w-[8.5rem] touch-manipulation items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-black shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? t("busy") : t("allow")}
              </button>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 flex h-9 w-9 touch-manipulation items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
        aria-label={t("closeAria")}
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
