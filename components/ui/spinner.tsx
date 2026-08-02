import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

// `width`/`height`/`strokeWidth` are omitted because HugeiconsIcon types them as
// numbers, while the intrinsic svg props allow `string | number`.
function Spinner({
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "width" | "height" | "strokeWidth">) {
  return (
    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
