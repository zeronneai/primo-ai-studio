import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AdminLinkButton } from "@/components/admin/AdminLinkButton";
import type { Workspace } from "@/types";

const PRIMO_LOGO_URL =
  "https://res.cloudinary.com/dsprn0ew4/image/upload/v1778810517/replicame_ese_logo_sin_a%C3%B1adir_202605142001_xo3xpe.jpg";

export function CoBrandedHeader({ workspace }: { workspace: Workspace }) {
  return (
    <header className="border-b border-primo-border bg-primo-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Izquierda: PRIMO AI STUDIO */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PRIMO_LOGO_URL}
            alt="Primo AI Studio"
            className="h-10 w-auto rounded-md group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-base tracking-wider leading-none">
            PRIMO AI STUDIO
          </span>
        </Link>

        {/* Centro: divider visual */}
        <div className="hidden md:flex items-center gap-3 text-primo-muted text-sm">
          <div className="h-px w-12 bg-primo-border" />
          <span>FOR</span>
          <div className="h-px w-12 bg-primo-border" />
        </div>

        {/* Derecha: Workspace + User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center font-display tracking-wider text-sm"
              style={{
                backgroundColor: workspace.brand_colors.accent + "20",
                color: workspace.brand_colors.accent,
              }}
            >
              {workspace.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span
                className="font-semibold text-sm leading-tight"
                style={{ color: workspace.brand_colors.accent }}
              >
                {workspace.name}
              </span>
              <span className="text-[10px] text-primo-muted leading-tight">
                {workspace.industry}
              </span>
            </div>
          </div>

          <AdminLinkButton />

          <div className="h-6 w-px bg-primo-border" />

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
