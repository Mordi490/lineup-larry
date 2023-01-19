import { cva, VariantProps } from "class-variance-authority";
import { ButtonOrLink, Props as ButtonOrLinkProps } from "./buttonOrLink";

//based on https://github.com/tnarla/nextjs-conf
const buttonStyles = cva(
  "flex items-center justify-center px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-black focus:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none hover:bg-opacity-80",
  {
    variants: {
      intent: {
        primary: "bg-sky-400 text-gray-700  hover:bg-sky-300",
        secondary:
          "bg-neutral-600 hover:bg-neutral-500 text-gray-100 focus:ring-gray-500",
        danger: "bg-red-500 text-gray-700 focus:ring-red-500",
      },
      size: {
        large: "py-1 px-2",
        normal: "py-2 px-4",
        small: "py-3 px-6",
      },
      textSize: {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
      },
      rounded: {
        full: "rounded",
        left: "rounded-l",
        right: "rounded-r",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        none: "rounded-none",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      intent: "primary",
      textSize: "medium",
      rounded: "none",
      size: "normal",
    },
  }
);

export interface Props
  extends ButtonOrLinkProps,
    VariantProps<typeof buttonStyles> {}

export function Button({ intent, size, fullWidth, rounded, ...props }: Props) {
  return (
    <ButtonOrLink
      className={buttonStyles({ intent, size, fullWidth, rounded })}
      {...props}
    />
  );
}
