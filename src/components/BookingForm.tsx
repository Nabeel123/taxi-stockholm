"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useId, Suspense, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Wizard, useWizard } from "react-use-wizard";
import confetti from "canvas-confetti";
import {
  Loader2,
  MapPin,
  Plane,
  Landmark,
  CheckCircle,
  CreditCard,
  Lock,
  ArrowDown,
  ClipboardList,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { bookingSchema, type BookingFormData } from "@/lib/booking-schema";
import { PASSENGER_OPTIONS, SERVICE_OPTIONS } from "@/lib/booking-schema";
import {
  calculateRouteDistance,
  EXTRA_DISTANCE_CHARGE_SEK_PER_KM,
  MAX_DISTANCE_KM,
} from "@/lib/distance";
import { SERVICES } from "@/lib/constants";
import { serviceIdToMessageKey } from "@/lib/service-messages";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import PickupCurrentLocationButton from "@/components/PickupCurrentLocationButton";
import { StripePaymentSection, isStripePaymentsConfigured } from "@/components/StripePaymentSection";
import { googleReviewsInviteUrl } from "@/lib/site";

const serviceOptionIcons: Record<string, LucideIcon> = {
  "plane-arrival": Plane,
  "plane-departure": Plane,
  landmark: Landmark,
  "map-pin": MapPin,
};

/** Validated on step 2 before pay / quote submit */
const BOOKING_STEP2_CONTACT_FIELDS = ["fullName", "email", "phone"] as const satisfies readonly (
  keyof BookingFormData
)[];

const REDIRECT_HOME_MS = 10000;

/** Wizard step indices: 0 details, 1 payment/contact, 2 confirmation */
const BOOKING_STEP_PAYMENT = 1;
const BOOKING_STEP_CONFIRM = 2;

/** Survives Stripe redirect full-page return so step 3 can show trip details */
const BOOKING_CONFIRMATION_DRAFT_KEY = "sahotra.booking.confirmationDraft.v1";

function persistBookingConfirmationDraft(values: BookingFormData): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      ...values,
      pickupDate:
        values.pickupDate instanceof Date
          ? values.pickupDate.toISOString()
          : values.pickupDate,
    };
    sessionStorage.setItem(BOOKING_CONFIRMATION_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function readBookingConfirmationDraft(): Partial<BookingFormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_CONFIRMATION_DRAFT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (typeof o.pickupDate === "string") {
      const d = new Date(o.pickupDate);
      if (!Number.isNaN(d.getTime())) {
        o.pickupDate = d;
      }
    }
    return o as Partial<BookingFormData>;
  } catch {
    return null;
  }
}

interface BookingFormProps {
  defaultService?: string;
  defaultPickup?: string;
  defaultDropoff?: string;
  onSuccess?: (data: BookingFormData) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

function formatDateLong(d: Date | string, localeTag: string): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return (
    date.toLocaleDateString(localeTag, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) ?? "—"
  );
}

/** Normalizes Date / ISO string / timestamp from RHF or sessionStorage revival */
function formatBookingDateForDisplay(value: unknown, localeTag: string): string {
  if (value == null || value === "") return "—";
  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return formatDateLong(d, localeTag);
}

/** Matches bookingSchema rules for step-1 trip fields (locations, date, time, passengers, distance). */
function isStep1TripComplete(args: {
  serviceType: string;
  pickupDate: Date | undefined;
  pickupTime: string | undefined;
  passengers: string | undefined;
  pickupLocation: string | undefined;
  dropoffLocation: string | undefined;
  distanceBlocksNext: boolean;
}): boolean {
  if (args.distanceBlocksNext) return false;
  const pickup = (args.pickupLocation ?? "").trim();
  if (pickup.length < 2) return false;
  if (args.serviceType !== "city-tour") {
    const drop = (args.dropoffLocation ?? "").trim();
    if (drop.length < 2) return false;
  }
  const d = args.pickupDate;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return false;
  const t = (args.pickupTime ?? "").trim();
  if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(t)) return false;
  if (!args.passengers || !PASSENGER_OPTIONS.some((o) => o.value === args.passengers)) return false;
  return true;
}

function StepIndicator({
  activeStep,
  labels,
}: {
  activeStep: number;
  labels: readonly [string, string, string];
}) {
  return (
    <div className="mt-6 mb-6 flex items-center justify-center gap-2 sm:gap-4">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              i === activeStep
                ? "bg-[var(--accent)] text-black"
                : i < activeStep
                  ? "bg-green-500/20 text-green-500"
                  : "bg-neutral-700 text-white/50"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`hidden text-sm font-medium sm:inline ${
              i === activeStep ? "text-[var(--accent)]" : "text-white/60"
            }`}
          >
            {label}
          </span>
          {i < labels.length - 1 && (
            <span className="mx-1 h-px w-4 bg-neutral-600 sm:mx-2 sm:w-8" />
          )}
        </div>
      ))}
    </div>
  );
}

function WizardHeader({ labels }: { labels: readonly [string, string, string] }) {
  const { activeStep } = useWizard();
  return <StepIndicator activeStep={activeStep} labels={labels} />;
}

