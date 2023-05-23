import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@ui/button";
import { AiOutlineClose } from "react-icons/ai";
import { z } from "zod";
import { agentList, mapList } from "../../utils/enums";
import Select from "./select";

const zodProps = z.object({
  currentAgent: z.string().nullish(),
  agentChangeFX: z.function().args(z.enum(agentList)),
  agentClearFx: z.function(),
  currentMap: z.string().nullish(),
  mapChangeFX: z.function().args(z.enum(mapList)),
  mapClearFx: z.function(),
  clearAllFilters: z.function(),
});

type Props = z.infer<typeof zodProps>;

// TODO: make it not as wacky css-wise
const FilterDialog = (props: Props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button intent={"secondary"}>Filter</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col rounded-lg bg-gray-800 p-4 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 md:w-full">
          <Dialog.Title className="text-center text-lg font-semibold">
            Filters
          </Dialog.Title>
          <Dialog.Description className="mx-1 flex w-fit flex-col space-y-4 px-2 py-1">
            <div className="inline-flex items-center space-x-4">
              <Select
                buttonIntent="secondary"
                defaultValue={
                  props.currentAgent == null ? agentList[0] : props.currentAgent
                }
                values={agentList.map((e) => e)}
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
              <Select
                buttonIntent="secondary"
                defaultValue={
                  props.currentMap == null ? mapList[0] : props.currentMap
                }
                values={mapList.map((e) => e)}
                onValueChangeFx={props.mapChangeFX}
                ariaLabel="Map select input"
              />
              <AiOutlineClose
                aria-label="clear the map select"
                onClick={props.mapClearFx}
                className="hover:cursor-pointer hover:fill-red-400"
              />
            </div>
            <Button intent={"secondary"} onClick={props.clearAllFilters}>
              Clear all filters
            </Button>
          </Dialog.Description>
          <Dialog.Close className="absolute bottom-2 right-2 inline-flex">
            <Button intent={"secondary"}>Cancel</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FilterDialog;
