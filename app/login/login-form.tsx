"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "magic-link" | "forgot-password";
type Status = "idle" | "loading" | "sent" | "error";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setErrorMessage("Email ou password incorretos.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(
        error.message.toLowerCase().includes("signups not allowed")
          ? "Esta conta ainda não existe. Fala com a tua treinadora para seres convidada."
          : "Não foi possível enviar o link. Tenta novamente."
      );
      return;
    }

    setStatus("sent");
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setStatus("error");
      setErrorMessage("Não foi possível enviar o email. Tenta novamente.");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-brand-muted">
        {mode === "forgot-password"
          ? "Enviámos um email para "
          : "Enviámos um link de acesso para "}
        <strong>{email}</strong>. Abre o email e clica no link.
      </p>
    );
  }

  if (mode === "forgot-password") {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-brand-line px-3 py-2 shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="tuemail@exemplo.com"
          />
        </div>

        {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-deep disabled:opacity-50"
        >
          {status === "loading" ? "A enviar..." : "Enviar email para definir password"}
        </button>

        <button
          type="button"
          onClick={() => setMode("password")}
          className="w-full text-sm text-brand-muted hover:text-brand-red"
        >
          ← Voltar
        </button>
      </form>
    );
  }

  if (mode === "magic-link") {
    return (
      <form onSubmit={handleMagicLink} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-brand-line px-3 py-2 shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="tuemail@exemplo.com"
          />
        </div>

        {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-deep disabled:opacity-50"
        >
          {status === "loading" ? "A enviar..." : "Enviar link de acesso"}
        </button>

        <button
          type="button"
          onClick={() => setMode("password")}
          className="w-full text-sm text-brand-muted hover:text-brand-red"
        >
          ← Entrar com password
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-charcoal">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-brand-line px-3 py-2 shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          placeholder="tuemail@exemplo.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-charcoal">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-brand-line px-3 py-2 shadow-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-deep disabled:opacity-50"
      >
        {status === "loading" ? "A entrar..." : "Entrar"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setMode("forgot-password")}
          className="text-brand-muted hover:text-brand-red"
        >
          Esqueci a password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic-link")}
          className="text-brand-muted hover:text-brand-red"
        >
          Entrar por link de email
        </button>
      </div>
    </form>
  );
}
