"use client";

import { useEffect, useRef, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { usePathname } from "@/i18n/navigation";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function isStripePaymentsConfigured(): boolean {
  return Boolean(publishableKey && publishableKey.length > 0);
}

/** Deprecated alias — use isStripePaymentsConfigured */
export function isStripeWalletConfigured(): boolean {
  return isStripePaymentsConfigured();
}

type PaymentFormProps = {
  formId: string;
  returnUrl: string;
  onPaid: () => void;
  onReady: () => void;
  onBusyChange?: (busy: boolean) => void;
  onBeforeConfirmPayment?: () => void;
};

function PaymentForm({
  formId,
  returnUrl,
  onPaid,
  onReady,
  onBusyChange,
  onBeforeConfirmPayment,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const onPaidRef = useRef(onPaid);
  const onBusyChangeRef = useRef(onBusyChange);
  const onBeforeConfirmPaymentRef = useRef(onBeforeConfirmPayment);
  const inFlightRef = useRef(false);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    onBusyChangeRef.current = onBusyChange;
  }, [onBusyChange]);

  useEffect(() => {
    onBeforeConfirmPaymentRef.current = onBeforeConfirmPayment;
  }, [onBeforeConfirmPayment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || inFlightRef.current) return;
    onBeforeConfirmPaymentRef.current?.();
    inFlightRef.current = true;
    onBusyChangeRef.current?.(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });
    inFlightRef.current = false;
    onBusyChangeRef.current?.(false);
    if (!error) {
      onPaidRef.current();
    }
  }

  return (
    <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <PaymentElement
        onReady={onReady}
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />
    </form>
  );
}

export type StripePaymentSectionProps = {
  formId: string;
  serviceId: string;
  locale: "en" | "sv";
  onPaid: () => void;
  onConfigurationError?: () => void;
  onReadyChange?: (ready: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Called synchronously before `confirmPayment` (e.g. persist form draft before Stripe redirect). */
  onBeforeConfirmPayment?: () => void;
};

export function StripePaymentSection({
  formId,
  serviceId,
  locale,
  onPaid,
  onConfigurationError,
  onReadyChange,
  onBusyChange,
  onBeforeConfirmPayment,
}: StripePaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const onConfigurationErrorRef = useRef(onConfigurationError);
  const pathname = usePathname();
  const returnUrl =
    typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "";
  const onPaidRef = useRef(onPaid);

  useEffect(() => {
    onConfigurationErrorRef.current = onConfigurationError;
  }, [onConfigurationError]);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    if (!stripePromise) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId }),
      });
      const data: unknown = await res.json();
      if (cancelled) return;
      if (
        !res.ok ||
        typeof data !== "object" ||
        data === null ||
        !("clientSecret" in data) ||
        typeof (data as { clientSecret: unknown }).clientSecret !== "string"
      ) {
        onConfigurationErrorRef.current?.();
        setDismissed(true);
        return;
      }
      setClientSecret((data as { clientSecret: string }).clientSecret);
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (!stripePromise || dismissed) {
    return null;
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center py-10" role="status" aria-live="polite">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          locale: locale === "sv" ? "sv" : "en",
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#ffd60a",
              colorBackground: "#262626",
              colorText: "#fafafa",
              colorTextSecondary: "#a3a3a3",
              borderRadius: "10px",
            },
          },
        }}
      >
        <PaymentForm
          formId={formId}
          returnUrl={returnUrl}
          onPaid={() => onPaidRef.current()}
          onReady={() => onReadyChange?.(true)}
          onBusyChange={onBusyChange}
          onBeforeConfirmPayment={onBeforeConfirmPayment}
        />
      </Elements>
    </>
  );
}
