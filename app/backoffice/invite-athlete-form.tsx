"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { inviteAthlete, type InviteAthleteResult } from "./actions";

const initialState: InviteAthleteResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A adicionar..." : "Adicionar atleta"}
    </button>
  );
}

export function InviteAthleteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(async (
    prevState: InviteAthleteResult | null,
    formData: FormData
  ) => {
    const result = await inviteAthlete(prevState, formData);
    if ("success" in result) {
      formRef.current?.reset();
    }
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <Field label="Nome completo" name="full_name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Telefone" name="phone" />
      <Field label="Data de nascimento" name="birth_date" type="date" />
      <Field label="Clube" name="club" />
      <Field label="Número de federado" name="federation_number" />
      <Field label="Notas" name="notes" className="sm:col-span-2" />

      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton />
        {state && "error" in state && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-green-700">
            Atleta adicionada. Foi enviado um email com o link de acesso.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
    </div>
  );
}
