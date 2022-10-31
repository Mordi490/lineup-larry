import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Loading from "../../../components/loading";
import Link from "next/link";
import { trpc } from "../../utils/trpc";

const Lineups = () => {
  const id = useRouter().query.id as string;

  const { data: userInfo } = trpc.useQuery(["user.get-user", { id }]);

  // fetch the user's lineups
  const { data: lineups, isLoading } = trpc.useQuery([
    "lineup.by-author",
    { id },
  ]);
  // Consider adding a endpoint for #lineups, #votes, etc.
  const { data: userData, isLoading: userDataIsLoading } = trpc.useQuery([
    "lineup.user-stats",
    { id },
  ]);

  const { data: byVotes, isLoading: byVotesIsLoading } = trpc.useQuery([
    "lineup.get-all-by-votes",
  ]);

  if (isLoading || userDataIsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Layout
        text={`${userInfo?.name}'s lineups`}
        title={`${userInfo?.name}'s lineups`}
      >
        <div className="my-4 flex flex-col">
          {/* profile pic & profile name */}
          <div className="grid grid-cols-2">
            <div className="grid justify-items-center">
              {userInfo?.image && (
                <Image
                  src={userInfo?.image}
                  height={144}
                  width={144}
                  className="rounded-full"
                  alt="User discord profile picture"
                />
              )}
            </div>

            <div className="grid place-self-center justify-self-start">
              {/* card of showing overall stats */}
              <div className="flex flex-col">
                <h1 className="font-mediums text-2xl">{userInfo?.name}</h1>
                <p>Number of lineups: {userData?.numOfLineup._count.id}</p>
                <p>Total sum of votes: {userData?.netVotes._sum.votes}</p>
              </div>
            </div>
          </div>

          {/* card of recent lineups */}
          <div className="my-2 ml-2 flex flex-col">
            <h1 className="text-center text-xl font-medium">Recent lineups</h1>
            <ul className="mx-auto grid grid-cols-3">
              {lineups?.length ? (
                lineups.map((lineup) => (
                  <Link key={lineup.id} href={`/lineup/${lineup.id}`}>
                    <a className="truncate text-slate-300 underline">
                      {lineup.title}
                    </a>
                  </Link>
                ))
              ) : (
                <p>no lineups</p>
              )}
            </ul>
          </div>

          {/* card of most "liked" lineups */}
          <div className="my-2 ml-2 flex flex-col">
            <h1 className="text-center text-xl font-medium">
              Highest rated lineups
            </h1>
            <ul className="mx-auto grid grid-cols-3">
              {byVotes?.length ? (
                byVotes.map((lineup) => (
                  <Link key={lineup.id} href={`/lineup/${lineup.id}`}>
                    <a className="truncate text-slate-300 underline">
                      {lineup.title}
                    </a>
                  </Link>
                ))
              ) : (
                <p>no lineups</p>
              )}
            </ul>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Lineups;
