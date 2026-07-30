import { SESSION_LABELS } from "@/lib/event-session";
import type { EventSession } from "@/lib/supabase/database.types";

export function SessionSelect({
  defaultValue,
  id = "session",
}: {
  defaultValue?: EventSession | null;
  id?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-neutral-700">
        Sessão (opcional)
      </label>
      <select
        id={id}
        name="session"
        defaultValue={defaultValue ?? ""}
        className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      >
        <option value="">—</option>
        {(Object.keys(SESSION_LABELS) as EventSession[]).map((session) => (
          <option key={session} value={session}>
            {SESSION_LABELS[session]}
          </option>
        ))}
      </select>
    </div>
  );
}
