"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  return (
    <AdminShell>
      <PropertyForm mode="create" />
    </AdminShell>
  );
}
