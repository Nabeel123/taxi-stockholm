"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  Landmark,
  Check,
  HelpCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";
import type { ServiceId } from "@/lib/constants";
import { serviceIdToMessageKey } from "@/lib/service-messages";
import { COMPANY } from "@/lib/site";

/** WhatsApp: *text* renders as bold. Strip stray asterisks from user-entered fragments. */
function waBold(segment: string): string {
  return `*${segment.replace(/\*/g, "")}*`;
}

function waSafeCell(text: string): string {
  return text.replace(/\r?\n/g, " ").replace(/```/g, "'''").trim() || "—";
}

/** Plain-text table inside a monospace block (readable in WhatsApp). */
function buildWhatsappDetailTable(rows: { label: string; value: string }[]): string {
  const cleanRows = rows.map((r) => ({
    label: r.label.replace(/\*/g, ""),
    value: waSafeCell(r.value),
  }));
  const labelW = Math.max(6, ...cleanRows.map((r) => r.label.length));
  const inner = cleanRows.map((r) => `${r.label.padEnd(labelW)} | ${r.value}`).join("\n");
  return `\`\`\`\n${inner}\n\`\`\``;
}

const icons: Record<string, LucideIcon> = {
  "plane-arrival": Plane,
  "plane-departure": Plane,
  landmark: Landmark,
  "map-pin": MapPin,
};

const WHATSAPP_DIGITS = COMPANY.whatsappDigits;
const TEL_HREF = COMPANY.phoneE164;

type Step = 1 | 2 | 3;

type FormState = {
  fullName: string;
  phone: string;
  date: string;
  time: string;
  passengers: number;
  notes: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  date: "",
  time: "",
  passengers: 1,
  notes: "",
};

function StepIndicator({
  step,
  labels,
}: {
  step: Step;
  labels: readonly [string, string, string];
}) {
  const stepsMeta = [
    { num: 1 as const, label: labels[0] },
    { num: 2 as const, label: labels[1] },
    { num: 3 as const, label: labels[2] },
  ];
  return (
    <div className="mb-10 w-full px-1">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {stepsMeta.map((s, i) => {
          const isActive = step === s.num;
          const isComplete = step > s.num;
          return (
            <div key={s.num} className="flex min-w-0 flex-1 items-start">
              <div className="flex w-full flex-col items-center gap-2">
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors sm:h-10 sm:w-10 ${
                    isComplete
                      ? "bg-[var(--accent)] text-[var(--book-wizard-text)]"
                      : isActive
                        ? "bg-[var(--accent)] text-[var(--book-wizard-text)] shadow-sm"
                        : "border-2 border-neutral-300 bg-white text-neutral-400"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2.5} />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`max-w-[5.5rem] text-center text-[10px] font-semibold leading-tight sm:max-w-none sm:text-xs ${
                    isActive
                      ? "font-bold text-[var(--book-wizard-text)]"
                      : isComplete
                        ? "text-[var(--book-wizard-text)]/80"
                        : "text-neutral-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < stepsMeta.length - 1 ? (
                <div
                  className="mx-0.5 mt-[1.125rem] h-px min-w-[12px] flex-1 self-start bg-neutral-300 sm:mx-1 sm:mt-5"
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[var(--book-wizard-text)] shadow-sm placeholder:text-neutral-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/35 sm:text-base";

export default function BookYourRide() {
  const t = useTranslations("bookYourRide");
  const tSvc = useTranslations("services");
  const twa = useTranslations("bookYourRide.wa");

  const [step, setStep] = useState<Step>(1);
  const [selectedId, setSelectedId] = useState<ServiceId | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  const selectedService = useMemo(
    () => SERVICES.find((s) => s.id === selectedId) ?? null,
    [selectedId],
  );

  const canProceedStep2 =
    form.fullName.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.date.length > 0 &&
    form.time.length > 0;

  const whatsappHref = useMemo(() => {
    if (!selectedId || !selectedService) return "#";
    const service = selectedService;
    const k = serviceIdToMessageKey(selectedId);
    const name = tSvc(`${k}.name`);
    const desc = tSvc(`${k}.description`);

    const tableRows = [
      { label: twa("name"), value: form.fullName },
      { label: twa("phone"), value: form.phone },
      { label: twa("date"), value: form.date },
      { label: twa("time"), value: form.time },
      { label: twa("passengers"), value: String(form.passengers) },
    ];
    if (form.notes.trim()) {
      tableRows.push({ label: twa("notes"), value: form.notes.trim() });
    }

    const priceLine = service.priceLabel?.trim()
      ? `${waBold(twa("price"))} ${service.priceLabel.trim()}`
      : waBold(twa("price"));

    const packageBlock = [
      waBold(twa("packageHeading")),
      "",
      waBold(name),
      "",
      waBold(twa("routeLabel")),
      desc,
      "",
      priceLine,
    ].join("\n");

    const text = [
      waBold(twa("bookingRequestTitle")),
      "",
      packageBlock,
      "",
      waBold(twa("otherDetailsHeading")),
      "",
      buildWhatsappDetailTable(tableRows),
    ].join("\n");

    return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(text)}`;
  }, [selectedId, selectedService, form, tSvc, twa]);

  const minDate = new Date().toISOString().split("T")[0];

  const stepLabels = [
    t("steps.choose"),
    t("steps.details"),
    t("steps.confirm"),
  ] as const;

  return (
    <section
      className="scroll-mt-20 overflow-hidden bg-[var(--book-wizard-bg)] py-16 sm:scroll-mt-24 sm:py-20 md:py-24"
      id="services"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
        <div className="text-center">
          <span className="font-heading inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--book-wizard-text)] sm:text-sm">
            {t("kicker")}
          </span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--book-wizard-text)] sm:text-3xl md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:p-8 md:p-10">
          <StepIndicator step={step} labels={stepLabels} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 min-[400px]:gap-4">
                  {SERVICES.map((service) => {
                    const Icon = icons[service.icon] || MapPin;
                    const isSelected = selectedId === service.id;
                    const mk = serviceIdToMessageKey(service.id);
                    const spanVasteras = service.id === "vasteras-route";
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSelectedId(service.id)}
                        className={`touch-manipulation relative flex min-h-[10.5rem] flex-col rounded-2xl border p-4 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.99] sm:min-h-0 sm:p-5 ${
                          spanVasteras ? "min-[400px]:col-span-2" : ""
                        } ${
                          isSelected
                            ? "border-2 border-[var(--accent)] bg-[var(--book-card-selected)] shadow-md"
                            : "border border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        {service.popular ? (
                          <span className="absolute right-2 top-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--book-wizard-text)] sm:right-3 sm:top-3 sm:text-[10px]">
                            {t("popular")}
                          </span>
                        ) : null}
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--book-wizard-text)]">
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </div>
                        <h3 className="pr-11 font-heading text-[0.6875rem] font-bold uppercase leading-snug tracking-wide text-[var(--book-wizard-text)] min-[400px]:pr-14 min-[400px]:text-xs sm:text-sm">
                          {tSvc(`${mk}.name`)}
                        </h3>
                        <p className="mt-2 text-[11px] leading-snug text-neutral-600 sm:text-xs">
                          {tSvc(`${mk}.description`)}
                        </p>
                        <p className="mt-3 text-sm font-bold text-[var(--book-wizard-text)] sm:text-base">
                          {service.priceLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedId ? (
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[var(--book-wizard-text)] shadow-sm transition hover:bg-[var(--accent-hover)] sm:text-base"
                    >
                      {t("next")}
                      <span aria-hidden>→</span>
                    </button>
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            {step === 2 && selectedService ? (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-[var(--book-wizard-bg)] px-4 py-3 text-sm text-[var(--book-wizard-text)] sm:text-base">
                  {(() => {
                    const SummaryIcon = icons[selectedService.icon] ?? MapPin;
                    return (
                      <SummaryIcon
                        className="h-4 w-4 shrink-0 text-[var(--accent)]"
                        aria-hidden
                        strokeWidth={1.75}
                      />
                    );
                  })()}
                  <span>
                    <span className="font-semibold">
                      {tSvc(`${serviceIdToMessageKey(selectedService.id)}.name`)}
                    </span>
                    <span className="text-neutral-500"> — </span>
                    <span className="font-bold text-[var(--book-wizard-text)]">
                      {selectedService.priceLabel}
                    </span>
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="wizard-name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("name")}
                    </label>
                    <input
                      id="wizard-name"
                      type="text"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fullName: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="wizard-phone"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("phone")}
                    </label>
                    <input
                      id="wizard-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wizard-date"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("date")}
                    </label>
                    <input
                      id="wizard-date"
                      type="date"
                      min={minDate}
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="wizard-time"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("time")}
                    </label>
                    <input
                      id="wizard-time"
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, time: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="wizard-passengers"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("passengers")}
                    </label>
                    <select
                      id="wizard-passengers"
                      value={form.passengers}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          passengers: Number(e.target.value),
                        }))
                      }
                      className={inputClass}
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="wizard-notes"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--book-wizard-text)]"
                    >
                      {t("notesLabel")}{" "}
                      <span className="font-normal normal-case text-neutral-500">{t("notesOptional")}</span>
                    </label>
                    <textarea
                      id="wizard-notes"
                      rows={3}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      placeholder={t("notesPlaceholder")}
                      className={`${inputClass} resize-y min-h-[5rem]`}
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold text-neutral-600 underline-offset-4 transition hover:text-[var(--book-wizard-text)] hover:underline"
                  >
                    {t("back")}
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[var(--book-wizard-text)] shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
                  >
                    {t("next")}
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === 3 && selectedService ? (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="rounded-2xl border border-neutral-200 bg-[var(--book-wizard-bg)] p-5 sm:p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {t("bookingSummary")}
                  </h3>
                  <dl className="mt-4 space-y-3 text-sm text-[var(--book-wizard-text)] sm:text-base">
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryService")}</dt>
                      <dd className="text-right font-semibold">
                        {tSvc(`${serviceIdToMessageKey(selectedService.id)}.name`)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryPrice")}</dt>
                      <dd className="text-right font-bold text-[var(--book-wizard-text)]">
                        {selectedService.priceLabel}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryName")}</dt>
                      <dd className="text-right font-medium">{form.fullName}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryPhone")}</dt>
                      <dd className="text-right font-medium">{form.phone}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryDateTime")}</dt>
                      <dd className="text-right font-medium">
                        {form.date} · {form.time}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-neutral-200/80 pb-3">
                      <dt className="text-neutral-600">{t("summaryPassengers")}</dt>
                      <dd className="text-right font-medium">
                        {form.passengers}
                      </dd>
                    </div>
                    {form.notes.trim() ? (
                      <div className="pt-1">
                        <dt className="text-neutral-600">{t("summaryNotes")}</dt>
                        <dd className="mt-1 text-neutral-800">{form.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-4 text-center text-sm font-bold uppercase tracking-wide text-[var(--book-wizard-text)] shadow-sm transition hover:bg-[var(--accent-hover)] sm:text-base"
                  >
                    {t("whatsappBook")}
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    href={`tel:${TEL_HREF}`}
                    className="inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--book-wizard-text)] bg-transparent px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--book-wizard-text)] transition hover:bg-[var(--book-wizard-text)]/5 sm:text-base"
                  >
                    {t("callBook")}
                  </a>
                </div>

                <p className="mt-4 text-center text-xs text-neutral-500 sm:text-sm">
                  {t("footerTrust")}
                </p>

                <div className="mt-8 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-semibold text-neutral-600 underline-offset-4 transition hover:text-[var(--book-wizard-text)] hover:underline"
                  >
                    {t("back")}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <HelpCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]"
                strokeWidth={1.75}
              />
              <div>
                <p className="font-heading text-sm font-semibold text-[var(--book-wizard-text)]">
                  {t("faq1q")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {t("faq1a")}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]"
                strokeWidth={1.75}
              />
              <div>
                <p className="font-heading text-sm font-semibold text-[var(--book-wizard-text)]">
                  {t("faq2q")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t("faq2a")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
