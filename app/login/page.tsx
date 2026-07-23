import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-neutral-900">Entrar</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Introduz o teu email para receberes um link de acesso. O acesso é
          só por convite — se ainda não tens conta, contacta a tua
          treinadora.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
