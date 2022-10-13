// default page to showcase lineups

import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import Loading from "../../components/loading";
import Layout from "../../components/layout";
import { Fragment } from "react";

const Lineups: NextPage = () => {
  const {
    data: paginatedData,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    isLoading,
    isError,
    error,
  } = trpc.useInfiniteQuery(
    [
      "lineup.infiniteLineups",
      {
        limit: 12,
      },
    ],
    {
      getPreviousPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>{JSON.stringify(error, null, 4)}</div>;
  }

  return (
    <Layout>
      <h1 className="my-2 text-center text-4xl">Lineups</h1>
      <div className="mx-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedData?.pages.map((page, index) => (
          <Fragment key={page.items[0]?.id || index}>
            {page.items.map((lineup) => (
              <article key={lineup.id}>
                <Link href={`/lineup/${lineup.id}`}>
                  <a>{lineup.title}</a>
                </Link>
                <p>
                  by:
                  <Link href={`/user/${lineup.userId}`}>
                    <a className="ml-1 text-sky-500 underline">
                      {lineup.creator}
                    </a>
                  </Link>
                </p>
                <Link href={`/lineup/${lineup.id}`}>
                  <a>
                    <Image
                      src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineup.image}`}
                      alt="lineup"
                      width={1280}
                      height={720}
                    />
                  </a>
                </Link>
              </article>
            ))}
          </Fragment>
        ))}
      </div>
      <button
        onClick={() => fetchPreviousPage()}
        disabled={!hasPreviousPage || isFetchingPreviousPage}
        className="flex h-fit w-fit justify-end rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isFetchingPreviousPage
          ? "Loading more..."
          : hasPreviousPage
          ? "Load More"
          : "Nothing more to load"}
      </button>
    </Layout>
  );
};

export default Lineups;
