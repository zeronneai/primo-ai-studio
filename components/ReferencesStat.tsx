"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { countReferences } from "@/lib/data/references-store";

// Isla cliente: lee el conteo real de referencias (seed + subidas en
// localStorage) y lo muestra con el mismo look que los StatCard del
// dashboard.
export function ReferencesStat({ workspaceId }: { workspaceId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(countReferences(workspaceId));
  }, [workspaceId]);

  return (
    <div className="bg-primo-surface border border-primo-border rounded-lg p-5">
      <div className="flex items-center gap-2 text-primo-muted text-xs mb-2">
        <Images className="h-4 w-4" />
        <span className="uppercase tracking-wider">Referencias cargadas</span>
      </div>
      <div className="font-display text-3xl tracking-tight">
        {count === null ? "—" : count}
      </div>
    </div>
  );
}
