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
  if (href === "/") {
    if (pathname !== "/") return false;
    const h = locationHash || "";
    return h === "" || h === "#";
  }
  if (!href.includes("#")) {
    return pathname === href;
  }
  if (pathname !== "/") return false;
  const anchor = navLinkHash(href);
  return anchor !== "" && locationHash === anchor;
}

/** Active link: navy text + underline (readable on white; avoids low-contrast yellow-on-white). */
function navLinkClassName(active: boolean): string {
  const base =
    "font-medium uppercase tracking-wide transition-colors duration-300 ease-out text-sm lg:text-sm";
  if (active) {
    return `${base} text-primary underline decoration-primary decoration-2 underline-offset-[10px]`;
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
    { href: "/contact", label: t("contact") },
  ] as const;

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href === "/") {
        if (pathname !== "/") {
          setMobileMenuOpen(false);
          return;
        }
        e.preventDefault();
        document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", pathname);
        window.dispatchEvent(new Event(LOCATION_SYNC));
        setMobileMenuOpen(false);
        return;
      }
      if (!href.includes("#")) {
        setMobileMenuOpen(false);
        return;
      }
      if (pathname !== "/") return;
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/90 bg-white/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/85 pt-[env(safe-area-inset-top,0px)]">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 min-w-11 shrink-0 touch-manipulation items-center"
          aria-label={t("homeAria")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent shadow-sm sm:h-10 sm:w-10">
            <svg
              className="h-[1.125rem] w-[1.125rem] text-black sm:h-5 sm:w-5"
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/book"
            className="touch-manipulation rounded-[10px] bg-accent px-3.5 py-2.5 text-[11px] font-bold uppercase leading-none tracking-wide text-black shadow-md transition-all duration-200 ease-out hover:bg-accent-hover hover:shadow-lg sm:text-sm sm:px-5 sm:py-3"
          >
            {t("bookNow")}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[10px] text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={t("toggleMenu")}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              key="nav-backdrop"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden
              tabIndex={-1}
              className="fixed inset-x-0 bottom-0 z-40 bg-[color-mix(in_oklab,var(--primary)_42%,transparent)] backdrop-blur-[2px] lg:hidden top-[calc(env(safe-area-inset-top,0px)+3.5rem)] sm:top-[calc(env(safe-area-inset-top,0px)+4rem)]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="nav-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 lg:hidden"
            >
              <nav
                className="mx-3 mb-3 flex flex-col gap-0.5 rounded-2xl border border-neutral-200/90 bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-xl shadow-neutral-900/10"
                aria-label={t("mobileNavAria")}
              >
                {navLinks.map((link) => {
                  const active = isNavLinkActive(pathname, locationHash, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`touch-manipulation rounded-xl border-l-[3px] px-4 py-3.5 font-heading text-[0.9375rem] font-bold uppercase tracking-[0.14em] transition-colors sm:text-sm ${
                        active
                          ? "border-primary bg-neutral-100 text-primary"
                          : "border-transparent text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
