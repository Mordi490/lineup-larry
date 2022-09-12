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
  );
};

export default CommentForm;
