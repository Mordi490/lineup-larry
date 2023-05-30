import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "@ui/button";
import { FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { z } from "zod";

const PropsZod = z.object({
  defaultValue: z.string(),
  ariaLabel: z.string().optional(),
  values: z.array(z.string()),
  buttonIntent: z.enum(["primary", "secondary", "danger"]),
  onValueChangeFx: z.function().args(z.any()),
  onItemClickFx: z.function().args(z.any()).optional(),
});

type Props = z.infer<typeof PropsZod>;

const ScuffedSelect = (props: Props) => {
  return (
    <SelectPrimitive.Root
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChangeFx}
    >
      <SelectPrimitive.Trigger
        asChild
        className="ml-2 flex items-center justify-center rounded bg-gray-300 py-2 px-4 font-medium text-slate-800 hover:bg-gray-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-black disabled:pointer-events-none  disabled:opacity-60"
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
        <SelectPrimitive.Viewport className=" rounded-lg bg-gray-700 p-2 shadow-lg">
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
                  <FaCheck className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Group>
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center text-gray-700">
          <FaChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
};

export default ScuffedSelect;
