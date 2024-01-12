import { useRouter } from "next/router";
import { api } from "../../../utils/api";

const UserLineups = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = api.lineup.byAuthor.useQuery({ id });

  // consider adding the "creator" field to the lineup schema
  const { data: userData, isLoading: UserIsLoading } =
    api.user.getUser.useQuery({ id });

  if (!userData) {
    return <div>No user found</div>;
  }

  return (
    <>
      <h1>All lineups from: {userData.name}</h1>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
};

export default UserLineups;
