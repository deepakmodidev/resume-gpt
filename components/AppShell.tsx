import { Header } from "@/components/home/Header";
import { cn } from "@/lib/utils";

/**
 * Standard page shell: a fixed header with the page content scrolling in an
 * internal container below it. Locking the viewport (h-screen + overflow-hidden)
 * keeps the scrollbar inside the content area instead of running up alongside
 * the header.
 *
 * Pass `scroll={false}` for self-contained app screens that manage their own
 * internal scrolling (e.g. the two-pane cover-letter generator).
 */
export function AppShell({
  children,
  scroll = true,
  className,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Header />
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          scroll ? "overflow-y-auto overflow-x-clip" : "overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
