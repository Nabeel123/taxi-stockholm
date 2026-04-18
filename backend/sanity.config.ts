import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID. Create backend/.env from backend/.env.example (or export the variable) and restart `npm run studio`.",
  );
}

export default defineConfig({
  name: "default",
  title: "Taxi CMS",
  projectId,
  dataset,
  // Avoids router errors from Releases UI on non‑Enterprise / minimal studios (see Content Releases docs).
  releases: {
    enabled: false,
  },
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
