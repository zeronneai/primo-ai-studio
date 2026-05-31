"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import { useSuperAdminContext } from "@/lib/auth/hooks";
import { getUserWorkspaces } from "@/lib/auth/permissions";
import { getWorkspaceById } from "@/lib/data/workspaces-store";
import type { Workspace } from "@/types";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

export default function LandingPage() {
  const router = useRouter();
  const { isLoaded, isSuperAdmin, email, user } = useSuperAdminContext();
  const isSignedIn = !!user;

  const [myWorkspaces, setMyWorkspaces] = useState<Workspace[] | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const ids = getUserWorkspaces(email);
    const list = ids
      .map((id) => getWorkspaceById(id))
      .filter((w): w is Workspace => !!w);
    setMyWorkspaces(list);

    // Miembro de exactamente 1 workspace (y no super admin) → redirect.
    if (!isSuperAdmin && list.length === 1) {
      router.replace(`/${list[0].slug}`);
    }
  }, [isLoaded, isSignedIn, isSuperAdmin, email, router]);

  // ── Usuario logueado: vistas según rol ──────────────────────
  if (isSignedIn) {
    // Esperando carga de membresías
    if (myWorkspaces === null) {
      return <CenterSpinner />;
    }

    // Super admin
    if (isSuperAdmin) {
      return (
        <ShellCentered>
          <h1 className="font-display text-5xl tracking-tight mb-4">
            BIENVENIDO, ADMIN
          </h1>
          <p className="text-primo-muted mb-8">
            Gestiona los workspaces de Primo o explora la demo.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-primo-accent text-primo-bg px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              <LayoutGrid className="h-4 w-4" />
              Ir al Admin
            </Link>
            <Link
              href="/torque"
              className="inline-flex items-center gap-2 border border-primo-border hover:border-primo-muted text-primo-text px-6 py-3 rounded-md font-medium transition-colors"
            >
              Ver workspace de demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ShellCentered>
      );
    }

    // Miembro de varios → selector
    if (myWorkspaces.length > 1) {
      return (
        <ShellCentered>
          <h1 className="font-display text-4xl tracking-tight mb-2">
            SELECCIONA TU WORKSPACE
          </h1>
          <p className="text-primo-muted mb-8">
            Tienes acceso a {myWorkspaces.length} workspaces.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {myWorkspaces.map((w) => (
              <Link
                key={w.id}
                href={`/${w.slug}`}
                className="flex items-center gap-3 bg-primo-surface border border-primo-border hover:border-primo-muted rounded-lg p-4 transition-colors text-left"
              >
                <div
                  className="h-10 w-10 rounded-md flex items-center justify-center font-display text-lg shrink-0"
                  style={{
                    backgroundColor: w.brand_colors.accent + "20",
                    color: w.brand_colors.accent,
                  }}
                >
                  {w.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-primo-text truncate">
                    {w.name}
                  </div>
                  <div className="text-xs font-mono text-primo-muted">
                    /{w.slug}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ShellCentered>
      );
    }

    // Sin workspaces y no es super admin
    if (myWorkspaces.length === 0) {
      return (
        <ShellCentered>
          <h1 className="font-display text-4xl tracking-tight mb-3">
            AÚN NO TIENES WORKSPACE
          </h1>
          <p className="text-primo-muted max-w-md mx-auto">
            Aún no estás asignado a ningún workspace. Contacta a tu
            administrador para que te dé acceso con tu correo.
          </p>
        </ShellCentered>
      );
    }

    // Caso list.length === 1 (no admin): el redirect ya está en curso.
    return <CenterSpinner />;
  }

  // ── Usuario NO logueado: landing normal ─────────────────────
  return (
    <main className="min-h-screen bg-primo-bg">
      {/* Header */}
      <header className="border-b border-primo-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PRIMO_LOGO_URL}
              alt="Primo AI Studio"
              className="h-10 w-auto rounded-md"
            />
            <span className="font-display text-xl tracking-wider">
              PRIMO AI STUDIO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-primo-muted hover:text-primo-text transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-primo-accent hover:bg-primo-accent/90 text-primo-bg font-medium px-4 py-2 rounded-md transition-colors"
            >
              Empezar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primo-surface border border-primo-border rounded-full px-4 py-1.5 text-xs text-primo-muted mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primo-accent animate-pulse" />
            Plataforma de generación visual con IA
          </div>

          <h1 className="font-display text-6xl md:text-8xl tracking-tight mb-6 leading-[0.95]">
            DISEÑO PREMIUM
            <br />
            <span className="text-primo-accent">EN SEGUNDOS</span>
          </h1>

          <p className="text-lg text-primo-muted max-w-xl mx-auto mb-10">
            Genera thumbnails, flyers y assets visuales consistentes con la
            identidad de cada marca. Tu equipo crea contenido premium 10x más
            rápido.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/torque"
              className="inline-flex items-center gap-2 bg-primo-accent hover:bg-primo-accent/90 text-primo-bg px-6 py-3 rounded-md font-medium transition-colors"
            >
              Ver demo de Torque
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 border border-primo-border hover:border-primo-muted text-primo-text px-6 py-3 rounded-md font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Multi-Marca"
            description="Cada cliente con su propio workspace, branding y estilos signature pre-cargados."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Generación Instantánea"
            description="Sube una imagen y un título. En segundos recibes prompts e imágenes finales listas."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Consistencia Garantizada"
            description="El sistema aprende del ADN visual de cada marca y nunca rompe la identidad."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primo-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-primo-muted">
          Primo AI Studio · Powered by Claude
        </div>
      </footer>
    </main>
  );
}

function CenterSpinner() {
  return (
    <div className="min-h-screen bg-primo-bg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primo-muted" />
    </div>
  );
}

function ShellCentered({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-primo-bg flex flex-col">
      <header className="border-b border-primo-border">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PRIMO_LOGO_URL}
              alt="Primo AI Studio"
              className="h-9 w-auto rounded-md"
            />
            <span className="font-display text-lg tracking-wider">
              PRIMO AI STUDIO
            </span>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>{children}</div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-primo-surface border border-primo-border rounded-lg p-6">
      <div className="h-10 w-10 rounded-md bg-primo-accent/10 text-primo-accent flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-primo-muted leading-relaxed">{description}</p>
    </div>
  );
}
