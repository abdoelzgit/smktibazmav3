import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/app/actions/auth";

export default async function SpmbRegistrationEntryPage() {
  const token = (await cookies()).get("auth_session")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login?mode=register&callbackUrl=/spmb/form");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/spmb/form");
}
