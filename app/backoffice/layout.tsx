import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { AppHeader } from "@/components/app-header";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "coach") {
    redirect("/dashboard");
  }

  return (
    <>
      <AppHeader fullName={profile.full_name || profile.email} role={profile.role} />
      {children}
    </>
  );
}