function BookingFormInner({
  defaultService,
  defaultPickup,
  defaultDropoff,
  onSuccess,
}: BookingFormProps) {
  const [shake, setShake] = useState(false);
  const distanceCalcSeqRef = useRef(0);
  const [distanceState, setDistanceState] = useState<{
    loading: boolean;
    distanceKm: number | null;
    durationMin: number | null;
    withinLimit: boolean;
    error?: string;
  }>({ loading: false, distanceKm: null, durationMin: null, withinLimit: true });
  const [agreedExtraDistanceCharge, setAgreedExtraDistanceCharge] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onBlur",
    defaultValues: {
      serviceType: (defaultService as BookingFormData["serviceType"]) || "airport-pickup",
      pickupTime: "09:00",
      passengers: "1",
    },
  });

  /* react-hook-form: watch fields for conditional UI — React Compiler opts out memoization */
  /* eslint-disable react-hooks/incompatible-library */
  const serviceType = watch("serviceType");
  const pickupLocation = watch("pickupLocation");
  const dropoffLocation = watch("dropoffLocation");
  /* eslint-enable react-hooks/incompatible-library */

  const locale = useLocale();
  const localeTag = locale === "sv" ? "sv-SE" : "en-GB";
  const tBooking = useTranslations("booking");
  const tSvc = useTranslations("services");
  const tCommon = useTranslations("common");
  const arlandaLine = tBooking("arlandaAirport");
  const stepLabels = [tBooking("stepDetails"), tBooking("stepPayment"), tBooking("stepConfirm")] as const;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const routerStripeReturn = useRouter();
  const paymentIntentFromStripe = searchParams.get("payment_intent");
  const stripeRedirectStatus = searchParams.get("redirect_status");
  const stripeHostedRedirect =
    Boolean(paymentIntentFromStripe) && stripeRedirectStatus != null && stripeRedirectStatus !== "";
  const wizardStartIndex = stripeHostedRedirect
    ? stripeRedirectStatus === "succeeded"
      ? BOOKING_STEP_CONFIRM
      : BOOKING_STEP_PAYMENT
    : 0;

  // Apply URL/default params on mount or when defaults change
  useEffect(() => {
    if (!defaultService) return;
    const values = getValues();
    if (defaultService === "airport-dropoff") {
      reset({ ...values, serviceType: "airport-dropoff", pickupLocation: "", dropoffLocation: arlandaLine });
    } else if (defaultService === "airport-pickup") {
      reset({ ...values, serviceType: "airport-pickup", pickupLocation: arlandaLine, dropoffLocation: "" });
    } else if (defaultService === "city-tour") {
      reset({ ...values, serviceType: "city-tour", pickupLocation: "", dropoffLocation: "" });
    } else if (defaultService === "custom-route") {
      reset({
        ...values,
        serviceType: "custom-route",
        pickupLocation: defaultPickup ?? "",
        dropoffLocation: defaultDropoff ?? "",
      });
    } else if (defaultService === "vasteras-route") {
      reset({
        ...values,
        serviceType: "vasteras-route",
        pickupLocation: defaultPickup ?? "",
        dropoffLocation: defaultDropoff ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getValues is stable, we only want to run when URL params change
  }, [defaultService, defaultPickup, defaultDropoff, arlandaLine]);

  useLayoutEffect(() => {
    distanceCalcSeqRef.current += 1;
    if (serviceType === "airport-pickup") {
      setValue("pickupLocation", arlandaLine, { shouldValidate: false });
      setValue("dropoffLocation", "", { shouldValidate: false });
    } else if (serviceType === "airport-dropoff") {
      setValue("pickupLocation", "", { shouldValidate: false });
      setValue("dropoffLocation", arlandaLine, { shouldValidate: false });
    } else if (serviceType === "city-tour" || serviceType === "custom-route") {
      setValue("pickupLocation", "", { shouldValidate: false });
      setValue("dropoffLocation", "", { shouldValidate: false });
    }
    clearErrors(["pickupLocation", "dropoffLocation"]);
    setDistanceState({
      loading: false,
      distanceKm: null,
      durationMin: null,
      withinLimit: true,
    });
    setAgreedExtraDistanceCharge(false);
  }, [serviceType, setValue, arlandaLine, clearErrors]);

  const isPickupLocked = serviceType === "airport-pickup";
  const isDropoffLocked = serviceType === "airport-dropoff";

  const debouncedPickup = useDebounce(pickupLocation ?? "", 800);
  const debouncedDropoff = useDebounce(dropoffLocation ?? "", 800);

  const arlandaTrimmed = arlandaLine.trim();

  const runDistanceCalc = useCallback(async () => {
    const vals = getValues();
    const st = vals.serviceType;

    if (st === "city-tour" || st === "custom-route") {
      distanceCalcSeqRef.current += 1;
      setDistanceState({
        loading: false,
        distanceKm: null,
        durationMin: null,
        withinLimit: true,
      });
      return;
    }

    const p = (vals.pickupLocation ?? "").trim();
    const d = (vals.dropoffLocation ?? "").trim();
    const dbp = debouncedPickup.trim();
    const dbd = debouncedDropoff.trim();

    /** Live values must reflect layout presets — never trust a stale shouldCalculate from render before presets. */
    if (st === "airport-pickup" && p !== arlandaTrimmed) {
      distanceCalcSeqRef.current += 1;
      setDistanceState({
        loading: false,
        distanceKm: null,
        durationMin: null,
        withinLimit: true,
      });
      return;
    }
    if (st === "airport-dropoff" && d !== arlandaTrimmed) {
      distanceCalcSeqRef.current += 1;
      setDistanceState({
        loading: false,
        distanceKm: null,
        durationMin: null,
        withinLimit: true,
      });
      return;
    }

    if (p !== dbp || d !== dbd || dbp.length < 3 || dbd.length < 3) {
      distanceCalcSeqRef.current += 1;
      setDistanceState({
        loading: false,
        distanceKm: null,
        durationMin: null,
        withinLimit: true,
      });
      return;
    }

    const seq = ++distanceCalcSeqRef.current;
    setDistanceState((s) => ({ ...s, loading: true, error: undefined }));
    const result = await calculateRouteDistance(dbp, dbd);
    if (seq !== distanceCalcSeqRef.current) return;
    setDistanceState({
      loading: false,
      distanceKm: result.distanceKm ?? null,
      durationMin: result.durationMin ?? null,
      withinLimit: result.withinLimit,
      error: result.error,
    });
  }, [getValues, debouncedPickup, debouncedDropoff, arlandaTrimmed]);

  useEffect(() => {
    runDistanceCalc();
  }, [runDistanceCalc]);

  useEffect(() => {
    setAgreedExtraDistanceCharge(false);
  }, [debouncedPickup, debouncedDropoff]);

  const service = SERVICES.find((s) => s.id === serviceType);
  const svcKey = service ? serviceIdToMessageKey(service.id) : "";
  const packageDisplayName = service ? tSvc(`${svcKey}.displayName`) : "";
  const packagePrice = service?.priceLabel ?? tCommon("quote");

  const onInvalid = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handlePaymentComplete = useCallback(() => {
    const data = getValues();
    const svc = SERVICES.find((s) => s.id === data.serviceType);
    console.log("Booking submitted:", {
      ...data,
      serviceName: svc?.name,
      price: svc?.price,
      distanceKm: distanceState.distanceKm,
    });
    onSuccess?.(data);
  }, [getValues, distanceState.distanceKm, onSuccess]);

  const persistConfirmationDraft = useCallback(() => {
    persistBookingConfirmationDraft(getValues());
  }, [getValues]);

  useLayoutEffect(() => {
    if (!stripeHostedRedirect || stripeRedirectStatus !== "succeeded") return;
    const draft = readBookingConfirmationDraft();
    if (!draft || Object.keys(draft).length === 0) return;
    reset({ ...getValues(), ...draft });
  }, [stripeHostedRedirect, stripeRedirectStatus, reset, getValues]);

  useEffect(() => {
    if (
      !stripeHostedRedirect ||
      !paymentIntentFromStripe ||
      stripeRedirectStatus == null ||
      stripeRedirectStatus === ""
    ) {
      return;
    }
    const dedupeKey = `booking-stripe-return:${paymentIntentFromStripe}:${stripeRedirectStatus}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(dedupeKey)) return;
    if (typeof window !== "undefined") sessionStorage.setItem(dedupeKey, "1");

    if (stripeRedirectStatus === "succeeded") {
      handlePaymentComplete();
    }
    routerStripeReturn.replace(pathname);
  }, [
    stripeHostedRedirect,
    paymentIntentFromStripe,
    stripeRedirectStatus,
    pathname,
    routerStripeReturn,
    handlePaymentComplete,
  ]);

  return (
    <div className={shake ? "animate-shake" : ""}>
      <Wizard
        startIndex={wizardStartIndex}
        header={
          serviceType === "custom-route" ? null : <WizardHeader labels={stepLabels} />
        }
      >
        <Step1Details
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          trigger={trigger}
          errors={errors}
          serviceType={serviceType}
          isPickupLocked={isPickupLocked}
          isDropoffLocked={isDropoffLocked}
          distanceState={distanceState}
          packagePrice={packagePrice}
          packageDisplayName={packageDisplayName ?? ""}
          service={service}
          onInvalid={onInvalid}
          persistConfirmationDraft={persistConfirmationDraft}
          agreedExtraDistanceCharge={agreedExtraDistanceCharge}
          setAgreedExtraDistanceCharge={setAgreedExtraDistanceCharge}
        />
        <Step2Payment
          register={register}
          errors={errors}
          trigger={trigger}
          getValues={getValues}
          packagePrice={packagePrice}
          packageDisplayName={packageDisplayName ?? ""}
          localeTag={localeTag}
          onComplete={handlePaymentComplete}
          onCustomRouteComplete={handlePaymentComplete}
          persistConfirmationDraft={persistConfirmationDraft}
        />
        <Step3Confirmation
          getValues={getValues}
          packagePrice={packagePrice}
          packageDisplayName={packageDisplayName ?? ""}
          localeTag={localeTag}
        />
      </Wizard>
    </div>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <Suspense fallback={null}>
      <BookingFormInner {...props} />
    </Suspense>
  );
}

type Step1Props = {
  register: ReturnType<typeof useForm<BookingFormData>>["register"];
  control: ReturnType<typeof useForm<BookingFormData>>["control"];
  watch: ReturnType<typeof useForm<BookingFormData>>["watch"];
  setValue: ReturnType<typeof useForm<BookingFormData>>["setValue"];
  trigger: ReturnType<typeof useForm<BookingFormData>>["trigger"];
  errors: ReturnType<typeof useForm<BookingFormData>>["formState"]["errors"];
  serviceType: string;
  isPickupLocked: boolean;
  isDropoffLocked: boolean;
  distanceState: { loading: boolean; distanceKm: number | null; durationMin: number | null; withinLimit: boolean; error?: string };
  packagePrice: string;
  packageDisplayName: string;
  service: { id?: string; name?: string; displayName?: string } | undefined;
  onInvalid: () => void;
  persistConfirmationDraft: () => void;
  agreedExtraDistanceCharge: boolean;
  setAgreedExtraDistanceCharge: (value: boolean) => void;
};

function Step1Details({
  register,
  control,
  watch,
  setValue,
  trigger,
  errors,
  serviceType,
  isPickupLocked,
  isDropoffLocked,
  distanceState,
  packagePrice,
  packageDisplayName,
  service,
  onInvalid,
  persistConfirmationDraft,
  agreedExtraDistanceCharge,
  setAgreedExtraDistanceCharge,
}: Step1Props) {
  const t = useTranslations("booking");
  const tSvc = useTranslations("services");
  const tSite = useTranslations("site");
  const { nextStep } = useWizard();
  const [isValidating, setIsValidating] = useState(false);

  const step1FieldNames = [
    "serviceType",
    "pickupDate",
    "pickupTime",
    "passengers",
    "pickupLocation",
    "dropoffLocation",
  ] as const satisfies readonly (keyof BookingFormData)[];

  const pickupDate = watch("pickupDate");
  const pickupTime = watch("pickupTime");
  const passengers = watch("passengers");
  const pickupLoc = watch("pickupLocation");
  const dropoffLoc = watch("dropoffLocation");

  const distanceOverLimit =
    serviceType !== "city-tour" &&
    serviceType !== "custom-route" &&
    distanceState.distanceKm !== null &&
    !distanceState.withinLimit;

  const distanceBlocksNext = distanceOverLimit && !agreedExtraDistanceCharge;

  const step1TripComplete = useMemo(
    () =>
      isStep1TripComplete({
        serviceType,
        pickupDate,
        pickupTime,
        passengers,
        pickupLocation: pickupLoc,
        dropoffLocation: dropoffLoc,
        distanceBlocksNext,
      }),
    [
      serviceType,
      pickupDate,
      pickupTime,
      passengers,
      pickupLoc,
      dropoffLoc,
      distanceBlocksNext,
    ],
  );

  const onNext = async () => {
    if (!step1TripComplete) {
      await trigger([...step1FieldNames]);
      onInvalid();
      return;
    }
    setIsValidating(true);
    const valid = await trigger([...step1FieldNames]);
    const distanceOk =
      serviceType === "city-tour" ||
      serviceType === "custom-route" ||
      distanceState.distanceKm === null ||
      distanceState.withinLimit ||
      agreedExtraDistanceCharge;
    setIsValidating(false);
    if (valid && distanceOk) {
      persistConfirmationDraft();
      nextStep();
    } else {
      onInvalid();
    }
  };

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900 shadow-sm">
        {/* Passenger Details header */}
        <div className="flex items-center gap-3 border-b border-neutral-700/80 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
            <Users className="h-5 w-5 text-black" aria-hidden />
          </div>
          <h4 className="text-base font-semibold text-white">{t("passengerDetails")}</h4>
        </div>

        {/* Booking summary strip */}
        {service && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-700/80 bg-neutral-950/80 px-5 py-4">
            <div>
              <p className="font-semibold text-white">{packageDisplayName}</p>
              <p className="mt-0.5 text-sm text-white/60">{tSite("vehicleShort")}</p>
            </div>
            <p className="text-xl font-bold text-[var(--accent)] sm:text-2xl">{packagePrice}</p>
          </div>
        )}

        {/* Form content */}
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>
            <div>
              <p id="booking-service-type-label" className="mb-3 block text-sm font-semibold text-[var(--accent)]">
                {t("serviceTypeLabel")}
              </p>
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <div
                    className="grid gap-3 sm:grid-cols-2"
                    role="radiogroup"
                    aria-labelledby="booking-service-type-label"
                  >
                    {SERVICE_OPTIONS.map((opt) => {
                      const selected = field.value === opt.id;
                      const svc = SERVICES.find((s) => s.id === opt.id);
                      const msgKey = serviceIdToMessageKey(opt.id);
                      const Icon = svc?.icon ? serviceOptionIcons[svc.icon] ?? MapPin : MapPin;
                      const isVasteras = opt.id === "vasteras-route";
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            if (opt.id === "vasteras-route" && field.value !== "vasteras-route") {
                              setValue("pickupLocation", "", { shouldValidate: false });
                              setValue("dropoffLocation", "", { shouldValidate: false });
                            }
                            field.onChange(opt.id);
                          }}
                          className={`rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:p-5 ${
                            isVasteras ? "sm:col-span-2" : ""
                          } ${
                            selected
                              ? "border-2 border-[var(--accent)] bg-[var(--accent)]/10 shadow-md ring-1 ring-[var(--accent)]/25"
                              : "border border-neutral-600 bg-neutral-800/40 hover:border-neutral-500"
                          }`}
                        >
                          <div className="flex gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  selected ? "bg-[var(--accent)] text-black" : "bg-neutral-700 text-white/80"
                                }`}
                              >
                                <Icon className="h-5 w-5" aria-hidden />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white">{t(`serviceType_${msgKey}`)}</p>
                                <p className="mt-0.5 text-sm text-white/55">{tSvc(`${msgKey}.description`)}</p>
                                {svc?.priceLabel ? (
                                  <p className="mt-1 text-sm font-bold text-[var(--accent)]">{svc.priceLabel}</p>
                                ) : null}
                              </div>
                            </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.serviceType && (
                <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">
                  {errors.serviceType.message}
                </p>
              )}
            </div>

          {serviceType !== "city-tour" && serviceType !== "custom-route" && (
            <div className="rounded-lg border-2 border-[var(--accent)]/60 bg-[var(--accent)]/5 p-4 ring-1 ring-[var(--accent)]/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                {t("distanceCalculator", { maxKm: MAX_DISTANCE_KM })}
              </div>
              <p className="mt-1 text-xs text-white/50">{t("enterAddresses")}</p>
              {distanceState.loading && (
                <div className="mt-2 flex items-center gap-2 text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("calculating")}</span>
                </div>
              )}
              {!distanceState.loading && distanceState.distanceKm !== null && distanceState.withinLimit && (
                <p className="mt-2 text-green-500">
                  {t("distanceWithin", { km: distanceState.distanceKm })}
                  {distanceState.durationMin != null ? (
                    <span className="ml-2 text-white/50">
                      {t("durationApprox", { minutes: distanceState.durationMin })}
                    </span>
                  ) : null}
                </p>
              )}
              {!distanceState.loading &&
                distanceState.distanceKm !== null &&
                !distanceState.withinLimit && (
                  <p className="mt-2 text-sm text-amber-200">
                    {t("distanceOverLimitSummary", {
                      km: distanceState.distanceKm,
                      maxKm: MAX_DISTANCE_KM,
                    })}
                    {distanceState.durationMin != null ? (
                      <span className="ml-2 text-white/60">
                        {t("durationApprox", { minutes: distanceState.durationMin })}
                      </span>
                    ) : null}
                  </p>
                )}
              {!distanceState.loading && distanceState.error && distanceState.distanceKm === null && (
                <p className="mt-3 text-sm text-amber-500">{distanceState.error}</p>
              )}
            </div>
          )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">{t("pickupDateLabel")}</label>
            <DatePicker
              selected={watch("pickupDate")}
              onChange={(date: Date | null) => setValue("pickupDate", date ?? new Date(), { shouldValidate: true })}
              minDate={new Date()}
              dateFormat="PPP"
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.pickupDate ? "border-red-500" : "border-neutral-700"}`}
              placeholderText={t("selectDatePh")}
              onBlur={() => trigger("pickupDate")}
            />
            {errors.pickupDate && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.pickupDate.message as string}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">{t("pickupTimeLabel")}</label>
            <input
              {...register("pickupTime")}
              type="time"
              className={`w-full rounded-lg border px-4 py-2.5 pr-10 bg-[var(--dark-slate)]/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [&::-webkit-datetime-edit]:text-white [&::-webkit-calendar-picker-indicator]:opacity-60 ${errors.pickupTime ? "border-red-500" : "border-neutral-700"}`}
            />
            {errors.pickupTime && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.pickupTime.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">{t("passengersLabel")}</label>
          <select
            {...register("passengers")}
            className={`w-full rounded-lg border px-4 py-2.5 pr-10 bg-[var(--dark-slate)]/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [&:not([multiple])]:appearance-none [&:not([multiple])]:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&:not([multiple])]:bg-[length:1.25rem] [&:not([multiple])]:bg-[right_0.75rem_center] [&:not([multiple])]:bg-no-repeat ${errors.passengers ? "border-red-500" : "border-neutral-700"}`}
          >
            {PASSENGER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.passengers && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.passengers.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">{t("pickupLocationLabel")}</label>
          {isPickupLocked && <p className="mb-1 text-xs text-white/50">{t("predefinedPackage")}</p>}
          {isPickupLocked ? (
            <input
              {...register("pickupLocation")}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white opacity-90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder=""
            />
          ) : (
            <Controller
              name="pickupLocation"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <AddressAutocomplete
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("addressPlaceholder")}
                    className={`min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.pickupLocation ? "border-red-500" : "border-neutral-700"} bg-[var(--dark-slate)]/50`}
                  />
                  <PickupCurrentLocationButton
                    messages={{
                      locating: t("currentLocationLocating"),
                      useShort: t("currentLocationUseShort"),
                      denied: t("currentLocationDenied"),
                      unavailable: t("currentLocationUnavailable"),
                      reverseFailed: t("currentLocationReverseFailed"),
                      ariaLabel: t("currentLocationAria"),
                    }}
                    onAddress={(addr) => {
                      field.onChange(addr);
                      void trigger("pickupLocation");
                    }}
                  />
                </div>
              )}
            />
          )}
          {errors.pickupLocation && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.pickupLocation.message}</p>
          )}
          {serviceType === "airport-dropoff" && !distanceState.withinLimit && distanceState.distanceKm !== null && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-xs leading-relaxed text-red-400">
              {t("distanceExceeds", {
                km: distanceState.distanceKm ?? 0,
                maxKm: MAX_DISTANCE_KM,
              })}
            </p>
          )}
          {serviceType === "airport-dropoff" && distanceState.withinLimit && distanceState.distanceKm !== null && !distanceState.loading && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-green-500">
              {t("pickupWithinArea", { km: distanceState.distanceKm ?? 0 })}
            </p>
          )}
        </div>

        {(serviceType === "airport-pickup" ||
          serviceType === "airport-dropoff" ||
          serviceType === "vasteras-route" ||
          serviceType === "custom-route") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">{t("dropoffLocationLabel")}</label>
            {isDropoffLocked && <p className="mb-1 text-xs text-white/50">{t("predefinedPackage")}</p>}
            {isDropoffLocked ? (
              <input
                {...register("dropoffLocation")}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white opacity-90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder=""
              />
            ) : (
              <Controller
                name="dropoffLocation"
                control={control}
                render={({ field }) => (
                  <AddressAutocomplete
                    {...field}
                    value={field.value ?? ""}
                    placeholder={t("addressPlaceholder")}
                    className={`w-full rounded-lg border px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.dropoffLocation ? "border-red-500" : "border-neutral-700"} bg-[var(--dark-slate)]/50`}
                  />
                )}
              />
            )}
            {errors.dropoffLocation && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.dropoffLocation.message}</p>
            )}
            {serviceType === "airport-pickup" && !distanceState.withinLimit && distanceState.distanceKm !== null && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-xs leading-relaxed text-red-400">
                {t("distanceExceeds", {
                  km: distanceState.distanceKm ?? 0,
                  maxKm: MAX_DISTANCE_KM,
                })}
              </p>
            )}
            {serviceType === "vasteras-route" && !distanceState.withinLimit && distanceState.distanceKm !== null && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-xs leading-relaxed text-red-400">
                {t("distanceExceeds", {
                  km: distanceState.distanceKm ?? 0,
                  maxKm: MAX_DISTANCE_KM,
                })}
              </p>
            )}
            {serviceType === "airport-pickup" && distanceState.withinLimit && distanceState.distanceKm !== null && !distanceState.loading && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-green-500">
                {t("dropoffWithinArea", { km: distanceState.distanceKm ?? 0 })}
              </p>
            )}
          </div>
        )}

        {distanceOverLimit && (
          <div className="rounded-lg border border-amber-600/50 bg-amber-950/25 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-left">
              <input
                type="checkbox"
                checked={agreedExtraDistanceCharge}
                onChange={(e) => setAgreedExtraDistanceCharge(e.target.checked)}
                className="mt-1 size-4 shrink-0 rounded border-neutral-500 accent-[var(--accent)]"
              />
              <span className="text-sm leading-snug text-white/90">
                {t("extraDistanceChargeAgree", {
                  amount: EXTRA_DISTANCE_CHARGE_SEK_PER_KM,
                  maxKm: MAX_DISTANCE_KM,
                })}
              </span>
            </label>
          </div>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!step1TripComplete || isValidating}
          className="w-full rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isValidating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("validating")}
            </span>
          ) : (
            t("nextPayment")
          )}
        </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Step2Payment({
  register,
  errors,
  trigger,
  getValues,
  packagePrice,
  packageDisplayName,
  localeTag,
  onComplete,
  onCustomRouteComplete,
  persistConfirmationDraft,
}: {
  register: ReturnType<typeof useForm<BookingFormData>>["register"];
  errors: ReturnType<typeof useForm<BookingFormData>>["formState"]["errors"];
  trigger: ReturnType<typeof useForm<BookingFormData>>["trigger"];
  getValues: () => BookingFormData;
  packagePrice: string;
  packageDisplayName: string;
  localeTag: string;
  onComplete: () => void;
  onCustomRouteComplete: () => void;
  persistConfirmationDraft: () => void;
}) {
  const t = useTranslations("booking");
  const tSite = useTranslations("site");
  const { nextStep, previousStep } = useWizard();
  const [paying, setPaying] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [stripePaymentFailed, setStripePaymentFailed] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeBusy, setStripeBusy] = useState(false);
  const stripePayFormId = useId();
  const data = getValues();
  const isCustomRoute = data.serviceType === "custom-route";

  const paymentCompletedRef = useRef(false);

  const walletDone = useCallback(() => {
    if (paymentCompletedRef.current) return;
    paymentCompletedRef.current = true;
    persistConfirmationDraft();
    onComplete();
    nextStep();
  }, [onComplete, nextStep, persistConfirmationDraft]);

  const onStripeConfigError = useCallback(() => {
    setStripePaymentFailed(true);
    setStripeReady(false);
  }, []);

  const serviceRecord = SERVICES.find((s) => s.id === data.serviceType);
  const stripeCheckoutActive =
    !isCustomRoute &&
    !stripePaymentFailed &&
    isStripePaymentsConfigured() &&
    serviceRecord?.price !== null &&
    serviceRecord?.price !== undefined;

  const handlePay = useCallback(async () => {
    const ok = await trigger([...BOOKING_STEP2_CONTACT_FIELDS]);
    if (!ok) return;
    persistConfirmationDraft();
    setPaying(true);
    setTimeout(() => {
      onComplete();
      nextStep();
      setPaying(false);
    }, 800);
  }, [trigger, onComplete, nextStep, persistConfirmationDraft]);

  const handleStripePayClick = useCallback(async () => {
    const ok = await trigger([...BOOKING_STEP2_CONTACT_FIELDS]);
    if (!ok) return;
    persistConfirmationDraft();
    const form = document.getElementById(stripePayFormId);
    if (form instanceof HTMLFormElement) form.requestSubmit();
  }, [trigger, stripePayFormId, persistConfirmationDraft]);

  const handleCustomQuote = useCallback(async () => {
    setQuoteSubmitting(true);
    const ok = await trigger([...BOOKING_STEP2_CONTACT_FIELDS]);
    setQuoteSubmitting(false);
    if (!ok) return;
    persistConfirmationDraft();
    onCustomRouteComplete();
    nextStep();
  }, [trigger, onCustomRouteComplete, nextStep, persistConfirmationDraft]);

  return (
    <div className="mt-6 space-y-6">
      {/* Booking Summary */}
      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800/90 shadow-lg">
        <div className="flex items-start gap-3 border-b border-neutral-600/60 bg-neutral-900/50 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]">
            <ClipboardList className="h-5 w-5 text-black" aria-hidden />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              {t("bookingSummary")}
            </h4>
            <p className="mt-1 text-sm text-white/60">
              {tSite("vehicleShort")}
              {packageDisplayName ? ` - ${packageDisplayName}` : ""}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                {t("serviceChip")}
              </p>
              <p className="mt-2 text-sm text-white">{t("taxiBooking")}</p>
            </div>
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                {t("routeChip")}
              </p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-white">
                <span>{data.pickupLocation || "—"}</span>
                <span className="flex items-center text-[var(--accent)]">
                  <ArrowDown className="h-4 w-4 shrink-0" aria-hidden />
                </span>
                <span>{data.dropoffLocation || "—"}</span>
              </div>
            </div>
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                {t("scheduleChip")}
              </p>
              <p className="mt-2 text-sm text-white">
                {formatBookingDateForDisplay(data.pickupDate, localeTag)}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--accent)]">{data.pickupTime || "—"}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                {t("passengersChip")}
              </p>
              <p className="mt-2 text-sm text-white">{data.passengers || "1"}</p>
            </div>
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                {t("totalChip")}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--accent)] sm:text-3xl">{packagePrice}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          <Users className="h-4 w-4 text-[var(--accent)]" aria-hidden />
          {t("passengerDetails")}
        </h4>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="fullName-step2" className="mb-1 block text-sm font-medium text-white/80">{t("fullNameLabel")}</label>
            <input
              id="fullName-step2"
              {...register("fullName")}
              autoComplete="name"
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.fullName ? "border-red-500" : "border-neutral-700"}`}
              placeholder={t("fullNamePh")}
            />
            {errors.fullName && (
              <p className="mt-2 text-sm leading-relaxed text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email-step2" className="mb-1 block text-sm font-medium text-white/80">{t("emailLabel")}</label>
            <input
              id="email-step2"
              {...register("email")}
              type="email"
              autoComplete="email"
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.email ? "border-red-500" : "border-neutral-700"}`}
              placeholder={t("emailPh")}
            />
            {errors.email && (
              <p className="mt-2 text-sm leading-relaxed text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone-step2" className="mb-1 block text-sm font-medium text-white/80">{t("phoneLabel")}</label>
            <input
              id="phone-step2"
              {...register("phone")}
              type="tel"
              autoComplete="tel"
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.phone ? "border-red-500" : "border-neutral-700"}`}
              placeholder={t("phonePh")}
            />
            {errors.phone && (
              <p className="mt-2 text-sm leading-relaxed text-red-500">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="message-step2" className="mb-1 block text-sm font-medium text-white/80">{t("yourMessageLabel")}</label>
            <textarea
              id="message-step2"
              {...register("message")}
              rows={3}
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.message ? "border-red-500" : "border-neutral-700"}`}
              placeholder={t("yourMessagePh")}
            />
            {errors.message && (
              <p className="mt-2 text-sm leading-relaxed text-red-500">{errors.message.message}</p>
            )}
          </div>
        </div>
      </div>

      {!isCustomRoute && (
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          <CreditCard className="h-4 w-4" />
          {t("completePayment")}
        </h4>
        <p className="mt-1 text-sm text-white/60">{t("secureRide")}</p>

        <div className="mt-4 space-y-4">
          {stripeCheckoutActive ? (
            <>
              <p className="text-sm font-medium text-white/80">{t("paymentInfo")}</p>
              <p className="text-xs text-white/45">{t("stripePaymentElementHint")}</p>
              <StripePaymentSection
                formId={stripePayFormId}
                serviceId={data.serviceType}
                locale={localeTag.startsWith("sv") ? "sv" : "en"}
                onPaid={walletDone}
                onConfigurationError={onStripeConfigError}
                onReadyChange={setStripeReady}
                onBusyChange={setStripeBusy}
                onBeforeConfirmPayment={persistConfirmationDraft}
              />
              <p className="flex items-center gap-2 text-xs text-white/50">
                <Lock className="h-3.5 w-3.5" />
                {t("encrypted")}
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-white/80">{t("paymentInfo")}</p>
              <p className="mb-3 text-xs text-white/50">{t("choosePayment")}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3 text-sm font-semibold text-white"
                >
                  <CreditCard className="h-5 w-5" />
                  {t("card")}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-white/80 hover:border-neutral-500"
                >
                  Klarna
                </button>
                <button
                  type="button"
                  aria-label={t("applePayAria")}
                  className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-white/80 hover:border-neutral-500"
                >
                  <Wallet className="h-5 w-5 shrink-0" aria-hidden />
                  {t("applePay")}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-white/80 hover:border-neutral-500"
                >
                  {t("amazonPay")}
                </button>
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
                  <Lock className="h-3.5 w-3.5" />
                  {t("secureBadge")}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder={t("cardNumberPh")}
                  className="w-full rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder={t("expiryPh")}
                    className="rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                  <input
                    type="text"
                    placeholder={t("cvcPh")}
                    className="rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <Lock className="h-3.5 w-3.5" />
                  {t("encrypted")}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => previousStep()}
          className="flex-1 rounded-lg border border-neutral-600 py-3 font-semibold text-white hover:bg-neutral-800"
        >
          {t("back")}
        </button>
        {isCustomRoute ? (
          <button
            type="button"
            onClick={() => void handleCustomQuote()}
            disabled={quoteSubmitting}
            className="flex-1 rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {quoteSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("validating")}
              </span>
            ) : (
              t("requestQuote")
            )}
          </button>
        ) : stripeCheckoutActive ? (
          <button
            type="button"
            onClick={() => void handleStripePayClick()}
            disabled={!stripeReady || stripeBusy}
            className="flex-1 rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {stripeBusy ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("processing")}
              </span>
            ) : (
              t("payAmount", { amount: packagePrice })
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={paying}
            className="flex-1 rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("processing")}
              </span>
            ) : (
              t("payAmount", { amount: packagePrice })
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Step3Confirmation({
  getValues,
  packagePrice,
  packageDisplayName,
  localeTag,
}: {
  getValues: () => BookingFormData;
  packagePrice: string;
  packageDisplayName: string;
  localeTag: string;
  service?: (typeof SERVICES)[number];
}) {
  const t = useTranslations("booking");
  const tSite = useTranslations("site");
  const router = useRouter();
  const data = getValues();
  const draftFallback =
    typeof window !== "undefined" ? readBookingConfirmationDraft() : null;
  const confettiFiredRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_HOME_MS / 1000));

  useEffect(() => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    const t1 = setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 200);
    const t2 = setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace("/");
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, router]);

  const isCustomRoute = data.serviceType === "custom-route";

  return (
    <div className="mt-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-6 text-center"
      >
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        {isCustomRoute ? (
          <>
            <h3 className="mt-4 text-xl font-semibold text-white">{t("quoteReceivedTitle")}</h3>
            <p className="mt-2 text-white/80">{t("quoteReceivedBody")}</p>
          </>
        ) : (
          <>
            <h3 className="mt-4 text-xl font-semibold text-white">{t("bookingConfirmedTitle")}</h3>
            <p className="mt-2 text-white/60">{t("bookingConfirmedBody")}</p>
          </>
        )}

        <div className="mt-6 rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 text-left">
          <p className="text-sm font-medium text-white/80">{t("summaryMini")}</p>
          <p className="mt-1 font-semibold text-white">{packageDisplayName}</p>
          <p className="text-sm text-white/60">{tSite("vehicleShort")}</p>
          <div className="mt-3 space-y-1 text-sm text-white/80">
            <p>
              {t("routeSummary", {
                pickup: data.pickupLocation || draftFallback?.pickupLocation || "—",
                dropoff: data.dropoffLocation || draftFallback?.dropoffLocation || "—",
              })}
            </p>
            <p>
              {t("dateSummary", {
                date: formatBookingDateForDisplay(data.pickupDate ?? draftFallback?.pickupDate, localeTag),
              })}
            </p>
            <p>{t("timeSummary", { time: data.pickupTime || draftFallback?.pickupTime || "—" })}</p>
            <p>{t("passengersSummary", { passengers: data.passengers || draftFallback?.passengers || "—" })}</p>
          </div>
          {!isCustomRoute && (
            <p className="mt-3 text-lg font-bold text-[var(--accent)]">
              {t("totalSummary", { price: packagePrice })}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-neutral-700 bg-neutral-900/40 p-4 text-center">
          <p className="text-sm text-white/75">{t("googleReviewAfterBooking")}</p>
          <a
            href={googleReviewsInviteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 text-sm font-semibold text-[var(--accent)] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline"
          >
            {t("googleReviewAfterBookingCta")}
          </a>
        </div>

        <div
          className="mt-6 rounded-lg border border-[var(--accent)]/35 bg-neutral-950/70 px-4 py-4 text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm text-white/75">{t("redirectHomeNotice")}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--accent)] sm:text-4xl">
            {secondsLeft > 0 ? secondsLeft : "…"}
            <span className="ml-1.5 text-lg font-semibold text-white/50 sm:text-xl">
              {t("redirectSecondsShort")}
            </span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-700">
            <motion.div
              className="h-full origin-left bg-[var(--accent)]"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: REDIRECT_HOME_MS / 1000, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
