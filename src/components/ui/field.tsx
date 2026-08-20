import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Champs Prisme — verre creusé, focus spectral.
 * `nv-field` (dashboard-skin.css, chargée par le shell produit et
 * le layout admin) pose la matière Givre noir : fond blanc 3 %,
 * bordure blanc 10 %, focus en outline aurore 2 px offset 2.
 */

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--text-2)]",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("pv-field nv-field", className)} {...props} />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("pv-field nv-field resize-none", className)} {...props} />
));
Textarea.displayName = "Textarea";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("pv-field nv-field cursor-pointer appearance-none bg-no-repeat pr-9", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239A9A9A' stroke-width='1.2'/%3E%3C/svg%3E\")",
      backgroundPosition: "right 14px center",
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

/* Message d'état sous un champ ou un formulaire */
function FormMessage({
  tone = "error",
  className,
  children,
}: {
  tone?: "error" | "success" | "warning" | "info";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        {
          "border-[rgba(224,138,132,0.40)] bg-[rgba(224,138,132,0.10)] text-[#E08A84]": tone === "error",
          /* le fond et le liseré sauge portent le sens de la
             validation ; le texte reste clair (AA) */
          "border-[rgba(111,191,159,0.40)] bg-[rgba(111,191,159,0.10)] text-[color:var(--color-slate)]": tone === "success",
          "border-[rgba(217,178,74,0.40)] bg-[rgba(217,178,74,0.10)] text-[#D9B24A]": tone === "warning",
          "border-[rgba(127,170,208,0.40)] bg-[rgba(127,170,208,0.10)] text-[#7FAAD0]": tone === "info",
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export { Label, Input, Textarea, Select, FormMessage };
