import { router } from "@trpc/server";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { z } from "zod";
import { trpc } from "../src/utils/trpc";
import Loading from "./loading";

const CommentSection = () => {
  const router = useRouter();
  const id = useRouter().query.id as string;

  const { data: comments, isLoading } = trpc.useQuery([
    "commentRouter.get-lineup-comments",
    { id },
  ]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col">
      <h1 className="my-2 text-center text-xl font-bold">Comment section</h1>
      {comments?.length ? (
        comments?.map((comment) => (
          <div
            className="my-4 flex max-w-3xl shadow-md xl:max-w-4xl"
            id="test"
            key={comment.id}
          >
            <div className="flex w-full">
              {/* left side: username & profile pic */}
              <div className="flex flex-col rounded-r-lg bg-gray-800 p-1">
                <div className="mb-2 truncate text-base font-medium">
                  {comment.user.name}
                </div>
                <Link href={`/${comment.user.name}/lineups`}>
                  <a
                    className="relative mx-auto h-12 w-12"
                    onClick={() =>
                      router.replace(
                        `/lineup/${id}`,
                        `/${comment.user.name}/lineups`
                      )
                    }
                  >
                    <Image
                      src={`${comment.user.image}`}
                      alt={`${comment.user.name}'s profile picture`}
                      layout="fill"
                      className="rounded-full"
                    />
                  </a>
                </Link>
              </div>
              {/* right side: Comment content */}
              <div className="flex flex-grow flex-col">
                <p className="ml-1 flex-grow items-center justify-center text-left text-base font-normal">
                  {comment.content}
                </p>

                <p
                  className="mb-1 mr-1 flex justify-end text-sm font-light italic"
                  id="tw_shit"
                >
                  Created: {comment.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="font-light italic" id="tailwind_smile">
          There currently are no comments
        </p>
      )}
    </div>
  );
};

export default CommentSection;
