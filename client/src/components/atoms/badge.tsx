import { cn } from "@/lib/utils";
import { badgeVariants, type BadgeProps } from "./badge-variants";

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
