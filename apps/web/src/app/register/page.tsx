import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterAgencyForm } from "@/components/auth/RegisterAgencyForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Registra tu agencia"
      subtitle="Crea tu cuenta de administrador y empieza a usar TravelOS AI."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-secondary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <RegisterAgencyForm />
    </AuthCard>
  );
}
