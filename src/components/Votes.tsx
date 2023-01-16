import { useRouter } from "next/router";
import { FaMinus, FaPlus } from "react-icons/fa";
import { api } from "../utils/api";

type voteProps = {
  votes: number;
  id: string; // queryParam
};

export const Votes = (props: voteProps) => {
  const id = useRouter().query.id as string;
  const { data: userLike } = api.user.getUserSentiment.useQuery({ id });

  const { mutate: castVote } = api.lineup.castVote.useMutation();

  return (
    <div className="inline-flex items-center gap-2 text-lg font-medium">
      Votes: <span>{props.votes}</span>
      <button
        aria-label="Like button"
        onClick={() => castVote({ id, sentiment: "like" })}
      >
        {userLike == "like" ? (
          <FaPlus color="cyan" id="why" />
        ) : (
          <FaPlus id="why" />
        )}
      </button>
      <button
        aria-label="Dislike button"
        onClick={() => castVote({ id, sentiment: "dislike" })}
      >
        {userLike == "dislike" ? (
          <FaMinus color="cyan" id="why" />
        ) : (
          <FaMinus id="why" />
        )}
      </button>
    </div>
  );
};
