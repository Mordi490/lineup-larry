import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useSession } from "next-auth/react";
import Layout from "../../../components/layout";

const UserDetails = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const id = router.query.id as string;

  const { data } = trpc.useQuery(["user.get-user", { id }]);

  console.log("userData: " + data);

  if (session?.user?.id === id) {
    return (
      <Layout>
        <h1 className="text-center text-4xl mt-2">Welcome: {data?.name}</h1>
        <p>Data we have about your user:</p>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-center text-4xl mt-2">User: {data?.name}</h1>
      <p>Data we have about your user:</p>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </Layout>
  );
};

export default UserDetails;
