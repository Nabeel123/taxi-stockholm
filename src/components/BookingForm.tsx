"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wizard, useWizard } from "react-use-wizard";
import confetti from "canvas-confetti";
import { Loader2, MapPin, CheckCircle, CreditCard, Lock, ArrowDown, ClipboardList, Users } from "lucide-react";
import { bookingSchema, type BookingFormData } from "@/lib/booking-schema";
import {
  SERVICE_OPTIONS,
  PASSENGER_OPTIONS,
} from "@/lib/booking-schema";
import { calculateRouteDistance, MAX_DISTANCE_KM } from "@/lib/distance";
import { SERVICES } from "@/lib/constants";
import AddressAutocomplete from "@/components/AddressAutocomplete";


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

const STEP_LABELS = ["Details", "Payment", "Confirm"] as const;

const AIRPORT_PICKUP_LOCATION = "Arlanda Airport, Stockholm";
const AIRPORT_DROPOFF_LOCATION = "Arlanda Airport, Stockholm";

function formatDateShort(d: Date | string): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }) ?? "—";
}

function formatDateLong(d: Date | string): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) ?? "—";
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  return (
    <div className="mt-6 mb-6 flex items-center justify-center gap-2 sm:gap-4">
      {STEP_LABELS.map((label, i) => (
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
          {i < STEP_LABELS.length - 1 && (
            <span className="mx-1 h-px w-4 bg-neutral-600 sm:mx-2 sm:w-8" />
          )}
        </div>
      ))}
    </div>
  );
}

function WizardHeader() {
  const { activeStep } = useWizard();
  return <StepIndicator activeStep={activeStep} />;
}

