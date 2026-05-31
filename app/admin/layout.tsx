"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSuperAdminContext } from "@/lib/auth/hooks";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/Toast";
import { seedDefaultMembers } from "@/lib/data/members-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuperAdmin, isLoaded } = useSuperAdminContext();
  const router = useRouter();

  // Asegura el seed de miembros (Torque owner) en el cliente. Idempotente.
  useEffect(() => {
    seedDefaultMembers();
  }, []);

  useEffect(() => {
    if (isLoaded && !isSuperAdmin) {
      router.replace("/");
    }
  }, [isLoaded, isSuperAdmin, router]);

  // Cargando Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-primo-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primo-muted" />
      </div>
    );
  }

  // No autorizado: mostramos mensaje mientras el redirect se ejecuta.
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-primo-bg flex flex-col items-center justify-center p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-primo-surface border border-primo-border flex items-center justify-center mb-5">
          <ShieldAlert className="h-7 w-7 text-primo-accent" />
        </div>
        <h1 className="font-display text-4xl tracking-tight mb-3">
          ACCESO RESTRINGIDO
        </h1>
        <p className="text-primo-muted max-w-md mb-6">
          Esta área es solo para administradores de Primo.
        </p>
        <Link
          href="/"
          className="bg-primo-accent text-primo-bg px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-primo-bg text-primo-text">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
