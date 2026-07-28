import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">O meu perfil</h1>
      <p className="mt-1 text-sm text-neutral-500">{profile.email}</p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
