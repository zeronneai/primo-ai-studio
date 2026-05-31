import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

// Header del admin panel. Paleta Primo SIEMPRE (nunca se tinta por workspace).
export function AdminHeader() {
  return (
    <header className="border-b border-primo-border bg-primo-surface sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Izquierda: logo + PRIMO ADMIN */}
        <Link href="/admin" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PRIMO_LOGO_URL}
            alt="Primo"
            className="h-9 w-auto rounded-md group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-lg tracking-wider leading-none">
            PRIMO ADMIN
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primo-accent/15 text-primo-accent">
            <ShieldCheck className="h-3 w-3" />
            Super Admin
          </span>
        </Link>

        {/* Derecha: volver al sitio + user */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-primo-muted hover:text-primo-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al sitio</span>
          </Link>
          <div className="h-6 w-px bg-primo-border" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
