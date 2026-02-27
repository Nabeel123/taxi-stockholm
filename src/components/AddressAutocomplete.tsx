"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window not available"));
      return;
    }
    if (window.google?.maps?.places) {
      resolve();
      return;
    }
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existing) {
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.places) resolve();
      else reject(new Error("Places library failed to load"));
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(function AddressAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = "Enter address in Sweden",
  className = "",
  disabled = false,
  id,
  "aria-label": ariaLabel,
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || disabled) {
      setReady(true);
      return;
    }
    loadGoogleMapsScript(apiKey)
      .then(() => setReady(true))
      .catch(() => setScriptError(true));
  }, [apiKey, disabled]);

  useEffect(() => {
    if (!ready || !inputRef.current || !window.google?.maps?.places || disabled || scriptError) return;

    // Clean up previous instance
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(
        autocompleteRef.current as unknown as google.maps.MVCObject
      );
      autocompleteRef.current = null;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "se" },
      types: ["address"],
      fields: ["formatted_address", "address_components"],
    });

    autocompleteRef.current = autocomplete;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const address = place.formatted_address ?? "";
      if (address) onChangeRef.current(address);
    });

    return () => {
      if (listener && google.maps.event) {
        google.maps.event.removeListener(listener);
      }
      autocompleteRef.current = null;
    };
  }, [ready, disabled, scriptError]);

  const setInputRef = (el: HTMLInputElement | null) => {
    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  // When no API key or script error, render plain input
  if (!apiKey || scriptError) {
    return (
      <input
        ref={setInputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        id={id}
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <input
      ref={setInputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      id={id}
      aria-label={ariaLabel}
      autoComplete="off"
    />
  );
});

export default AddressAutocomplete;
