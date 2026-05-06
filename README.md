# Taxi booking web app

Airport transfers and Stockholm taxi bookings — Next.js + TypeScript + Tailwind CSS.

## Features

- **Dark premium design** — Slate-900 background with electric blue accents
- **Popular services carousel** — Swipeable cards for Airport Pickup, Drop-off, City Tour, Custom Route
- **Book Your Ride section** — Quick service selection with fixed pricing (SEK)
- **Full booking form** — React Hook Form + Zod validation
- **Auto distance calculator** — Route distance up to 47 km (Nominatim + OSRM APIs)
- **Conditional form fields** — Flight number (Airport Pickup), Drop-off (hidden for City Tour)
- **Time validation** — Business hours 06:00–22:00, 15-min intervals
- **Success modal** — Booking confirmation with summary

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- React Hook Form + Zod
- React DatePicker
- Framer Motion
- Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, services, testimonials, CTA |
| `/book` | Booking form (supports `?service=airport-pickup` etc.) |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |

## Environment

No environment variables required. Distance calculator uses free public APIs:
- [Nominatim](https://nominatim.openstreetmap.org/) for geocoding
- [OSRM](https://project-osrm.org/) for route distance
