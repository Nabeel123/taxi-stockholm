"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function isStripePaymentsConfigured(): boolean {
  return Boolean(publishableKey && publishableKey.length > 0);
}

/** Deprecated alias — use isStripePaymentsConfigured */
export function isStripeWalletConfigured(): boolean {
  return isStripePaymentsConfigured();
}

function StripeReturnCleanup({ onPaid }: { onPaid: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onPaidRef = useRef(onPaid);
  const fired = useRef(false);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    const status = searchParams.get("redirect_status");
    const pi = searchParams.get("payment_intent");
    if (status !== "succeeded" || !pi || fired.current) return;
    fired.current = true;
    onPaidRef.current();
    router.replace(pathname);
  }, [searchParams, router, pathname]);

  return null;
}

type PaymentFormProps = {
  formId: string;
  returnUrl: string;
  onPaid: () => void;
  onReady: () => void;
  onBusyChange?: (busy: boolean) => void;
};

function PaymentForm({ formId, returnUrl, onPaid, onReady, onBusyChange }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const onPaidRef = useRef(onPaid);
  const onBusyChangeRef = useRef(onBusyChange);
  const inFlightRef = useRef(false);

  useEffect(() => {
    onPaidRef.current = onPaid;
  }, [onPaid]);

  useEffect(() => {
    onBusyChangeRef.current = onBusyChange;
  }, [onBusyChange]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || inFlightRef.current) return;
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
};

export function StripePaymentSection({
  formId,
  serviceId,
  locale,
  onPaid,
  onConfigurationError,
  onReadyChange,
  onBusyChange,
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
      <Suspense fallback={null}>
        <StripeReturnCleanup onPaid={() => onPaidRef.current()} />
      </Suspense>
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
        />
      </Elements>
    </>
  );
}
