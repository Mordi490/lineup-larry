import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { trpc } from "../src/utils/trpc";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

type props = {
  title: string;
  id: string;
};

const DelLineupModal = (data: props) => {
  const router = useRouter();

  const { mutate: delLineup } = trpc.useMutation(["privateLineup.delete"], {
    onSuccess: () => {
      toast.remove();
      toast.success("lineup deleted");
      router.replace(`/lineup/${data.id}`, `/lineups`);
    },
    onError: (err) => {
      toast.remove();
      toast.error("Something went wrong");
      console.log(err);
    },
  });

  const { mutate: delS3Data } = trpc.useMutation(
    ["privateLineup.delete-s3-object"],
    {
      onError: (err) => {
        toast.error("Something went wrong uploading images/videos");
        console.log(err);
      },
    }
  );

  const delProcess = (id: string) => {
    toast.loading("Deleting lineup");
    // deleting S3-data
    try {
      delS3Data({ id });
    } catch (err) {
      console.log(err);
    }

    // deleting non-S3data
    try {
      delLineup({ id });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <a className="rounded-md bg-red-500 py-1 px-2 text-xl font-medium capitalize text-gray-700 hover:bg-red-400">
          Delete
        </a>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-20 bg-black/50" />
        <AlertDialog.Content
          className="fixed top-[50%]
                      left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%]
              rounded-lg bg-gray-700 p-4 focus:outline-none 
              focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 md:w-full"
        >
          <AlertDialog.Title className="text-center text-2xl font-medium">
            AlertDialog Delete {data.title}?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-4 font-normal">
            Are you sure you want to delete: {data.title}? This will permanently
            delete the lineup
          </AlertDialog.Description>
          <div className="mt-4 flex justify-end space-x-2">
            <AlertDialog.Cancel className="inline-flex select-none justify-center rounded-md border border-gray-500 bg-slate-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-400 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className="inline-flex select-none justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
              onClick={() => delProcess(data.id)}
            >
              Confirm
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DelLineupModal;
