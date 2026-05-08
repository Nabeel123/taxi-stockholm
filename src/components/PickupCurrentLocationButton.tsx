"use client";

import { useCallback, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { reverseGeocodeToAddress } from "@/lib/reverse-geocode";

type Msg = {
  locating: string;
  useShort: string;
  denied: string;
  unavailable: string;
  reverseFailed: string;
  ariaLabel: string;
};

type Props = {
  onAddress: (address: string) => void;
  disabled?: boolean;
  messages: Msg;
};

export default function PickupCurrentLocationButton({ onAddress, disabled = false, messages }: Props) {
  const [phase, setPhase] = useState<"idle" | "locating" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    setErrorText(null);
    if (disabled) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPhase("error");
      setErrorText(messages.unavailable);
      return;
    }
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const addr = await reverseGeocodeToAddress(pos.coords.latitude, pos.coords.longitude);
        if (addr) {
          onAddress(addr);
          setErrorText(null);
          setPhase("idle");
        } else {
          setPhase("error");
          setErrorText(messages.reverseFailed);
        }
      },
      (err) => {
        setPhase("error");
        if (err.code === err.PERMISSION_DENIED) setErrorText(messages.denied);
        else setErrorText(messages.unavailable);
      },
      { enableHighAccuracy: true, timeout: 18_000, maximumAge: 30_000 }
    );
  }, [disabled, messages, onAddress]);

  return (
    <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:shrink-0">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={disabled || phase === "locating"}
        title={messages.ariaLabel}
        aria-label={messages.ariaLabel}
        className="inline-flex h-[42px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800/80 px-3 text-sm font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)]/55 hover:bg-neutral-700/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[10.5rem] sm:justify-center sm:px-3.5"
      >
        {phase === "locating" ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <span className="truncate">{messages.locating}</span>
          </>
        ) : (
          <>
            <LocateFixed className="size-4 shrink-0" aria-hidden />
            <span className="truncate sm:inline">{messages.useShort}</span>
          </>
        )}
      </button>
      {phase === "error" && errorText ? (
        <p className="text-xs leading-snug text-amber-400/95" role="alert">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
