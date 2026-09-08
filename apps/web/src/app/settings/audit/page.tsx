"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useSession } from "@/components/auth/SessionProvider";
import { listAuditLogs, type AuditLog } from "@/lib/audit";
import { ApiError } from "@/lib/api-client";

function AuditContent() {
  const { user } = useSession();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      setLoading(false);
      setError("Solo ADMIN puede consultar auditoría.");
      return;
    }

    let cancelled = false;
    listAuditLogs({ take: 50 })
      .then((result) => {
        if (!cancelled) setItems(result.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el log de auditoría.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  return (
    <>
      <div>
        <h2 className="font-headline text-headline-xl text-primary mb-1">
          Auditoría
        </h2>
        <p className="font-body-custom text-body-md text-on-surface-variant">
          Acciones sensibles del tenant (login, roles, asignación, branding).
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-body-sm text-on-surface-variant">Cargando…</p>
        ) : error ? (
          <p role="alert" className="p-6 text-body-sm text-alert-coral">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="p-6 text-body-sm text-on-surface-variant">
            Sin eventos registrados todavía.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-data-table-header/30">
                <th className="px-4 py-3 text-label-sm uppercase">Fecha</th>
                <th className="px-4 py-3 text-label-sm uppercase">Acción</th>
                <th className="px-4 py-3 text-label-sm uppercase">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-body-sm">
                    {new Date(item.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-body-sm font-medium">
                    {item.action}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                    {item.userId ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default function AuditSettingsPage() {
  return (
    <AppShell searchPlaceholder="Buscar en auditoría...">
      <AuditContent />
    </AppShell>
  );
}
