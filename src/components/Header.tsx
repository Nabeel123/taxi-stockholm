"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/") {
      if (href === "/") {
        e.preventDefault();
        document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
        return;
      }
      const hash = href.split("#")[1];
      if (hash) {
        e.preventDefault();
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--accent)] sm:h-9 sm:w-9">
            <svg
              className="h-4 w-4 text-black sm:h-5 sm:w-5"
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
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 xl:gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium uppercase tracking-wide text-neutral-600 transition-colors duration-300 ease-out hover:text-[var(--dark-slate)]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+46700123456"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-sm transition-all duration-300 ease-out hover:bg-[var(--accent-hover)] hover:shadow-md"
          >
            <Phone className="h-4 w-4 shrink-0" />
            Call Now
          </a>
          <a
            href="https://wa.me/46700123456"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--whatsapp-green)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 ease-out hover:bg-[var(--whatsapp-green-hover)] hover:shadow-md"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.151 1.03 7.045 2.903 1.894 1.903 2.903 4.375 2.903 7.034 0 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </nav>

        <div className="hidden shrink-0 items-center lg:flex">
          <Link
            href="/book"
            className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-[var(--accent-hover)]"
          >
            Book Now
          </Link>
        </div>

        <button
          type="button"
          className="-m-2 p-2 text-neutral-600 hover:text-[var(--dark-slate)] lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-200 bg-white lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="py-3 font-medium uppercase tracking-wide text-neutral-600 transition-colors duration-300 ease-out hover:text-[var(--dark-slate)]"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="tel:+46700123456"
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--accent)] py-3 font-bold uppercase tracking-wide text-black transition-all hover:bg-[var(--accent-hover)]"
              >
                <Phone className="h-4 w-4 shrink-0" />
                Call Now
              </a>
              <a
                href="https://wa.me/46700123456"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--whatsapp-green)] py-3 font-bold uppercase tracking-wide text-white transition-all hover:bg-[var(--whatsapp-green-hover)]"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.151 1.03 7.045 2.903 1.894 1.903 2.903 4.375 2.903 7.034 0 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <Link
                href="/book"
                className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-center font-bold uppercase tracking-wide text-black transition-all duration-300 ease-out hover:scale-[1.01] hover:bg-[var(--accent-hover)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
