import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

export const metadata: Metadata = { title: "Nueva contraseña", referrer: "no-referrer" };

export default function Page() {
  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Elige una contraseña nueva para tu cuenta."
      footer={
        <Link href="/login" className="inline-block py-2 text-secondary hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
