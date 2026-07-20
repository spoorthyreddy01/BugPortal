import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";

// Middleware already blocks unauthenticated requests at the edge; this is a
// cheap defense-in-depth check (no DB call, just reads the decoded session).
export default async function DashboardGroupLayout({ children }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <DashboardShell>{children}</DashboardShell>;
}
