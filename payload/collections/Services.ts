import type { CollectionConfig } from "payload";

/**
 * Services collection — Warsi Real Estate Agency service offerings.
 * Pre-seeded with the 6 legal documentation services from the business card.
 */
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    group: "Content",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Service Title",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
    },
    {
      name: "icon",
      type: "select",
      label: "Icon",
      options: [
        { label: "Document", value: "document" },
        { label: "Shield", value: "shield" },
        { label: "Building", value: "building" },
        { label: "Key", value: "key" },
        { label: "Scale", value: "scale" },
        { label: "Search", value: "search" },
      ],
      defaultValue: "document",
    },
    {
      name: "order",
      type: "number",
      label: "Display Order",
      defaultValue: 0,
      admin: { description: "Lower number = appears first" },
    },
  ],
};
