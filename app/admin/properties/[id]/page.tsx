import { Suspense } from "react";
import { EditPropertyInner } from "@/components/admin/EditPropertyInner";

/**
 * Server component shell. The dynamic `id` is read via useParams() in the
 * client inner component, which is wrapped in <Suspense> so the route keeps a
 * prerenderable static shell under cacheComponents and streams the edit form in.
 */
export default function EditPropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-cream-50">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-espresso-300 border-t-transparent" />
        </div>
      }
    >
      <EditPropertyInner />
    </Suspense>
  );
}
