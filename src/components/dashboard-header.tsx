"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import {
  Globe,
  Lightbulb,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

export function DashboardHeader({ userName }: { userName?: string | null }) {
  const router = useRouter();

  const handleDummyClick = () => {
    toast.info("This is a dummy button 😉");
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/sign-in");
          },
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-8 py-3 transition-colors">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <p className="text-primary font-medium tracking-wide">Hi {userName}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDummyClick}
            className="h-8 rounded-xl gap-1.5 text-xs text-foreground font-medium px-3 bg-background border-border/60 hover:bg-muted/40"
          >
            <Globe className="size-3.5 text-muted-foreground" />
            <span>English</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDummyClick}
            className="h-8 rounded-xl gap-1.5 text-xs font-semibold px-3 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10"
          >
            <Sparkles className="size-3.5" />
            <span>Enable Tour</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDummyClick}
            className="h-8 rounded-xl gap-1.5 text-xs text-foreground font-medium px-3 bg-background border-border/60 hover:bg-muted/40"
          >
            <Lightbulb className="size-3.5 text-muted-foreground" />
            <span>What&apos;s New?</span>
          </Button>

          <button
            type="button"
            onClick={handleDummyClick}
            className="relative flex items-center justify-center size-8 rounded-full border border-border/70 text-xs font-semibold text-foreground bg-background hover:bg-muted/40 transition-colors cursor-pointer"
          >
            0/4
            <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500 ring-2 ring-background" />
          </button>

          <button
            type="button"
            onClick={handleDummyClick}
            className="relative flex items-center justify-center size-8 rounded-full border border-border/70 bg-background text-foreground cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <MessageSquare className="size-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center size-4 rounded-full border-2 border-emerald-600 bg-background text-[9px] font-bold text-emerald-600">
              0
            </span>
          </button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDummyClick}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Settings className="size-4" />
          </Button>
        </div>

        <Button variant="destructive" size="sm" onClick={handleSignOut}>
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
