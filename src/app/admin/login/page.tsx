import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
  }

  if (user) {
    redirect("/admin");
  }

  return <LoginForm />;
}
