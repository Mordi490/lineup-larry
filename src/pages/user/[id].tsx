import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "../../../components/layout";
import { api } from "../../utils/api";

/**
 * This page is for ???????
 */
const UserDetails = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const id = router.query.id as string;

  const { data: userData } = api.user.getUser.useQuery({ id });

  if (session?.user?.id === id) {
    return (
      <Layout>
        <h1 className="mt-2 text-center text-4xl">Welcome: {userData?.name}</h1>
        <p>Data we have:</p>
        <hr className="my-4" />
        <p className="text-center text-3xl text-red-300">WIP</p>
        <h1 className="mt-2 text-center text-4xl">group data test</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mt-2 text-center text-4xl">User: {userData?.name}</h1>
      <p>Data we have about this user:</p>
      <p className="text-center text-3xl text-red-300">WIP</p>
    </Layout>
  );
};

export default UserDetails;
