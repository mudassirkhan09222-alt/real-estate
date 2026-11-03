import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

/**
 * Properties collection — core listings.
 * Published listings appear on the public site immediately.
 * Images go through Payload's Media collection with automatic WebP conversion.
 */
export const Properties: CollectionConfig = {
  slug: "properties",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "location", "price", "status", "featured"],
    group: "Content",
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Property Title",
    },
    {
      name: "summary",
      type: "textarea",
      label: "Short Summary",
      admin: { description: "Shown on listing cards (1–2 sentences)" },
    },
    {
      name: "description",
      type: "richText",
      label: "Full Description",
      editor: lexicalEditor({}),
    },
    {
      name: "price",
      type: "number",
      required: true,
      label: "Price (PKR)",
      admin: { description: "Price in Pakistani Rupees" },
    },
    {
      name: "currency",
      type: "select",
      options: [
        { label: "PKR — Pakistani Rupee", value: "PKR" },
        { label: "USD — US Dollar", value: "USD" },
        { label: "AED — UAE Dirham", value: "AED" },
      ],
      defaultValue: "PKR",
      required: true,
    },
    {
      name: "location",
      type: "text",
      required: true,
      label: "Location",
      admin: { description: "e.g. DHA Phase 6, Karachi" },
    },
    {
      name: "city",
      type: "select",
      label: "City",
      options: [
        { label: "Karachi", value: "Karachi" },
        { label: "Lahore", value: "Lahore" },
        { label: "Islamabad", value: "Islamabad" },
        { label: "Rawalpindi", value: "Rawalpindi" },
        { label: "Hyderabad", value: "Hyderabad" },
        { label: "Peshawar", value: "Peshawar" },
        { label: "Quetta", value: "Quetta" },
        { label: "Other", value: "Other" },
      ],
      defaultValue: "Karachi",
    },
    {
      name: "type",
      type: "select",
      required: true,
      label: "Property Type",
      options: [
        { label: "House", value: "House" },
        { label: "Apartment / Flat", value: "Apartment" },
        { label: "Plot / Land", value: "Plot" },
        { label: "Shop / Commercial", value: "Shop" },
        { label: "Office", value: "Office" },
        { label: "Villa", value: "Villa" },
        { label: "Penthouse", value: "Penthouse" },
        { label: "Warehouse", value: "Warehouse" },
      ],
      defaultValue: "House",
    },
    {
      name: "purpose",
      type: "select",
      required: true,
      label: "Purpose",
      options: [
        { label: "Sale", value: "sale" },
        { label: "Rent", value: "rent" },
        { label: "Lease", value: "lease" },
      ],
      defaultValue: "sale",
    },
    {
      name: "bedrooms",
      type: "number",
      label: "Bedrooms",
      min: 0,
    },
    {
      name: "bathrooms",
      type: "number",
      label: "Bathrooms",
      min: 0,
    },
    {
      name: "areaSize",
      type: "number",
      label: "Area Size",
      admin: { description: "Numeric value (see unit below)" },
    },
    {
      name: "areaUnit",
      type: "select",
      label: "Area Unit",
      options: [
        { label: "Marla", value: "Marla" },
        { label: "Kanal", value: "Kanal" },
        { label: "Sq Ft", value: "SqFt" },
        { label: "Sq Yd", value: "SqYd" },
      ],
      defaultValue: "Marla",
    },
    {
      name: "yieldPercent",
      type: "number",
      label: "Forecast Yield %",
      admin: { description: "Projected annual rental yield (used in Yield Forecast calculator)" },
    },
    {
      name: "featured",
      type: "checkbox",
      label: "Featured Listing",
      defaultValue: false,
      admin: { description: "Featured listings appear first on the home page" },
    },
    {
      name: "images",
      type: "array",
      label: "Property Images",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          label: "Caption",
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      label: "Status",
      options: [
        { label: "Available", value: "available" },
        { label: "Sold", value: "sold" },
        { label: "Rented", value: "rented" },
        { label: "Off Market", value: "off-market" },
      ],
      defaultValue: "available",
    },
    {
      name: "contactNumber",
      type: "text",
      label: "Contact Number",
      admin: { description: "Override contact number for this listing (optional)" },
    },
  ],
};
