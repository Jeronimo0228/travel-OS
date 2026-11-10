import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AcceptInvitationForm } from "@/components/account/AcceptInvitationForm";

export const metadata: Metadata = { title: "Únete a tu agencia", referrer: "no-referrer" };

export default function Page() {
  return (
    <AuthCard
      title="Únete a tu agencia"
      subtitle="Crea tu cuenta de Travel OS."
      footer={
        <Link href="/login" className="inline-block py-2 text-secondary hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <AcceptInvitationForm />
    </AuthCard>
  );
}
