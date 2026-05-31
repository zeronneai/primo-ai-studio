import Link from "next/link";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

// Footer "Powered by Primo" que SOLO aparece dentro de un workspace.
// Sutil pero visible; comunica que la plataforma es de Primo aunque el
// workspace esté branded con los colores del cliente.
export function WorkspaceFooter() {
  return (
    <footer className="bg-ws-surface border-t border-ws-border py-4 mt-auto">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 text-ws-text-muted hover:opacity-100 transition-opacity group"
      >
        <span className="text-xs">Powered by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRIMO_LOGO_URL}
          alt="Primo AI Studio"
          className="h-5 w-auto rounded opacity-70 group-hover:opacity-100 transition-opacity"
        />
        <span className="text-xs font-display tracking-wide">
          PRIMO AI STUDIO
        </span>
      </Link>
    </footer>
  );
}
