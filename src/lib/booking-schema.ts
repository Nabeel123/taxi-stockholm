import { z } from "zod";

const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const serviceTypes = [
  "vasteras-route",
  "airport-pickup",
  "airport-dropoff",
  "city-tour",
  "custom-route",
] as const;

const passengerOptions = ["1", "2", "3", "4", "5", "6+"] as const;

export const bookingSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .regex(emailRegex, "Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(phoneRegex, "Please enter a valid phone number"),
    serviceType: z.enum(serviceTypes, {
      message: "Please select a service type",
    }),
    pickupDate: z.date({ message: "Pickup date is required" }),
    pickupTime: z
      .string()
      .min(1, "Pickup time is required")
      .refine((t) => {
        const [h, m] = t.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) return false;
        return h >= 0 && h <= 23 && m >= 0 && m <= 59;
      }, "Please enter a valid time"),
    flightNumber: z.string().optional(),
    passengers: z.enum(passengerOptions, {
      message: "Please select number of passengers",
    }),
    pickupLocation: z
      .string()
      .min(1, "Pickup location is required")
      .min(2, "Pickup location must be at least 2 characters"),
    dropoffLocation: z.string().optional(),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.pickupDate && data.pickupDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pickup date cannot be in the past",
        path: ["pickupDate"],
      });
    }
    if (data.serviceType === "airport-pickup" && data.flightNumber) {
      if (data.flightNumber.trim().length > 0 && data.flightNumber.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Flight number must be at least 2 characters",
          path: ["flightNumber"],
        });
      }
    }
    if (data.serviceType !== "city-tour") {
      if (!data.dropoffLocation || data.dropoffLocation.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Drop-off location is required for this service",
          path: ["dropoffLocation"],
        });
      }
    }
  });

export type BookingFormData = z.infer<typeof bookingSchema>;

export const SERVICE_OPTIONS = serviceTypes.map((id) => ({
  id,
  label:
    id === "vasteras-route"
      ? "Västerås route"
      : id === "airport-pickup"
      ? "Airport Pickup"
      : id === "airport-dropoff"
        ? "Airport Drop-off"
        : id === "city-tour"
          ? "City Tour"
          : "Custom Route",
}));

export const PASSENGER_OPTIONS = passengerOptions.map((v) => ({
  value: v,
  label: v === "6+" ? "6+" : v,
}));
