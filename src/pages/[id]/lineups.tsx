import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Loading from "../../../components/loading";
import { trpc } from "../../utils/trpc";

const Lineups = () => {
  const id = useRouter().query.id as string;

  const { data: userInfo } = trpc.useQuery(["user.get-user", { id }]);

  // fetch the user's lineups
  const { data: lineups, isLoading } = trpc.useQuery([
    "lineup.by-author",
    { id },
  ]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Layout
        text={`${userInfo?.name}'s lineups`}
        title={`${userInfo?.name}'s lineups`}
      >
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
        <ul className="container">
          {lineups?.length ? (
            lineups.map((lineup) => <li key={lineup.id}>{lineup.title}</li>)
          ) : (
            <p className="text-lg">This user does not have any lineups</p>
          )}
        </ul>

        <h1>hehehe remove l8er</h1>
        <hr className="my-8" />
        <pre className="block text-sm">{JSON.stringify(lineups, null, 4)}</pre>
      </Layout>
    </>
  );
};

export default Lineups;
