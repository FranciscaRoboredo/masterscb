import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(profile.role === "coach" ? "/backoffice" : "/dashboard");
}
