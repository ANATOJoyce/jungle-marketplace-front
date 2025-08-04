import * as React from "react"
import { cn } from "~/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center space-x-2", className)}>
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500",
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = "Checkbox"