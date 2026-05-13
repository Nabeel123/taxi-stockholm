import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { applySupabaseSession } from "@/utils/supabase/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  return applySupabaseSession(request, response);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
