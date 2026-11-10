import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar contraseña", referrer: "no-referrer" };

export default function Page() {
  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace a tu correo para crear una nueva."
      footer={
        <Link href="/login" className="inline-block py-2 text-secondary hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
