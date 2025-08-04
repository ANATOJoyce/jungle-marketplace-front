import { Link, LinkProps } from "@remix-run/react";
import React from "react";
import { cn } from "~/lib/utils";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

interface ButtonAsButtonProps
  extends BaseButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  as?: "button";
  children: React.ReactNode;
}

interface ButtonAsLinkProps
  extends BaseButtonProps,
    Omit<LinkProps, keyof BaseButtonProps | "className"> {
  as: "link";
  children: React.ReactNode;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    isLoading = false,
    children,
    icon,
    iconPosition = "left",
    ...rest
  } = props;

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    className
  );

  const variantClasses = cn({
    "bg-orange-500 text-white hover:bg-orange-600": variant === "primary",
    "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500": variant === "destructive",
    "border border-gray-300 bg-transparent hover:bg-gray-50": variant === "outline",
    "bg-transparent hover:bg-gray-100": variant === "ghost",
  });

  const sizeClasses = cn({
    "px-3 py-1.5 text-sm": size === "sm",
    "px-4 py-2 text-base": size === "md",
    "px-6 py-3 text-lg": size === "lg",
  });

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className={cn("inline-flex", children ? "mr-2" : "")}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span className={cn("inline-flex", children ? "ml-2" : "")}>
          {icon}
        </span>
      )}
      {isLoading && <span className="ml-2 animate-spin">⟳</span>}
    </>
  );

  if ("as" in rest && rest.as === "link") {
    const { as, ...linkProps } = rest;
    return (
      <Link
        className={cn(baseClasses, variantClasses, sizeClasses)}
        aria-disabled={disabled || isLoading}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest;
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses, sizeClasses)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...buttonProps}
    >
      {content}
    </button>
  );
}