"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useIsSuperAdmin } from "@/lib/auth/hooks";

// Botón "Admin" que solo aparece para super admins. Para usuarios
// normales no renderiza nada (transparente).
export function AdminLinkButton() {
  const isSuperAdmin = useIsSuperAdmin();
  if (!isSuperAdmin) return null;

  return (
    <Link
      href="/admin"
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primo-accent text-white hover:opacity-90 transition-opacity"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Admin
    </Link>
  );
}
