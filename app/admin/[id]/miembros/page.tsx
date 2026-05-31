"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Trash2, UserPlus, Info } from "lucide-react";
import { getWorkspaceById } from "@/lib/data/workspaces-store";
import {
  getMembers,
  addMember,
  removeMember,
  isMemberOf,
} from "@/lib/data/members-store";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";
import type { Workspace, WorkspaceMember, MemberRole } from "@/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "ok"; workspace: Workspace };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MiembrosPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { showToast } = useToast();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");

  useEffect(() => {
    const workspace = getWorkspaceById(id);
    if (!workspace) {
      setState({ kind: "not_found" });
      return;
    }
    setState({ kind: "ok", workspace });
    setMembers(getMembers(workspace.id));
  }, [id]);

  function refresh() {
    setMembers(getMembers(id));
  }

  function handleAdd() {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      showToast("Email inválido", "error");
      return;
    }
    if (isMemberOf(id, clean)) {
      showToast("Ese email ya es miembro de este workspace", "error");
      return;
    }
    addMember(id, clean, role);
    setEmail("");
    setRole("member");
    refresh();
    showToast("Miembro agregado ✓");
  }

  function handleRemove(memberEmail: string) {
    if (!confirm(`¿Quitar a ${memberEmail} del workspace?`)) return;
    removeMember(id, memberEmail);
    refresh();
    showToast("Miembro eliminado");
  }

  if (state.kind === "loading") {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primo-muted" />
      </div>
    );
  }

  if (state.kind === "not_found") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-primo-surface border border-primo-border rounded-xl p-12 text-center">
          <h1 className="font-display text-3xl tracking-tight mb-3">
            WORKSPACE NO ENCONTRADO
          </h1>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-primo-border hover:border-primo-muted text-primo-text px-5 py-2.5 rounded-md font-medium transition-colors mt-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Workspaces
          </Link>
        </div>
      </div>
    );
  }

  const { workspace } = state;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb + título */}
      <div className="mb-6">
        <div className="text-sm text-primo-muted mb-2">
          <Link href="/admin" className="hover:text-primo-navy transition-colors">
            Workspaces
          </Link>{" "}
          / {workspace.name} / Miembros
        </div>
        <h1 className="font-bold text-3xl text-primo-navy tracking-tight">
          Miembros de {workspace.name}
        </h1>
      </div>

      {/* Banner info */}
      <div className="flex items-start gap-3 bg-primo-accentYellow/15 border border-primo-accentYellow/40 rounded-lg p-4 mb-8">
        <Info className="h-5 w-5 text-primo-navy shrink-0 mt-0.5" />
        <p className="text-sm text-primo-text">
          Los miembros agregados podrán acceder a{" "}
          <span className="font-mono">/{workspace.slug}</span> cuando se
          registren en Primo con su email. Solo super admins pueden modificar
          esta lista.
        </p>
      </div>

      {/* Agregar miembro */}
      <section className="bg-primo-surface border border-primo-border rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Agregar miembro</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="email@cliente.com"
            className="flex-1 bg-primo-surface border border-primo-border rounded-md px-4 py-2.5 text-sm text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as MemberRole)}
            className="bg-primo-surface border border-primo-border rounded-md px-4 py-2.5 text-sm text-primo-text focus:outline-none focus:border-primo-accent transition-colors"
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 bg-primo-accent text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Agregar miembro
          </button>
        </div>
      </section>

      {/* Miembros actuales */}
      <section>
        <h2 className="font-semibold mb-4">
          Miembros actuales
          <span className="text-primo-muted font-normal ml-2 text-sm">
            ({members.length})
          </span>
        </h2>

        {members.length === 0 ? (
          <div className="bg-primo-surface border border-primo-border rounded-lg p-12 text-center">
            <p className="text-primo-muted">
              No hay miembros aún. Agrega el primero arriba.
            </p>
          </div>
        ) : (
          <div className="bg-primo-surface border border-primo-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primo-border text-left text-xs uppercase tracking-wider text-primo-muted">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Agregado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.email}
                    className="border-b border-primo-border last:border-0 hover:bg-primo-surfaceAlt/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-primo-text">{m.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                          m.role === "owner"
                            ? "bg-primo-accent/15 text-primo-accent"
                            : "bg-primo-border text-primo-muted"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primo-muted">
                      {m.added_at ? formatDate(m.added_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRemove(m.email)}
                          className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-primo-surfaceAlt transition-colors"
                          title="Quitar miembro"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
