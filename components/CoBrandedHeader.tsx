import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import type { Workspace } from "@/types";

export function CoBrandedHeader({ workspace }: { workspace: Workspace }) {
  return (
    <header className="border-b border-primo-border bg-primo-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Izquierda: PRIMO AI STUDIO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primo-accent to-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base tracking-wider leading-none">
              PRIMO AI STUDIO
            </span>
            <span className="text-[10px] text-primo-muted leading-tight mt-0.5">
              powered by Claude
            </span>
          </div>
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

          <div className="h-6 w-px bg-primo-border" />

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
