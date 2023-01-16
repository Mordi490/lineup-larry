import * as SelectPrimitive from "@radix-ui/react-select";
import { FaChevronUp, FaChevronDown, FaCheck } from "react-icons/fa";
import { z } from "zod";

const PropsZod = z.object({
  defaultValue: z.string(),
  ariaLabel: z.string().optional(),
  values: z.array(z.string()),
  onValueChangeFx: z.function().args(z.any()),
  onItemClickFx: z.function().args(z.any()),
});

type Props = z.infer<typeof PropsZod>;

const Select = (props: Props) => {
  return (
    <SelectPrimitive.Root
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChangeFx}
    >
      <SelectPrimitive.Trigger asChild>
        <button aria-label={props.ariaLabel} className="mx-2 inline-flex items-center rounded-md bg-gray-800 px-2 py-2">
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="ml-2">
            <FaChevronUp size={14} />
          </SelectPrimitive.Icon>
        </button>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content className="z-20">
        <SelectPrimitive.ScrollUpButton className="inline-flex items-center justify-center bg-slate-900 text-gray-700 ">
          <FaChevronUp />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="rounded-lg bg-gray-700 p-2 shadow-lg">
          <SelectPrimitive.Group>
            {props.values.map((string, idx) => (
              <SelectPrimitive.Item
                key={`${string}-${idx}`}
                value={string}
                className="relative flex select-none items-center rounded-md px-8 py-2 text-sm font-semibold text-white"
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
