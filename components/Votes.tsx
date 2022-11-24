import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa";
import { trpc } from "../src/utils/trpc";

interface voteProps {
  votes: number;
  id: string; // queryParam
}

export const Votes = (props: voteProps) => {
  const id = useRouter().query.id as string;
  const { data: userLike } = trpc.useQuery([
    "privateUserRouter.get-user-sentiment-by-id",
    { id },
  ]);
  const { mutate: castVote } = trpc.useMutation(["privateLineup.cast-vote"]);

  return (
    <div>
      Votes: <span className="ml-1">{props.votes}</span>
      <button onClick={() => castVote({ id, sentiment: "like" })}>
        {userLike == "like" ? <FaPlus color="cyan" /> : <FaPlus />}
      </button>
      <button onClick={() => castVote({ id, sentiment: "dislike" })}>
        {userLike == "dislike" ? <FaMinus color="cyan" /> : <FaMinus />}
      </button>
    </div>
  );
};