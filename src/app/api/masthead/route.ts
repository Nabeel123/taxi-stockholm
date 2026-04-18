import { NextResponse } from "next/server";
import { MASTHEAD_REVALIDATE_SECONDS } from "@/lib/sanity/constants";
import { getMasthead } from "@/lib/sanity/masthead";

/**
 * JSON masthead for client hydration. Uses the same `unstable_cache` layer as the homepage.
 */
export async function GET() {
  const data = await getMasthead();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${MASTHEAD_REVALIDATE_SECONDS}, stale-while-revalidate=${MASTHEAD_REVALIDATE_SECONDS * 5}`,
    },
  });
}
