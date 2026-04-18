import { defineField, defineType } from "sanity";

export const masthead = defineType({
  name: "masthead",
  title: "Masthead (homepage hero)",
  type: "document",
  fields: [
    defineField({
      name: "badgeText",
      title: "Badge / eyebrow",
      type: "string",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "Main hero title (single line or phrase).",
    }),
    defineField({
      name: "subheading",
      title: "Subheading",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "backgroundMode",
      title: "Background",
      type: "string",
      options: {
        list: [
          { title: "Video (desktop)", value: "video" },
          { title: "Image", value: "image" },
        ],
      },
      initialValue: "video",
    }),
    defineField({
      name: "backgroundVideo",
      title: "Background video file",
      description: "Uploaded MP4 (optional if you use external URL below).",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "backgroundVideoUrl",
      title: "Background video URL",
      description: "Full URL or site path, e.g. /masthead.mp4 — used if no file uploaded.",
      type: "string",
    }),
    defineField({
      name: "posterImage",
      title: "Video poster image",
      type: "image",
    }),
    defineField({
      name: "posterUrl",
      title: "Video poster URL",
      description: "e.g. /masthead.jpg if not using Sanity image.",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Masthead" }),
  },
});
