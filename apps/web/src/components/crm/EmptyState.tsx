import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant">
        {icon}
      </span>
      <p className="font-body-custom text-label-md text-primary">{title}</p>
      <p className="font-body-custom text-body-sm text-on-surface-variant max-w-sm">
        {description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
