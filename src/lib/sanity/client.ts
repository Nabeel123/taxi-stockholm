import { createClient, type SanityClient } from "@sanity/client";

let client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  if (!projectId) return null;

  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    });
  }
  return client;
}
