import { cva, VariantProps } from "class-variance-authority";
import { ButtonOrLink, Props as ButtonOrLinkProps } from "./buttonOrLink";

//based on https://github.com/tnarla/nextjs-conf
const buttonStyles = cva(
  "flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-black focus:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none hover:bg-opacity-80 text-slate-800 rounded",
  {
    variants: {
      intent: {
        primary: "bg-sky-400  hover:bg-sky-300",
        secondary: "bg-gray-300 hover:bg-gray-200 focus:ring-gray-500",
        danger: "bg-red-500  focus:ring-red-500 text-lg",
      },
      size: {
        small: "py-1 px-2",
        normal: "py-2 px-4",
        large: "py-3 px-6",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "normal",
    },
  }
);

export interface Props
  extends ButtonOrLinkProps,
    VariantProps<typeof buttonStyles> {}

export function Button({ intent, fullWidth, size, ...props }: Props) {
  return (
    <ButtonOrLink
      className={buttonStyles({ intent, fullWidth, size })}
      {...props}
    />
  );
}
