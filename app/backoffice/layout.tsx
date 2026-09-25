import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { Sidebar } from "@/components/sidebar";

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
    <div className="flex min-h-screen">
      <Sidebar fullName={profile.full_name || profile.email} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
