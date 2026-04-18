"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Share2, ThumbsUp, Mail } from "lucide-react";

const quickLinks = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  const pathname = usePathname();

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") return;
    const hash = href.split("#")[1];
    if (!hash) return;
    e.preventDefault();
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer id="contact" className="bg-[var(--dark-slate)] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 17h14v-5H5v5zm2-8h10V6H7v3z" />
                  <circle cx="7.5" cy="16" r="1.5" />
                  <circle cx="16.5" cy="16" r="1.5" />
                </svg>
              </div>
              <span className="font-heading text-lg font-bold uppercase text-white">
                Taxi Stockholm
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Premium Tesla Model S transfers in Greater Stockholm and Arlanda. Fixed prices, 24/7
              booking, professional chauffeurs.
            </p>
            <p className="mt-4 text-sm text-white/55">
              © {new Date().getFullYear()} Taxi Stockholm. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Quick links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleHashLink(e, item.href)}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/book"
                  className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  Book a ride
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Contact
            </h3>
            <ul className="mt-4 space-y-4 text-sm text-white/80">
              <li>
                <a
                  href="tel:+46700123456"
                  className="inline-flex items-center gap-2 whitespace-nowrap hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  +46 700 123 456
                </a>
              </li>
              <li>
                <a href="mailto:info@taxistockholm.se" className="hover:text-white">
                  info@taxistockholm.se
                </a>
              </li>
              <li className="flex gap-2 text-white/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>Stockholm metro area, Arlanda (ARN), Bromma, cruise terminals</span>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Share"
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Like"
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <a
                href="mailto:info@taxistockholm.se"
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
