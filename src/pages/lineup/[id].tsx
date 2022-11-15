import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa";
import CommentForm from "../../../components/commentForm";
import CommentSection from "../../../components/commentSection";
import Layout from "../../../components/layout";
import Loading from "../../../components/loading";
import { trpc } from "../../utils/trpc";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";

const SpecificLineup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSession();
  const router = useRouter();
  const id = useRouter().query.id as string;

  const { data: lineupQuery, isLoading } = trpc.useQuery([
    "lineup.by-id",
    { id },
  ]);

  const { data: userLike } = trpc.useQuery([
    "privateUserRouter.get-user-sentiment-by-id",
    { id },
  ]);

  const {
    data: allGrps,
    refetch: fetchGroups,
    isFetching,
  } = trpc.useQuery(["protectedGroupRouter.get-all-groups"], {
    // use this flag to NOT run query on page load, instead run when user clicks "add to group btn"
    enabled: false,
    onSuccess: (res) => {
      console.log(res);
    },
  });

  const { mutate: addToGrp } = trpc.useMutation(
    ["protectedGroupRouter.add-to-group"],
    {
      onSuccess: () => {
        toast.success(`Lineup: ${lineupQuery?.title} was added to group`);
      },
    }
  );

  const { mutate: delLineup } = trpc.useMutation(["privateLineup.delete"], {
    onSuccess: () => {
      toast.remove();
      toast.success("lineup deleted");
      router.replace(`/lineup/${id}`, `/lineups`);
    },
    onError: (err) => {
      toast.remove();
      toast.error("Something went wrong");
      console.log(err);
    },
  });

  const { mutate: castVote } = trpc.useMutation(["privateLineup.cast-vote"]);

  const { mutate: delS3Data } = trpc.useMutation(
    ["privateLineup.delete-s3-object"],
    {
      onError: (err) => {
        console.log(err);
      },
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!lineupQuery) {
    return (
      <Layout>
        <p className="text-center text-4xl text-red-500">
          SOMETHING WENT WRONG
        </p>
      </Layout>
    );
  }

  const delProcess = () => {
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
    <Layout title={`${lineupQuery.title}`}>
      <h1 className="pt-2 text-center text-3xl font-bold">
        {lineupQuery.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery.user.id}`}>
            <a className="ml-1 font-bold text-blue-400 underline">
              {lineupQuery?.user.name}
            </a>
          </Link>
        </div>
        <div className="mr-1 flex space-x-4">
          <div>
            Created at:
            <span className="ml-1 font-semibold">
              {lineupQuery.createdAt.toDateString()}
            </span>
          </div>
          <div>
            Last edit:
            <span className="ml-1 font-semibold">
              {lineupQuery.updatedAt.toDateString()}
            </span>
          </div>

          {/* Conditional render of extra options of the user created the lineup */}
          {lineupQuery.user.id === data?.user?.id ? (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Link href={`/edit/${lineupQuery.id}`}>
                <a className="h-8 w-auto rounded bg-sky-400 text-xl text-gray-700 hover:bg-sky-500">
                  Edit
                </a>
              </Link>
              {/* TODO: implement delete */}
              <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialog.Trigger asChild>
                  <a className="h-8 w-auto rounded bg-red-400 text-xl text-gray-700 hover:bg-red-500">
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
                      Delete {lineupQuery.title}?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mt-4 font-normal">
                      Are you sure you want to delete: {lineupQuery.title}? This
                      will permanently delete the lineup
                    </AlertDialog.Description>
                    <div className="mt-4 flex justify-end space-x-2">
                      <AlertDialog.Cancel className="inline-flex select-none justify-center rounded-md border border-gray-500 bg-slate-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-400 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                        Cancel
                      </AlertDialog.Cancel>
                      <AlertDialog.Action
                        className="inline-flex select-none justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
                        onClick={delProcess}
                      >
                        Confirm
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          ) : null}
        </div>
      </div>
      <hr />
      <p className="pt-4">{lineupQuery.text}</p>
      {lineupQuery.image.split(",").map((urlId) => (
        <div className="my-4" key={urlId}>
          {urlId.includes("video") ? (
            <video
              controls
              src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
            />
          ) : (
            <Image
              src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
              alt="Valorant screenshot"
              width={1080}
              height={600}
            />
          )}
        </div>
      ))}
      <div className="flex justify-between">
        <div>
          Votes: <span className="ml-1">{lineupQuery?.votes}</span>
          <button onClick={() => castVote({ id, sentiment: "like" })}>
            {userLike == "like" ? <FaPlus color="cyan" /> : <FaPlus />}
          </button>
          <button onClick={() => castVote({ id, sentiment: "dislike" })}>
            {userLike == "dislike" ? <FaMinus color="cyan" /> : <FaMinus />}
          </button>
        </div>

        {/* This should just be a button that opens a modal or something */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="rounded-lg bg-neutral-600 px-6 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => fetchGroups()}
            >
              Add to group
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-20 bg-black/50">
              what is overlay
            </Dialog.Overlay>
            <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-[95vw] max-w-md -translate-x-[50%] -translate-y-[50%] flex-col rounded-lg bg-gray-800 p-4 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 md:w-full">
              <Dialog.Title className="text-center text-lg font-semibold">
                Select which group to add
              </Dialog.Title>
              {/* populate with all of the users groups w/onClick that appends. Ideally show which ones the lineup already is in w/remove option(?) */}
              {allGrps?.length ? (
                allGrps.map((grp) => (
                  <Fragment key={grp.id}>
                    <Dialog.Description
                      className="mx-1 w-fit px-2 py-1 shadow-lg hover:cursor-pointer hover:bg-gray-600"
                      onClick={() =>
                        addToGrp({ groupId: grp.id, lineupId: id })
                      }
                    >
                      {grp.name}
                    </Dialog.Description>
                  </Fragment>
                ))
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
      </div>
      <hr className="my-4" />
      <CommentForm />
      <hr className="my-4" />
      <CommentSection />
    </Layout>
  );
};

export default SpecificLineup;
