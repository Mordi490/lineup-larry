import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { useSession } from "next-auth/react";
import Layout from "../../../components/layout";

const UserDetails = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const id = router.query.id as string;

  const { data: userData } = trpc.useQuery(["user.get-user", { id }]);

  const { data: allGroups } = trpc.useQuery([
    "protectedGroupRouter.get-all-groups",
  ]);

  if (session?.user?.id === id) {
    return (
      <Layout>
        <h1 className="mt-2 text-center text-4xl">Welcome: {userData?.name}</h1>
        <p>Data we have:</p>
        <pre>{JSON.stringify(userData, null, 4)}</pre>
        <hr className="my-4" />
        <h1 className="mt-2 text-center text-4xl">group data test</h1>
        <pre>{JSON.stringify(allGroups, null, 4)}</pre>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mt-2 text-center text-4xl">User: {userData?.name}</h1>
      <p>Data we have about this user:</p>
      <pre>{JSON.stringify(userData, null, 4)}</pre>
    </Layout>
  );
};

export default UserDetails;
