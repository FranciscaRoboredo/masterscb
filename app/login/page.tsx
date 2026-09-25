import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-10">
      <div className="w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_-20px_rgba(16,48,74,0.35),0_0_0_1px_rgba(16,48,74,0.06)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark to-brand-dark2 px-6 pb-7 pt-6 text-center text-white">
          <div
            aria-hidden
            className="brand-watermark pointer-events-none absolute -right-12 -top-14 h-[230px] w-[230px] rotate-[8deg] opacity-40 [filter:brightness(0)_invert(1)]"
          />
          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white p-2">
              <Image src="/brand/crest.png" alt="SC Braga" width={48} height={48} className="h-full w-full object-contain" />
            </div>
            <p className="mt-3 font-display text-lg font-bold">SC Braga Masters</p>
            <p className="font-condensed text-xs uppercase tracking-wider text-white/70">
              Equipa de Natação Masters
            </p>
          </div>
        </div>

        <div className="px-6 py-7">
          <h1 className="font-display text-2xl font-bold text-brand-charcoal">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Entra com os teus dados para aceder à app. O acesso é só por convite — se ainda não
            tens conta, contacta a tua treinadora.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
