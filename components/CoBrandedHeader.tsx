import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AdminLinkButton } from "@/components/admin/AdminLinkButton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import type { Workspace } from "@/types";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

export function CoBrandedHeader({ workspace }: { workspace: Workspace }) {
  return (
    <header className="bg-ws-surface border-b border-ws-border backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Izquierda: PRIMO (sutil, secundario) */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PRIMO_LOGO_URL}
            alt="Primo AI Studio"
            className="h-6 w-auto rounded group-hover:scale-105 transition-transform opacity-70 group-hover:opacity-100"
          />
          <span className="hidden md:inline text-xs uppercase tracking-wider text-ws-text-muted opacity-70">
            PRIMO AI STUDIO
          </span>
        </Link>

        {/* Centro: divider visual */}
        <div className="hidden lg:flex items-center gap-3 text-ws-text-muted text-xs">
          <div className="h-px w-10 bg-ws-border" />
          <span>FOR</span>
          <div className="h-px w-10 bg-ws-border" />
        </div>

        {/* Derecha: Workspace (prominente) + acciones */}
        <div className="flex items-center gap-4">
          <WorkspaceSwitcher workspace={workspace} />

          <AdminLinkButton />

          <div className="h-6 w-px bg-ws-border" />

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
