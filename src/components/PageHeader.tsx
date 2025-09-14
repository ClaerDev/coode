import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function PageHeader({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mb-10 flex gap-4 items-center justify-between", className)}
    >
      
        <h1 className="text-2xl font-semibold mt-1.5">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
}
