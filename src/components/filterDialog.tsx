import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@ui/button";
import { AiOutlineClose } from "react-icons/ai";
import { z } from "zod";
import { agentList as agents, mapList as maps } from "../../utils/enums";
import ScuffedSelect from "./scuffedSelect";

const zodProps = z.object({
  currentAgent: z.string().nullish(),
  agentChangeFX: z.function().args(z.enum(agents)),
  agentClearFx: z.function(),
  currentMap: z.string().nullish(),
  mapChangeFX: z.function().args(z.enum(maps)),
  mapClearFx: z.function(),
  clearAllFilters: z.function(),
});

type Props = z.infer<typeof zodProps>;

const FilterDialog = (props: Props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex items-center justify-center rounded bg-gray-300 px-4 py-2 font-medium text-slate-800 hover:bg-gray-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-black disabled:pointer-events-none disabled:opacity-60">
        Filter
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col rounded-xl bg-gray-800 p-4 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 md:w-full">
          <Dialog.Title className="text-center text-lg font-semibold">
            Filters
          </Dialog.Title>
          <section className="mx-1 flex w-fit flex-col space-y-4 px-2 py-1">
            <div className="inline-flex items-center space-x-4">
              <ScuffedSelect
                buttonIntent="secondary"
                defaultValue={
                  props.currentAgent == null ? agents[0] : props.currentAgent
                }
                values={agents.map((e) => e)}
                onValueChangeFx={props.agentChangeFX}
                ariaLabel="Agent select input"
              />
              <AiOutlineClose
                aria-label="clear the agent select"
                onClick={props.agentClearFx}
                className="hover:cursor-pointer hover:fill-red-400"
              />
            </div>
            <div className="inline-flex items-center space-x-4">
              <ScuffedSelect
                buttonIntent="secondary"
                defaultValue={
                  props.currentMap == null ? maps[0] : props.currentMap
                }
                values={maps.map((e) => e)}
                onValueChangeFx={props.mapChangeFX}
                ariaLabel="Map select input"
              />
              <AiOutlineClose
                aria-label="clear the map select"
                onClick={props.mapClearFx}
                className="hover:cursor-pointer hover:fill-red-400"
              />
            </div>
          </section>
          <div className="mt-4 flex justify-between">
            <Button intent={"secondary"} onClick={props.clearAllFilters}>
              Clear all filters
            </Button>
            <Dialog.Close className="bottom-2 right-2 inline-flex items-center justify-center rounded bg-gray-300 py-2 px-4 font-medium text-slate-800 hover:bg-gray-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 focus:ring-offset-black disabled:pointer-events-none disabled:opacity-60">
              Cancel
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FilterDialog;
