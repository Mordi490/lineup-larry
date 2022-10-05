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
import { useState } from "react";
import toast from "react-hot-toast";
import { router } from "@trpc/server";

const SpecificLineup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSession();
  const router = useRouter();
  const id = useRouter().query.id as string;
  const { data: lineupQuery, isLoading } = trpc.useQuery([
    "lineup.by-id",
    { id },
  ]);

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
        <p className="text-red-500 text-4xl text-center">
          SOMETHING WENT WRONG
        </p>
      </Layout>
    );
  }

  const delProces = () => {
    toast.loading("Deleting lineup");
    // deleting the data in the S3
    try {
      delS3Data({ id });
    } catch (err) {}

    // deleting the lineup data in pscale
    try {
      delLineup({ id });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout title={`${lineupQuery.title}`}>
      <h1 className="text-center font-bold text-3xl pt-2">
        {lineupQuery.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery.user.id}`}>
            <a className="text-blue-400 underline ml-1 font-bold">
              {lineupQuery?.user.name}
            </a>
          </Link>
        </div>
        <div className="flex space-x-4 mr-1">
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

          {/* Conditional render of extra options of the user created the linup */}
          {lineupQuery.user.id === data?.user?.id ? (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Link href={`/edit/${lineupQuery.id}`}>
                <a className="rounded bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl w-auto h-8">
                  Edit
                </a>
              </Link>
              {/* TODO: implement delete */}
              <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <AlertDialog.Trigger asChild>
                  <a className="rounded bg-red-400 hover:bg-red-500 text-gray-700 text-xl w-auto h-8">
                    Delete
                  </a>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 z-20 bg-black/50" />
                  <AlertDialog.Content
                    className="fixed z-50
              w-[95vw] max-w-md rounded-lg p-4 md:w-full bg-gray-700
              top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] 
              focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
                  >
                    <AlertDialog.Title className="text-center text-2xl font-medium">
                      Delete {lineupQuery.title}?
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mt-4 font-normal">
                      Are you sure you want to delete: {lineupQuery.title}? This
                      will permanently delete the lineup
                    </AlertDialog.Description>
                    <div className="mt-4 flex justify-end space-x-2">
                      <AlertDialog.Cancel className="inline-flex select-none justify-center rounded-md px-4 py-2 text-sm font-medium bg-slate-300 text-gray-900 hover:bg-slate-400 border border-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                        Cancel
                      </AlertDialog.Cancel>
                      <AlertDialog.Action
                        className="inline-flex select-none justify-center rounded-md px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 border border-transparent focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
                        onClick={delProces}
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
      <p className="py-4">{lineupQuery.text}</p>
      <Image
        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineupQuery.image}`}
        alt="Valorant screenshot"
        width={1080}
        height={600}
      />
      <div className="flex">
        Votes: <span className="ml-1">{lineupQuery?.votes}</span>
        <button onClick={() => console.log("+")}>
          <FaPlus />
        </button>
        <button onClick={() => console.log("-")}>
          <FaMinus />
        </button>
      </div>
      <hr className="my-4" />
      <CommentForm />
      <hr className="my-4" />
      <CommentSection />
    </Layout>
  );
};

export default SpecificLineup;
