import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Accede al panel de tu agencia."
      footer={
        <>
          ¿Aún no tienes una agencia?{" "}
          <Link href="/register" className="text-secondary hover:underline">
            Regístrala aquí
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
