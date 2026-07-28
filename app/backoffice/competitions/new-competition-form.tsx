"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCompetition, type ActionResult } from "./actions";

const initialState: ActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A criar..." : "Criar competição"}
    </button>
  );
}

export function NewCompetitionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await createCompetition(prevState, formData);
    if ("success" in result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-neutral-700">
          Local
        </label>
        <input
          id="location"
          name="location"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-neutral-700">
          Data de início da competição
        </label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-neutral-700">
          Data de fim da competição
        </label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        <p className="mt-1 text-xs text-neutral-400">Deixa em branco se for só um dia.</p>
      </div>
      <div>
        <label htmlFor="registration_start" className="block text-sm font-medium text-neutral-700">
          Início das inscrições
        </label>
        <input
          id="registration_start"
          name="registration_start"
          type="date"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label htmlFor="registration_end" className="block text-sm font-medium text-neutral-700">
          Fim das inscrições
        </label>
        <input
          id="registration_end"
          name="registration_end"
          type="date"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Notas
        </label>
        <input
          id="notes"
          name="notes"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton />
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        {state && "success" in state && (
          <p className="text-sm text-green-700">
            Competição criada como rascunho. Adiciona as provas e depois publica-a.
          </p>
        )}
      </div>
    </form>
  );
}
