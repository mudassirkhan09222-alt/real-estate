"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PropertyForm from "../PropertyForm";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/properties/${id}`, { cache: "no-store" })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: "#666" }}>Loading…</p>;
  if (!data || data.error) return <p style={{ color: "#f87171" }}>Property not found.</p>;

  return (
    <PropertyForm
      mode="edit"
      initial={{
        id: Number(data.id),
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        price: Number(data.price ?? 0),
        location: String(data.location ?? ""),
        status: String(data.status ?? "draft"),
        availability: String(data.availability ?? "available"),
        availability: String(data.availability ?? "available"),
        images: Array.isArray(data.images)
          ? (data.images as { id: number; filePath: string }[]).map(i => ({ id: i.id, filePath: i.filePath }))
          : [],
      }}
    />
  );
}
