import { useRouter } from "next/router";
import { lineupRouter } from "../../../server/router/lineups";
import { trpc } from "../../../utils/trpc";

const UserLineups = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = trpc.useQuery(["lineup.by-author", { id }]);

  // consider adding the "creator" field to the lineup schema
  const { data: userData, isLoading: UserIsLoading } = trpc.useQuery([
    "user.get-user",
    { id },
  ]);

  if (isLoading) {
    return (
      <div className="flex text-center text-4xl justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <h1>All lineups from: {userData?.name}</h1>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
};

export default UserLineups;
