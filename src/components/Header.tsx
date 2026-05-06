"use client";

import {
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function navLinkHash(href: string): "" | `#${string}` {
  if (!href.includes("#")) return "";
  const id = href.split("#")[1];
  return id ? (`#${id}` as `#${string}`) : "";
}

function isNavLinkActive(pathname: string, locationHash: string, href: string): boolean {
  const onHome = pathname === "/";
  if (!onHome) return false;
  const anchor = navLinkHash(href);
  if (href === "/" || anchor === "") {
    const h = locationHash || "";
    return h === "" || h === "#";
  }
  return locationHash === anchor;
}

/** Shared classes: accent underline only when active */
function navLinkClassName(active: boolean): string {
  const base =
    "font-medium uppercase tracking-wide transition-colors duration-300 ease-out text-sm lg:text-sm";
  if (active) {
    return `${base} text-accent underline decoration-accent decoration-2 underline-offset-[10px]`;
  }
  return `${base} text-neutral-600 hover:text-primary`;
}

const LOCATION_SYNC = "header:locationsync";

function subscribeLocation(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener(LOCATION_SYNC, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(LOCATION_SYNC, onChange);
  };
}

function getLocationHash(): string {
  return window.location.hash;
}

export default function Header() {
  const t = useTranslations("header");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const locationHash = useSyncExternalStore(
    subscribeLocation,
    getLocationHash,
    () => "",
  );

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/#about", label: t("about") },
    { href: "/#services", label: t("services") },
    { href: "/#reviews", label: t("reviews") },
  ] as const;

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (pathname !== "/") return;
      if (href === "/") {
        e.preventDefault();
        document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", pathname);
        window.dispatchEvent(new Event(LOCATION_SYNC));
        setMobileMenuOpen(false);
        return;
      }
      const id = href.split("#")[1];
      if (id) {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        const nextHash = `#${id}`;
        window.history.replaceState(null, "", `${pathname}${nextHash}`);
        window.dispatchEvent(new Event(LOCATION_SYNC));
        setMobileMenuOpen(false);
      }
    },
    [pathname],
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white shadow-sm">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={t("homeAria")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent sm:h-9 sm:w-9">
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

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 xl:gap-6 lg:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, locationHash, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={navLinkClassName(active)}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/book"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-md transition-all duration-300 ease-out hover:bg-accent-hover hover:shadow-lg sm:px-5 sm:py-2.5"
          >
            {t("bookNow")}
          </Link>
          <button
            type="button"
            className="-m-2 p-2 text-neutral-600 hover:text-primary lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("toggleMenu")}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
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
              {navLinks.map((link) => {
                const active = isNavLinkActive(pathname, locationHash, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`py-3 ${navLinkClassName(active)}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
