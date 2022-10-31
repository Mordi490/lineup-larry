import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import Loading from "../../../components/loading";
import Link from "next/link";
import { trpc } from "../../utils/trpc";
import { Fragment } from "react";

const Lineups = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const { data: userInfo } = trpc.useQuery(["user.get-user", { id }]);

  // Consider adding a endpoint for #lineups, #votes, etc.
  const { data: userData, isLoading: userDataIsLoading } = trpc.useQuery([
    "lineup.user-stats",
    { id },
  ]);

  const { data: byVotes, isLoading: byVotesIsLoading } = trpc.useQuery([
    "lineup.get-all-by-votes",
  ]);

  const {
    data: ratedLineups,
    hasNextPage: ratedHasNextPage,
    isFetchingNextPage: ratedIsFetchingNextPage,
    fetchNextPage: ratedFetchNextPage,
    isLoading: ratedIsLoading,
  } = trpc.useInfiniteQuery(
    ["lineup.inf-highest-rated-lineups-user", { limit: 21, userID: id }],
    { getNextPageParam: (lastPage, pages) => lastPage.nextCursor }
  );

  const {
    data: paginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading: recentIsLoading,
    isError,
    error,
  } = trpc.useInfiniteQuery(
    ["lineup.inf-recent-lineups-user", { limit: 21, userID: id }],
    { getNextPageParam: (lastPage, pages) => lastPage.nextCursor }
  );

  if (recentIsLoading || userDataIsLoading) {
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
              {paginatedData?.pages.map((page, index) => (
                <Fragment key={page.items[0]?.id || index}>
                  {page.items.length ? (
                    page.items.map((lineup) => (
                      <Link key={lineup.id} href={`/lineup/${lineup.id}`}>
                        <a className="truncate text-slate-300 underline">
                          {lineup.title}
                        </a>
                      </Link>
                    ))
                  ) : (
                    <p>This user has no lineups</p>
                  )}
                </Fragment>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="my-4 mx-4 rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load More"
                : "Nothing more to load"}
            </button>
          </div>

          {/*new: card of most "liked" lineups */}
          <div className="my-2 ml-2 flex flex-col">
            <h1 className="text-center text-xl font-medium">
              Highest rated lineups
            </h1>
            <ul className="mx-auto grid grid-cols-3">
              {ratedLineups?.pages.map((page, index) => (
                <Fragment key={page.items[0]?.id || index}>
                  {page.items.length ? (
                    page.items.map((lineup) => (
                      <Link key={lineup.id} href={`/lineup/${lineup.id}`}>
                        <a className="truncate text-slate-300 underline">
                          {lineup.title}
                        </a>
                      </Link>
                    ))
                  ) : (
                    <p>This user has no lineups</p>
                  )}
                </Fragment>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => ratedFetchNextPage()}
              disabled={!ratedHasNextPage || ratedIsFetchingNextPage}
              className="my-4 mx-4 rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              {ratedIsFetchingNextPage
                ? "Loading more..."
                : ratedHasNextPage
                ? "Load More"
                : "Nothing more to load"}
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Lineups;