export default function BookingForm({
  defaultService,
  defaultPickup,
  defaultDropoff,
  onSuccess,
}: BookingFormProps) {
  const [shake, setShake] = useState(false);
  const [distanceState, setDistanceState] = useState<{
    loading: boolean;
    distanceKm: number | null;
    durationMin: number | null;
    withinLimit: boolean;
    error?: string;
  }>({ loading: false, distanceKm: null, durationMin: null, withinLimit: true });

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    getValues,
    trigger,
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

  const serviceType = watch("serviceType");
  const pickupLocation = watch("pickupLocation");
  const dropoffLocation = watch("dropoffLocation");

  // Apply URL/default params on mount or when defaults change
  useEffect(() => {
    if (!defaultService) return;
    const values = getValues();
    if (defaultService === "airport-dropoff") {
      reset({ ...values, serviceType: "airport-dropoff", pickupLocation: "", dropoffLocation: AIRPORT_DROPOFF_LOCATION });
    } else if (defaultService === "airport-pickup") {
      reset({ ...values, serviceType: "airport-pickup", pickupLocation: AIRPORT_PICKUP_LOCATION, dropoffLocation: "" });
    } else if (defaultService === "custom-route" && (defaultPickup || defaultDropoff)) {
      reset({ ...values, serviceType: "custom-route", pickupLocation: defaultPickup ?? "", dropoffLocation: defaultDropoff ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getValues is stable, we only want to run when URL params change
  }, [defaultService, defaultPickup, defaultDropoff]);

  useEffect(() => {
    if (serviceType === "airport-pickup") {
      setValue("pickupLocation", AIRPORT_PICKUP_LOCATION, { shouldValidate: false });
      setValue("dropoffLocation", "", { shouldValidate: false });
    } else if (serviceType === "airport-dropoff") {
      setValue("pickupLocation", "", { shouldValidate: false });
      setValue("dropoffLocation", AIRPORT_DROPOFF_LOCATION, { shouldValidate: false });
    }
  }, [serviceType, setValue]);

  const isPickupLocked = serviceType === "airport-pickup";
  const isDropoffLocked = serviceType === "airport-dropoff";

  const debouncedPickup = useDebounce(pickupLocation ?? "", 800);
  const debouncedDropoff = useDebounce(dropoffLocation ?? "", 800);

  const shouldCalculateDistance =
    serviceType !== "city-tour" &&
    serviceType !== "custom-route" &&
    debouncedPickup.trim().length >= 3 &&
    debouncedDropoff.trim().length >= 3;

  const runDistanceCalc = useCallback(async () => {
    if (!shouldCalculateDistance) {
      setDistanceState({
        loading: false,
        distanceKm: null,
        durationMin: null,
        withinLimit: true,
      });
      return;
    }
    setDistanceState((s) => ({ ...s, loading: true, error: undefined }));
    const result = await calculateRouteDistance(
      debouncedPickup,
      debouncedDropoff
    );
    setDistanceState({
      loading: false,
      distanceKm: result.distanceKm ?? null,
      durationMin: result.durationMin ?? null,
      withinLimit: result.withinLimit,
      error: result.error,
    });
  }, [shouldCalculateDistance, debouncedPickup, debouncedDropoff]);

  useEffect(() => {
    runDistanceCalc();
  }, [runDistanceCalc]);

  const service = SERVICES.find((s) => s.id === serviceType);
  const packageDisplayName = (service as { displayName?: string }).displayName ?? service?.name;
  const packagePrice = service?.priceLabel ?? "Quote";

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

  return (
    <div className={shake ? "animate-shake" : ""}>
      <Wizard header={serviceType === "custom-route" ? null : <WizardHeader />}>
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
          onCustomRouteComplete={handlePaymentComplete}
        />
        <Step2Payment
          getValues={getValues}
          packagePrice={packagePrice}
          packageDisplayName={packageDisplayName ?? ""}
          onComplete={handlePaymentComplete}
        />
        <Step3Confirmation
          getValues={getValues}
          packagePrice={packagePrice}
          packageDisplayName={packageDisplayName ?? ""}
        />
      </Wizard>
    </div>
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
  onCustomRouteComplete: () => void;
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
  onCustomRouteComplete,
}: Step1Props) {
  const { nextStep, goToStep } = useWizard();
  const [isValidating, setIsValidating] = useState(false);

  const onNext = async () => {
    setIsValidating(true);
    const valid = await trigger();
    const distanceOk =
      serviceType === "city-tour" ||
      serviceType === "custom-route" ||
      distanceState.distanceKm === null ||
      distanceState.withinLimit;
    setIsValidating(false);
    if (valid && distanceOk) {
      if (serviceType === "custom-route") {
        onCustomRouteComplete(); // Run completion logic (no payment step)
        goToStep(2); // Skip Payment, go directly to Confirm
      } else {
        nextStep();
      }
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
          <h4 className="text-base font-semibold text-white">Passenger Details</h4>
        </div>

        {/* Booking summary strip */}
        {service && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-700/80 bg-neutral-950/80 px-5 py-4">
            <div>
              <p className="font-semibold text-white">{packageDisplayName}</p>
              <p className="mt-0.5 text-sm text-white/60">Tesla Model S 2024</p>
            </div>
            <p className="text-xl font-bold text-[var(--accent)] sm:text-2xl">{packagePrice}</p>
          </div>
        )}

        {/* Form content */}
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          {serviceType !== "city-tour" && serviceType !== "custom-route" && (
            <div className="mb-6 rounded-lg border-2 border-[var(--accent)]/60 bg-[var(--accent)]/5 p-4 ring-1 ring-[var(--accent)]/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                Distance Calculator (up to {MAX_DISTANCE_KM} KM)
              </div>
              <p className="mt-1 text-xs text-white/50">Enter pickup and drop-off to see route distance</p>
              {distanceState.loading && (
                <div className="mt-2 flex items-center gap-2 text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Calculating...</span>
                </div>
              )}
              {!distanceState.loading && distanceState.distanceKm !== null && distanceState.withinLimit && (
                <p className="mt-2 text-green-500">
                  Distance: {distanceState.distanceKm} km ✓ (within limit)
                  {distanceState.durationMin && (
                    <span className="ml-2 text-white/50">~{distanceState.durationMin} min</span>
                  )}
                </p>
              )}
              {!distanceState.loading && distanceState.error && distanceState.distanceKm === null && (
                <p className="mt-3 text-sm text-amber-500">{distanceState.error}</p>
              )}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-white/80">Full Name *</label>
              <input
                id="fullName"
                {...register("fullName")}
                className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.fullName ? "border-red-500" : "border-neutral-700"}`}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-3 block min-h-6 text-left text-sm leading-relaxed text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">Email Address *</label>
              <input
                id="email"
                {...register("email")}
                type="email"
            className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.email ? "border-red-500" : "border-neutral-700"}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-3 block min-h-6 text-left text-sm leading-relaxed text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-white/80">Phone Number *</label>
              <input
                id="phone"
                {...register("phone")}
                className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.phone ? "border-red-500" : "border-neutral-700"}`}
                placeholder="+46 700 123 456"
              />
              {errors.phone && (
                <p className="mt-3 block min-h-6 text-left text-sm leading-relaxed text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="serviceType" className="mb-1 block text-sm font-medium text-white/80">Service Type *</label>
              <select
                id="serviceType"
                {...register("serviceType")}
            className={`w-full rounded-lg border px-4 py-2.5 pr-10 bg-[var(--dark-slate)]/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [&:not([multiple])]:appearance-none [&:not([multiple])]:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] [&:not([multiple])]:bg-[length:1.25rem] [&:not([multiple])]:bg-[right_0.75rem_center] [&:not([multiple])]:bg-no-repeat ${errors.serviceType ? "border-red-500" : "border-neutral-700"}`}
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          {errors.serviceType && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.serviceType.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Pickup Date *</label>
            <DatePicker
              selected={watch("pickupDate")}
              onChange={(date: Date | null) => setValue("pickupDate", date ?? new Date(), { shouldValidate: true })}
              minDate={new Date()}
              dateFormat="PPP"
              className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.pickupDate ? "border-red-500" : "border-neutral-700"}`}
              placeholderText="Select date"
              onBlur={() => trigger("pickupDate")}
            />
            {errors.pickupDate && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.pickupDate.message as string}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Pickup Time *</label>
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
          <label className="mb-1 block text-sm font-medium text-white/80">Passengers *</label>
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
          <label className="mb-1 block text-sm font-medium text-white/80">Pickup Location *</label>
          {isPickupLocked && <p className="mb-1 text-xs text-white/50">Predefined for this package</p>}
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
                <AddressAutocomplete
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Start typing an address in Sweden"
                  className={`w-full rounded-lg border px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.pickupLocation ? "border-red-500" : "border-neutral-700"} bg-[var(--dark-slate)]/50`}
                />
              )}
            />
          )}
          {errors.pickupLocation && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.pickupLocation.message}</p>
          )}
          {serviceType === "airport-dropoff" && !distanceState.withinLimit && distanceState.distanceKm !== null && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-xs leading-relaxed text-red-400">
              Distance {distanceState.distanceKm} km exceeds {MAX_DISTANCE_KM} km limit. Please contact us for longer journeys.
            </p>
          )}
          {serviceType === "airport-dropoff" && distanceState.withinLimit && distanceState.distanceKm !== null && !distanceState.loading && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-green-500">
              ✓ Pickup within service area ({distanceState.distanceKm} km from airport)
            </p>
          )}
        </div>

        {(serviceType === "airport-pickup" || serviceType === "airport-dropoff" || serviceType === "custom-route") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Drop-off Location *</label>
            {isDropoffLocked && <p className="mb-1 text-xs text-white/50">Predefined for this package</p>}
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
                    placeholder="Start typing an address in Sweden"
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
                Distance {distanceState.distanceKm} km exceeds {MAX_DISTANCE_KM} km limit. Please contact us for longer journeys.
              </p>
            )}
            {serviceType === "airport-pickup" && distanceState.withinLimit && distanceState.distanceKm !== null && !distanceState.loading && (
              <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-green-500">
                ✓ Dropoff within service area ({distanceState.distanceKm} km from airport)
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Your Message</label>
          <textarea
            {...register("message")}
            rows={3}
            className={`w-full rounded-lg border px-4 py-2.5 bg-[var(--dark-slate)]/50 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${errors.message ? "border-red-500" : "border-neutral-700"}`}
            placeholder="Any special requests?"
          />
          {errors.message && (
            <p className="mt-3 block min-h-[1.5rem] text-left text-sm leading-relaxed text-red-500">{errors.message.message}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={
            serviceType !== "city-tour" &&
            serviceType !== "custom-route" &&
            distanceState.distanceKm !== null &&
            !distanceState.withinLimit
          }
          className="w-full rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isValidating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Validating...
            </span>
          ) : serviceType === "custom-route" ? (
            "Request Quote →"
          ) : (
            "Next → Payment"
          )}
        </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Step2Payment({
  getValues,
  packagePrice,
  packageDisplayName,
  onComplete,
}: {
  getValues: () => BookingFormData;
  packagePrice: string;
  packageDisplayName: string;
  onComplete: () => void;
}) {
  const { nextStep, previousStep } = useWizard();
  const [paying, setPaying] = useState(false);
  const data = getValues();

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      onComplete();
      nextStep();
      setPaying(false);
    }, 800);
  };

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
              Booking Summary
            </h4>
            <p className="mt-1 text-sm text-white/60">Tesla Model S 2024{packageDisplayName ? ` - ${packageDisplayName}` : ""}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
          {/* Left column */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                Service
              </p>
              <p className="mt-2 text-sm text-white">Taxi Booking</p>
            </div>
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                Route
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
                Schedule
              </p>
              <p className="mt-2 text-sm text-white">
                {data.pickupDate ? formatDateShort(data.pickupDate as Date) : "—"}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--accent)]">{data.pickupTime || "—"}</p>
            </div>
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                Passengers
              </p>
              <p className="mt-2 text-sm text-white">{data.passengers || "1"}</p>
            </div>
            <div className="rounded-lg border border-neutral-600/60 bg-neutral-800/70 p-3 sm:p-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-[var(--accent)]" aria-hidden />
                Total
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--accent)] sm:text-3xl">{packagePrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Payment */}
      <div className="rounded-xl border border-neutral-700 bg-neutral-800/50 p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          <CreditCard className="h-4 w-4" />
          COMPLETE PAYMENT
        </h4>
        <p className="mt-1 text-sm text-white/60">Complete your payment to secure your Tesla ride</p>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-white/80">Payment Information</p>
          <p className="mb-3 text-xs text-white/50">Choose your preferred payment method</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-[var(--accent)]/10 px-4 py-3 text-sm font-semibold text-white"
            >
              <CreditCard className="h-5 w-5" />
              Card
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-white/80 hover:border-neutral-500"
            >
              Klarna
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/50 px-4 py-3 text-sm font-medium text-white/80 hover:border-neutral-500"
            >
              Amazon Pay
            </button>
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
              <Lock className="h-3.5 w-3.5" />
              SECURE
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Card number"
            className="w-full rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM/YY"
              className="rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <input
              type="text"
              placeholder="CVC"
              className="rounded-lg border border-neutral-700 bg-[var(--dark-slate)]/50 px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <p className="flex items-center gap-2 text-xs text-white/50">
            <Lock className="h-3.5 w-3.5" />
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => previousStep()}
          className="flex-1 rounded-lg border border-neutral-600 py-3 font-semibold text-white hover:bg-neutral-800"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="flex-1 rounded-lg bg-[var(--accent)] py-3 font-bold text-black transition-all hover:scale-[1.01] hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ${packagePrice}`
          )}
        </button>
      </div>
    </div>
  );
}

function Step3Confirmation({
  getValues,
  packagePrice,
  packageDisplayName,
}: {
  getValues: () => BookingFormData;
  packagePrice: string;
  packageDisplayName: string;
  service?: (typeof SERVICES)[number];
}) {
  const { previousStep, goToStep } = useWizard();
  const data = getValues();
  const confettiFiredRef = useRef(false);

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
            <h3 className="mt-4 text-xl font-semibold text-white">Quote Request Received!</h3>
            <p className="mt-2 text-white/80">
              We will send you the quote on email or text message.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-4 text-xl font-semibold text-white">Booking Confirmed!</h3>
            <p className="mt-2 text-white/60">
              We&apos;ve received your booking. You&apos;ll receive a confirmation email shortly.
            </p>
          </>
        )}

        <div className="mt-6 rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 text-left">
          <p className="text-sm font-medium text-white/80">Booking Summary</p>
          <p className="mt-1 font-semibold text-white">{packageDisplayName}</p>
          <p className="text-sm text-white/60">Tesla Model S 2024</p>
          <div className="mt-3 space-y-1 text-sm text-white/80">
            <p>Route: {data.pickupLocation || "—"} → {data.dropoffLocation || "—"}</p>
            <p>Date: {data.pickupDate ? formatDateLong(data.pickupDate as Date) : "—"}</p>
            <p>Time: {data.pickupTime || "—"}</p>
            <p>Passengers: {data.passengers || "—"}</p>
          </div>
          {!isCustomRoute && (
            <p className="mt-3 text-lg font-bold text-[var(--accent)]">Total: {packagePrice}</p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => (isCustomRoute ? goToStep(0) : previousStep())}
            className="flex-1 rounded-lg border border-neutral-600 py-2.5 font-medium text-white hover:bg-neutral-800"
          >
            ← Back
          </button>
          <Link
            href="/"
            className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 font-bold text-black transition-all hover:bg-[var(--accent-hover)] text-center"
          >
            Done
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
