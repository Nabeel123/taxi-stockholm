"use client";

import Link from "next/link";
import { Share2, ThumbsUp, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--dark-slate)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:items-center">
          {/* Left - Logo and copyright */}
          <div className="text-center md:text-left">
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
              <span className="text-lg font-bold text-white uppercase">
                Taxi Stockholm
              </span>
            </Link>
            <p className="mt-4 max-w-md text-center text-sm text-white/70 md:text-left">
              © {new Date().getFullYear()} Taxi Stockholm. All rights reserved.
              Your security and comfort is our highest priority.
            </p>
          </div>

          {/* Right - Social / share */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex items-center gap-4">
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
            <p className="text-center text-xs text-white/50 md:text-right">
              Developed for Taxi Stockholm • Premium Tesla Service
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
