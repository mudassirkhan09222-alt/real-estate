"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminShell } from "./AdminShell";
import { PropertyForm } from "./PropertyForm";
import type { Property } from "@/lib/types";

/**
 * Client body for the admin edit page. `useParams()` reads the dynamic segment
 * at runtime, so this is rendered inside a <Suspense> boundary by the page
 * (a server component) — the static shell prerenders and this streams in.
 */
export function EditPropertyInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetch(`/api/properties/${id}`, { cache: "no-store" })
      .then((r) => {
        if (r.status === 404) setStatus("notfound");
        return r.json();
      })
      .then((d: Property | { error?: string }) => {
        if (!active) return;
        if (d && "id" in d) {
          setProperty(d);
          setStatus("ready");
        }
      })
      .catch(() => active && setStatus("notfound"));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <AdminShell>
      {status === "loading" ? (
        <div className="grid h-64 place-items-center">
          <Loader2 className="animate-spin text-espresso-400" />
        </div>
      ) : status === "notfound" ? (
        <p className="text-muted">Listing not found.</p>
      ) : property ? (
        <PropertyForm mode="edit" property={property} />
      ) : null}
    </AdminShell>
  );
}
