import { Comment, Lineup } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Nav from "../../../components/Nav";
import { FaMinus, FaPlus } from "react-icons/fa";

const SpecificLineup = () => {
  const { data } = useSession();
  const id = useRouter().query.id as string;
  const { data: lineupQuery, isLoading } = trpc.useQuery([
    "lineup.by-id",
    { id },
  ]);

  const { data: comments, isSuccess } = trpc.useQuery([
    "commentRouter.get-lineup-comments",
    { id },
  ]);

  if (isLoading) {
    return "...Loading";
  }

  return (
    <>
      <Nav />
      <h1 className="text-center font-bold text-3xl pt-2">
        {lineupQuery?.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery?.user.id}`}>
            <span className="text-blue-400 underline ml-1 font-bold">
              {lineupQuery?.user.name}
            </span>
          </Link>
        </div>
        <div className="flex space-x-4 mr-1">
          <div>
            Created at:
            <span className="ml-1 font-semibold">
              {lineupQuery?.createdAt.toDateString()}
            </span>
          </div>
          <div>
            Last edit:
            <span className="ml-1 font-semibold">
              {lineupQuery?.updatedAt.toDateString()}
            </span>
          </div>

          {/* Conditional render of edit button */}
          {lineupQuery?.user.id === data?.user?.id ? (
            <Link href={`/edit/${lineupQuery?.id}`}>
              <button className="rounded bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl w-12 h-8">
                Edit
              </button>
            </Link>
          ) : null}
        </div>
      </div>
      <hr />
      <p className="py-4">{lineupQuery?.text}</p>
      <Image
        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineupQuery?.image}`}
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
      <div className="container flex flex-col gap-2 sm:mx-1">
        <h1 className="text-xl">Comment section</h1>
        {comments?.map((comment) => (
          <section key={comment.id}>
            <article className="flex justify-start">
              <div className="flex flex-col">
                <div className="">
                  <div className="text-sm w-16 truncate font-semibold">
                    {comment.user.name}
                  </div>
                  <Image
                    src={comment.user.image}
                    width={48}
                    height={48}
                    alt={`${comment.user.name}'s profile picture`}
                    className="rounded-full"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-xl my-auto">{comment.content}</p>
                <p className="text-sm italic justify-end">
                  Posted on: {new Date(comment.date).toLocaleString()}
                </p>
              </div>
            </article>
          </section>
        ))}
      </div>
    </>
  );
};

export const Comments = (comments) => {
  /**
   * I am too dumb for this rn:
   * 
   *   if (!comments) {
    return (
      <>
        <h1>No comments here yet</h1>
      </>
    );
  }

  return (
    <>
      {comments.map((comment: Comment) => (
        <section key={comment.id}>{comment.content}</section>
      ))}
    </>
  );
   */
};

export default SpecificLineup;
