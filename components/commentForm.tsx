import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { commentForm } from "../src/server/router/schemas/comment.schema";
import { trpc } from "../src/utils/trpc";

const CommentForm = () => {
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
      <h1 className="text-center text-xl font-bold">Write a comment</h1>
      <form className="" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center">
          <textarea
            placeholder="Write a comment..."
            className="h-32 w-1/3 bg-gray-600 text-white"
            {...register("content")}
            disabled={isSubmitting}
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">
              {errors.content.message}
            </p>
          )}
        </div>
        <div className="mt-4 flex w-5/6 justify-end">
          <button
            type="submit"
            className="h-fit w-fit rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
