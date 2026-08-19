import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
          </div>
          <span className="font-headline text-headline-md font-bold text-primary">
            TravelOS AI
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-8">
          <h1 className="font-headline text-headline-lg text-primary mb-1">
            {title}
          </h1>
          <p className="font-body-custom text-body-sm text-on-surface-variant mb-6">
            {subtitle}
          </p>
          {children}
        </div>

        {footer && (
          <p className="text-center font-body-custom text-body-sm text-on-surface-variant mt-6">
            {footer}
          </p>
        )}
      </div>
    </main>
  );
}
