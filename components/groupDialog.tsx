import * as Dialog from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { trpc } from "../src/utils/trpc";

// new component for the create group input
export type FormValues = {
  newGroupName: string;
};

export const GroupDialog = () => {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const { mutate } = trpc.useMutation(["protectedGroupRouter.create-group"], {
    onSuccess: (res) => {
      toast.remove();
      toast.success(`${res.name} has been created`);
      // and redirect/revert back to normal state, AKA just the specificLineup page
      setOpen(false);
    },
    onError: (err) => {
      toast.remove();
      toast.error("Sorry! Something went wrong ☹");
      console.log(err);
    },
  });
  const {
    register,
    handleSubmit,
    control,
    // remember to add err msgs
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit = handleSubmit((data) => {
    try {
      mutate({
        lineupId: router.query.id as string,
        name: data.newGroupName,
        userId: session?.user?.id as string,
        isPublic: false,
      });
    } catch (err) {
      console.log(err);
    }
  });

  const {
    data: allGrps,
    refetch: fetchGroups,
    isFetching,
  } = trpc.useQuery(["protectedGroupRouter.get-all-groups"], {
    // use this flag to NOT run query on page load, instead run when user clicks "add to group btn"
    enabled: false,
  });

  const { mutate: addToGrp } = trpc.useMutation(
    ["protectedGroupRouter.add-to-group"],
    {
      onSuccess: (res) => {
        toast.success(`Lineup added to ${res.name}`);
      },
      onError: (err) => {
        console.log(err);
        toast.error("Something went wrong");
      },
    }
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          id="tailwind_fail_2"
          className="h-fit w-fit rounded-lg bg-neutral-600 px-2 py-2 font-semibold uppercase text-white hover:bg-neutral-500"
          onClick={() => fetchGroups()}
        >
          Add to group
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-black/50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col rounded-lg bg-gray-800 p-4 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 md:w-full">
          <Dialog.Title className="text-center text-lg font-semibold">
            Select which group to add
          </Dialog.Title>
          {/* Future QoL: show if the lineup already is in a groups, clicking on one of them removes it etc.  */}
          <form
            onSubmit={onSubmit}
            className="mx-1 grid grid-cols-3 gap-2 px-2 py-1 shadow-lg"
          >
            <input
              {...register("newGroupName")}
              placeholder="Create a new group?"
              className="col-span-2"
            />
            <input
              type="submit"
              className="rounded bg-blue-600 py-1 font-medium uppercase text-white hover:cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
            />
          </form>
          {allGrps?.length ? (
            <div>
              {allGrps.map((grp) => (
                <Fragment key={grp.id}>
                  <Dialog.Description
                    className="mx-1 w-fit px-2 py-1 shadow-lg hover:cursor-pointer hover:bg-gray-600"
                    onClick={() =>
                      addToGrp({
                        groupId: grp.id,
                        lineupId: router.query.id as string,
                      })
                    }
                  >
                    {grp.name}
                  </Dialog.Description>
                </Fragment>
              ))}
            </div>
          ) : { isFetching } ? (
            <p>...loading</p>
          ) : (
            <p>You do not have any groups</p>
          )}
          <Dialog.Close className="absolute bottom-0 right-0 mb-1 mr-1 inline-flex select-none justify-center rounded-md border border-gray-500 bg-slate-300 px-4 py-2 text-sm font-medium uppercase text-gray-900 hover:bg-slate-400 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            Cancel
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
