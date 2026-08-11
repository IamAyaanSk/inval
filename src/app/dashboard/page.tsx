import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <h1 className="text-2xl font-medium">
        Welcome, {session.user.name}
      </h1>
    </main>
  );
}
