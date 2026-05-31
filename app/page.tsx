"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Loader2,
  LayoutGrid,
  Palette,
  Sparkles,
  Zap,
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
    if (myWorkspaces === null) return <CenterSpinner />;

    if (isSuperAdmin) {
      return (
        <ShellCentered>
          <h1 className="font-sans font-extrabold text-5xl tracking-tight text-primo-navy mb-4">
            Welcome, admin.
          </h1>
          <p className="text-primo-muted text-lg mb-8">
            Manage your Primo workspaces or explore the demo.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-primo-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <LayoutGrid className="h-4 w-4" />
              Go to Admin
            </Link>
            <Link
              href="/torque"
              className="inline-flex items-center gap-2 text-primo-navy font-semibold hover:text-primo-accent transition-colors"
            >
              See the demo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </ShellCentered>
      );
    }

    if (myWorkspaces.length > 1) {
      return (
        <ShellCentered>
          <h1 className="font-sans font-extrabold text-4xl tracking-tight text-primo-navy mb-2">
            Select your workspace
          </h1>
          <p className="text-primo-muted mb-8">
            You have access to {myWorkspaces.length} workspaces.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {myWorkspaces.map((w) => (
              <Link
                key={w.id}
                href={`/${w.slug}`}
                className="flex items-center gap-3 bg-primo-surface border border-primo-border hover:border-primo-accent rounded-2xl p-4 transition-colors text-left"
              >
                <div
                  className="h-10 w-10 rounded-md flex items-center justify-center font-bold text-lg shrink-0"
                  style={{
                    backgroundColor: w.brand_colors.accent + "20",
                    color: w.brand_colors.accent,
                  }}
                >
                  {w.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-primo-navy truncate">
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

    if (myWorkspaces.length === 0) {
      return (
        <ShellCentered>
          <h1 className="font-sans font-extrabold text-4xl tracking-tight text-primo-navy mb-3">
            No workspace yet
          </h1>
          <p className="text-primo-muted max-w-md mx-auto">
            You&apos;re not assigned to any workspace yet. Contact your
            administrator to get access with your email.
          </p>
        </ShellCentered>
      );
    }

    // list.length === 1 (no admin): redirect en curso.
    return <CenterSpinner />;
  }

  // ── Usuario NO logueado: landing ────────────────────────────
  return (
    <main className="min-h-screen bg-primo-bg text-primo-navy">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-primo-bg/90 backdrop-blur-sm border-b border-primo-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PRIMO_LOGO_URL}
              alt="Primo AI Studio"
              className="h-8 w-auto rounded-md"
            />
            <span className="font-sans font-bold tracking-tight text-lg">
              PRIMO AI STUDIO
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-primo-muted hover:text-primo-navy transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 bg-primo-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="container mx-auto px-6 min-h-[70vh] flex flex-col items-center justify-center text-center py-24">
        <p className="text-xs uppercase tracking-widest font-semibold text-primo-muted mb-6">
          Visual content, on-brand, at scale.
        </p>

        <h1 className="max-w-4xl leading-tight">
          <span className="font-sans font-extrabold text-5xl md:text-7xl text-primo-navy">
            Generate content that looks like{" "}
          </span>
          <span className="font-sans font-medium italic text-5xl md:text-7xl text-primo-accent">
            every client made it themselves.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-primo-muted mt-8 leading-relaxed">
          Primo AI Studio learns each brand&apos;s visual DNA — colors,
          typography, references — and generates thumbnails, flyers, and
          creative assets that stay perfectly consistent. Your team ships 10x
          faster without breaking the brand.
        </p>

        <div className="flex items-center justify-center gap-6 mt-12">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-primo-accent text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/torque"
            className="group inline-flex items-center gap-1.5 text-primo-navy font-semibold"
          >
            <span className="border-b-2 border-transparent group-hover:border-primo-accent transition-colors">
              See the demo
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-6 py-24">
        <p className="text-xs uppercase tracking-widest font-semibold text-primo-muted text-center mb-12">
          How it works
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <HowCard
            icon={<Palette className="h-6 w-6" />}
            iconBg="#E55B3C"
            title="One platform, every brand"
            description="Each client gets their own workspace with custom colors, typography, and visual references. Switch between brands without losing context."
          />
          <HowCard
            icon={<Sparkles className="h-6 w-6" />}
            iconBg="#F4C842"
            title="AI that learns your style"
            description="Upload past work and the system extracts the visual DNA automatically. Every generation stays consistent with what your brand actually looks like."
          />
          <HowCard
            icon={<Zap className="h-6 w-6" />}
            iconBg="#8DAA7B"
            title="From hours to seconds"
            description="What used to take a designer 30 minutes now happens in 30 seconds. Your team focuses on strategy, the AI handles execution."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primo-surfaceAlt rounded-3xl mx-6 my-20 py-20 px-6 text-center">
        <h2 className="font-sans font-extrabold text-4xl text-primo-navy">
          Ready to scale your creative output?
        </h2>
        <p className="text-primo-muted text-lg mt-4">
          Set up your first workspace in 5 minutes.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-primo-accent text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity mt-8"
        >
          Get started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-primo-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-primo-muted">
          © 2026 Primo AI Studio · Made in El Paso, TX
        </div>
      </footer>
    </main>
  );
}

function HowCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-primo-surface border border-primo-border rounded-2xl p-8">
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <h3 className="font-sans font-bold text-xl text-primo-navy mt-6">
        {title}
      </h3>
      <p className="text-primo-muted mt-3 leading-relaxed">{description}</p>
    </div>
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
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PRIMO_LOGO_URL}
              alt="Primo AI Studio"
              className="h-8 w-auto rounded-md"
            />
            <span className="font-sans font-bold tracking-tight text-lg text-primo-navy">
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
