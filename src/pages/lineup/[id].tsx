import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import Nav from "../../../components/Nav";
import { FaMinus, FaPlus } from "react-icons/fa";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentForm } from "../../server/router/schemas/comment.schema";

const SpecificLineup = () => {
  type formSchemaType = z.infer<typeof commentForm>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(commentForm),
  });

  const { mutate: createComment } = trpc.useMutation([
    "protectedCommentRouter.create-comment",
  ]);

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

  const onSubmit: SubmitHandler<formSchemaType> = async (input) => {
    const comment = {
      content: input.content,
      lineupId: id,
    };

    try {
      createComment(comment);
    } catch (e) {
      console.log(e);
    }
  };

  if (isLoading) {
    return "...Loading";
  }

  if (!lineupQuery) {
    return "Somewting went wrong";
  }

  return (
    <>
      <Nav />
      <h1 className="text-center font-bold text-3xl pt-2">
        {lineupQuery.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery.user.id}`}>
            <span className="text-blue-400 underline ml-1 font-bold">
              {lineupQuery?.user.name}
            </span>
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

          {/* Conditional render of edit button */}
          {lineupQuery.user.id === data?.user?.id ? (
            <Link href={`/edit/${lineupQuery.id}`}>
              <button className="rounded bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl w-12 h-8">
                Edit
              </button>
            </Link>
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
      <div>
        <h1 className="text-center text-xl font-bold">Write a comment</h1>
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center">
            <textarea
              placeholder="Write a comment..."
              className="text-white bg-gray-600 w-1/3 h-32"
              {...register("content")}
              disabled={isSubmitting}
            ></textarea>
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">
                {errors.content.message}
              </p>
            )}
          </div>
          <div className="mt-4 flex w-5/6 justify-end">
            <button
              type="submit"
              className=" h-fit w-fit px-8 py-4 uppercase text-white font-semibold bg-blue-600 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
      <hr className="my-4" />

      <div className="container flex flex-col gap-2 sm:mx-1">
        <h1 className="text-xl">Comment section</h1>
        {comments?.map((comment) => (
          <section key={comment.id} className="border border-1 ">
            <article className="flex justify-start">
              <div className="flex flex-colz">
                <Link href={`/user/${comment.user.id}`}>
                  <a>
                    <div className="text-sm w-16 truncate font-semibold hover:text-clip">
                      {comment.user.name}
                    </div>
                    {comment.user.image && (
                      <Image
                        src={comment.user.image}
                        width={48}
                        height={48}
                        alt={`${comment.user.name}'s profile picture`}
                        className="rounded-full"
                      />
                    )}
                  </a>
                </Link>
              </div>
              <div className="flex flex-col grow">
                <p className="text-xl mt-6">{comment.content}</p>
                <p className="text-sm italic flex justify-end">
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

export default SpecificLineup;
