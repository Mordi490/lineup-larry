import { useRouter } from "next/router";
import Layout from "../../../components/ui/layout";
import Loading from "../../../components/ui/loading";
import { api } from "../../../utils/api";

const UserLineups = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = api.lineup.byAuthor.useQuery({ id });

  // consider adding the "creator" field to the lineup schema
  const { data: userData, isLoading: UserIsLoading } =
    api.user.getUser.useQuery({ id });

  if (isLoading) {
    return <Loading />;
  }

  if (!userData) {
    return (
      <Layout>
        <div>No user found</div>
      </Layout>
    );
  }

  return (
    <Layout title={`${userData.name}`} text={`${userData}`}>
      <h1>All lineups from: {userData.name}</h1>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </Layout>
  );
};

export default UserLineups;
