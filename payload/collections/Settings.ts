import type { GlobalConfig } from "payload";

/**
 * Settings global — company-wide information for Warsi Real Estate Agency.
 * Stored as a single global document (not a collection), accessible at
 * /admin/globals/settings in the Payload admin panel.
 */
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Company Settings",
  admin: {
    group: "Configuration",
  },
  access: {
    read: () => true,
  },
  fields: [
    // ── Company Identity ──────────────────────────────────────────────
    {
      type: "collapsible",
      label: "Company Identity",
      fields: [
        {
          name: "companyName",
          type: "text",
          label: "Company Name (Agency)",
          defaultValue: "WARSI REAL ESTATE AGENCY",
        },
        {
          name: "groupName",
          type: "text",
          label: "Group Name",
          defaultValue: "WARSI JEE GROUP CONSTRUCTION COMPANY",
        },
        {
          name: "tagline",
          type: "text",
          label: "Tagline",
          defaultValue: "Building Dreams, Constructing the Future",
        },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          label: "Company Logo",
        },
      ],
    },
    // ── Contact Information ───────────────────────────────────────────
    {
      type: "collapsible",
      label: "Contact Information",
      fields: [
        {
          name: "ceoName",
          type: "text",
          label: "CEO Name",
          defaultValue: "Owais Ali Warsi",
        },
        {
          name: "phone",
          type: "text",
          label: "Phone Number",
          defaultValue: "0312-2249346",
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
        },
        {
          name: "address",
          type: "textarea",
          label: "Office Address",
          defaultValue:
            "House# R-670, Shop# 4, Sharifabad Near Al-Sufa Masjid, Block 1 F.B Area Karachi",
        },
        {
          name: "instagram",
          type: "text",
          label: "Instagram Handle",
        },
        {
          name: "whatsapp",
          type: "text",
          label: "WhatsApp Number",
          admin: { description: "With country code, e.g. +923122249346" },
        },
      ],
    },
    // ── Terms & Conditions ────────────────────────────────────────────
    {
      type: "collapsible",
      label: "Commission Terms",
      fields: [
        {
          name: "commissionSeller",
          type: "text",
          label: "Commission from Seller",
          defaultValue: "2.5%",
        },
        {
          name: "commissionPurchaser",
          type: "text",
          label: "Commission from Purchaser",
          defaultValue: "2.5%",
        },
        {
          name: "saleAgreementAt",
          type: "text",
          label: "On Sale/Purchase — At Agreement",
          defaultValue: "50% At Time of Agreement",
        },
        {
          name: "salePossessionAt",
          type: "text",
          label: "On Sale/Purchase — At Possession",
          defaultValue: "50% At Time of Possession",
        },
        {
          name: "rentalAgreementAt",
          type: "text",
          label: "Owner/Rental — At Agreement",
          defaultValue: "50% At Time of Agreement",
        },
        {
          name: "rentalPossessionAt",
          type: "text",
          label: "Owner/Rental — At Possession",
          defaultValue: "50% At Time of Possession",
        },
      ],
    },
    // ── Hero Section ──────────────────────────────────────────────────
    {
      type: "collapsible",
      label: "Hero Section",
      fields: [
        {
          name: "heroHeading",
          type: "text",
          label: "Main Heading",
          defaultValue: "INVEST INTERNATIONALLY TODAY",
        },
        {
          name: "heroSubheading",
          type: "textarea",
          label: "Subheading / Description",
        },
        {
          name: "heroImage",
          type: "upload",
          relationTo: "media",
          label: "Hero Background Image",
        },
      ],
    },
  ],
};
