import { cva, VariantProps } from "class-variance-authority";
import { ButtonOrLink, Props as ButtonOrLinkProps } from "./buttonOrLink";

// based on https://github.com/tnarla/nextjs-conf

const linkStyles = cva(
  "hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500",
  {
    variants: {
      underlined: {
        yes: "underline",
        no: "no-underline",
      },
      fontBoldness: {
        bold: "font-bold",
        medium: "font-medium",
        normal: "font-normal",
        thin: "font-thin",
      },
      defaultVariants: {
        underline: "no",
        fontBoldness: "font-medium",
      },
    },
  }
);

export interface Props
  extends ButtonOrLinkProps,
    VariantProps<typeof linkStyles> {}

export function Link({ underlined, fontBoldness, ...props }: Props) {
  return (
    <ButtonOrLink
      className={linkStyles({ underlined, fontBoldness })}
      {...props}
    />
  );
}
