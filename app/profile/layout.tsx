import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { AppHeader } from "@/components/app-header";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader fullName={profile.full_name || profile.email} role={profile.role} />
      {children}
    </>
  );
}
