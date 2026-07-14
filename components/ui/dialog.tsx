"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  title: string;
  description?: string;
};

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/35 dark:bg-slate-950/70" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl",
          className
        )}
        {...props}
      >
        <div className="mb-5 grid gap-1 pr-8">
          <DialogPrimitive.Title className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="text-sm text-[var(--muted)]">
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <X aria-hidden="true" size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
