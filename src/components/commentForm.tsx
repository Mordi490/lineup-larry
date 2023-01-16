import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { commentForm } from "../server/api/router/schemas/comment.schema";
import { api } from "../utils/api";

const CommentForm = () => {
  const { data: session } = useSession();
  type formSchemaType = z.infer<typeof commentForm>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<formSchemaType>({
    resolver: zodResolver(commentForm),
  });

  const { mutate: createComment } = api.comment.createComment.useMutation({
    onSuccess: () => {
      toast.success(`Comment Created!`);
    },
    onError: (err) => {
      toast.error(`Something went wrong!`);
      console.log(err);
    },
  });

  const id = useRouter().query.id as string;

  const onSubmit: SubmitHandler<formSchemaType> = async (input) => {
    const comment = {
      content: input.content,
      lineupId: id,
    };

    // TODO: push the new comment onto the comment section upon success, eg. optimistic refresh
    try {
      createComment(comment);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      {session?.user ? (
        <>
          <hr className="my-4" />
          <h1 className="mb-2 text-center text-xl font-bold">
            Write a comment
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-4">
            <div className="mx-4 flex justify-center xl:w-96">
              <textarea
                placeholder="Write a comment..."
                rows={3}
                className="block w-full bg-gray-600 px-3 text-white"
                {...register("content")}
                disabled={isSubmitting || !session?.user}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
            </div>
            <div className="mt-4 flex w-5/6 justify-end">
              <button
                aria-label="Submit form"
                type="submit"
                className="h-fit w-fit rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white hover:bg-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : "Submit"}
              </button>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
};

export default CommentForm;
