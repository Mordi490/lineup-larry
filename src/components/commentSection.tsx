import Image from "next/image";
import { Link } from "@ui/link";
import { useRouter } from "next/router";
import { api } from "../utils/api";
import Loading from "./loading";
import ErrImg from "../../public/on_err_img_profile.png"
import { cn } from "../utils/utils";

interface Props {
  author: string;
}

const CommentSection = (props: Props) => {
  const id = useRouter().query.id as string;

  const { data: comments, isLoading } = api.comment.getLineupComments.useQuery({
    id,
  });

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
            key={comment.id}
          >
            <div className="flex w-full">
              {/* left side: username & profile pic */}
              <div className="flex flex-col rounded-r-lg bg-gray-800 p-1">
                <div className="mb-2 truncate text-base font-medium">
                  {comment.user.name}
                </div>
                <Link
                  className="relative mx-auto h-12 w-12"
                  href={`/${comment.user.id}/lineups`}
                >
                  <Image
                    placeholder="blur"
                    blurDataURL={comment.user.image}
                    onError={() => ErrImg}
                    className="rounded-full"
                    src={`${comment.user.image}`}
                    alt={`${comment.user.name}'s profile picture`}
                    layout="fill"
                  />
                </Link>
              </div>
              {/* right side: Comment content */}
              <div className={cn({
                "flex flex-grow flex-col": true,
                "border border-dotted  border-amber-500 rounded-lg": props.author == comment.user.id
              })}>
                <p className="ml-1 flex-grow items-center justify-center text-left text-base font-normal">
                  {comment.content}
                </p>

                <p className="mb-1 mr-1 flex justify-end text-sm font-light italic">
                  Created: {comment.date.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center font-light italic text-neutral-400">
          There currently are no comments
        </p>
      )}
    </div >
  );
};

export default CommentSection;
