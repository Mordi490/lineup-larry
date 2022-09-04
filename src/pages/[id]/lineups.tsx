import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Image from "next/image";

const Lineups = () => {
  const { data: session } = useSession();
  const id = useRouter().query.id as string;

  const { data: userInfo } = trpc.useQuery(["user.get-user", { id }]);

  // fetch own lineups
  const { data: lineups, isLoading } = trpc.useQuery([
    "lineup.by-author",
    { id },
  ]);

  return (
    <>
      <h1 className="text-center text-lg">
        Here are all the lineups for the user: {userInfo?.name}
      </h1>
      {userInfo?.image && (
        <Image
          src={userInfo?.image}
          height={64}
          width={64}
          alt="Discord profile picture"
        />
      )}
      <p>Display high lvl info: # lineups, total votes, etc </p>

      <h1>hehehe remove l8er</h1>
      <hr className="my-8" />
      <pre>{JSON.stringify(lineups, null, 4)}</pre>
    </>
  );
};

export default Lineups;
