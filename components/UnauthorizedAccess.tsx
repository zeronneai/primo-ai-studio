"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

// Pantalla mostrada cuando un usuario autenticado no tiene acceso al
// workspace y tampoco tiene otro al que redirigirlo. Usa paleta Primo
// (no estamos "dentro" de un workspace válido para esta persona).
export function UnauthorizedAccess() {
  return (
    <div className="min-h-screen bg-primo-bg text-primo-text flex flex-col items-center justify-center p-8 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-primo-surface border border-primo-border flex items-center justify-center mb-6">
          <ShieldX className="h-8 w-8 text-primo-muted" />
        </div>
        <h1 className="font-bold text-2xl md:text-3xl text-primo-navy tracking-tight mb-3">
          No tienes acceso a este workspace
        </h1>
        <p className="text-primo-muted max-w-md mb-8 leading-relaxed">
          Si crees que esto es un error, contacta a tu administrador. Si eres
          administrador, agrega tu email al workspace desde{" "}
          <span className="font-mono text-primo-navy">/admin</span>.
        </p>
        <Link
          href="/"
          className="bg-primo-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-primo-muted hover:text-primo-text transition-colors py-6"
      >
        <span className="text-xs">Powered by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRIMO_LOGO_URL}
          alt="Primo AI Studio"
          className="h-5 w-auto rounded opacity-70"
        />
        <span className="text-xs font-display tracking-wide">
          PRIMO AI STUDIO
        </span>
      </Link>
    </div>
  );
}
