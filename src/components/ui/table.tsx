import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Registre Prisme — tableaux structurés aux filets de verre,
 * en-têtes mono en petites capitales.
 */

function Table({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full overflow-x-auto", className)} {...props} />;
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid items-center gap-4 border-b border-[color:var(--hairline-strong)] px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-mist",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid items-center gap-4 border-b border-[color:var(--hairline)] px-4 py-4 text-sm text-ink/80 transition-colors duration-300 last:border-b-0 hover:bg-ink/[0.02]",
        className
      )}
      {...props}
    />
  );
}

export { Table, TableHeader, TableRow };
