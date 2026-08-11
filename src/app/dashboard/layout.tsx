import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 border-b mx-4 md:mx-0 md:ml-8 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] text-primary font-medium tracking-wide">
              Hi {session.user.name}
            </h2>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 mx-4 md:mx-0 md:ml-8 mt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
