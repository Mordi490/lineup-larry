import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "@ui/button";
import { FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { z } from "zod";

const PropsZod = z.object({
  buttonIntent: z.enum(["primary", "secondary", "danger"]),
  defaultValue: z.string(),
  ariaLabel: z.string().optional(),
  values: z.array(z.string()),
  onValueChangeFx: z.function().args(z.any()),
  onItemClickFx: z.function().args(z.any()).optional(),
});

type Props = z.infer<typeof PropsZod>;

const Select = (props: Props) => {
  return (
    <SelectPrimitive.Root
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChangeFx}
    >
      <SelectPrimitive.Trigger
        asChild
        className="ml-2 inline-flex items-center"
      >
        <Button intent={props.buttonIntent} aria-label={props.ariaLabel}>
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="ml-2">
            <FaChevronUp size={14} />
          </SelectPrimitive.Icon>
        </Button>
      </SelectPrimitive.Trigger>
      {/** FIXME: give better view of the select options*/}
      <SelectPrimitive.Content className="fixed">
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center bg-slate-900 text-gray-700 ">
          <FaChevronUp />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="rounded-lg bg-gray-700 p-2 shadow-lg">
          <SelectPrimitive.Group>
            {props.values.map((string, idx) => (
              <SelectPrimitive.Item
                key={`${string}-${idx}`}
                value={string}
                className="relative flex select-none items-center rounded-md px-8 py-2 text-sm font-semibold text-white focus:bg-gray-800 focus:outline-none"
                onClick={props.onItemClickFx}
              >
                <SelectPrimitive.ItemText className="text-2xl font-bold">
                  {string}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <FaCheck />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Group>
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center text-gray-700">
          <FaChevronDown />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
};

export default Select;
