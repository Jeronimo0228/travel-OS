import { documentIcon } from "@/lib/portal";
import type { TripDocument } from "@/lib/reservations";

export function DocumentList({
  documents,
  emptyText,
}: {
  documents: TripDocument[];
  emptyText: string;
}) {
  if (documents.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant py-6 text-center">
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="grid gap-3">
      {documents.map((document) => (
        <li key={document.id}>
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-secondary hover:shadow-md transition"
          >
            <span className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">
                {documentIcon(document.contentType, document.name)}
              </span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-label-md truncate">
                {document.name}
              </span>
              <span className="block text-body-sm text-on-surface-variant">
                {document.contentType ?? "Documento"} · abrir
              </span>
            </span>
            <span className="material-symbols-outlined text-on-surface-variant">
              open_in_new
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
