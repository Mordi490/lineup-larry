import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../src/utils/trpc";
import Loading from "./loading";

const CommentSection = () => {
  const id = useRouter().query.id as string;

  const { data: comments, isLoading } = trpc.useQuery([
    "commentRouter.get-lineup-comments",
    { id },
  ]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container flex flex-col gap-2 sm:mx-1">
      <h1 className="text-xl">Comment section</h1>
      {comments?.length ? (
        comments?.map((comment) => (
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
        ))
      ) : (
        <>
          <p className="italic font-light">There currently are no comments</p>
        </>
      )}
    </div>
  );
};

export default CommentSection;
