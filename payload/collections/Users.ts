import type { CollectionConfig } from "payload";

/**
 * Users collection — Payload's built-in auth.
 * First user creation screen appears at /admin on first visit.
 * No hardcoded passwords anywhere.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Full Name",
    },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      defaultValue: "editor",
      required: true,
    },
  ],
};
