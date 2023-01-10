// default page to showcase lineups

import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import Loading from "../../components/loading";
import Layout from "../../components/layout";
import { Fragment, useState } from "react";
import Select from "../../components/select";

// old enum attempt
//export type FilterTypes = "recent" | "most-likes" | "oldest";

// proper TS enum
const filterOptions = ["recent", "most-likes", "oldest"] as const
type FilterTypes = typeof filterOptions[number]

const Lineups = () => {
  const [filter, setFilter] = useState<FilterTypes>(filterOptions[0]);
  
  const onValChangeTest = (val: FilterTypes) => {
    setFilter(val);
  };
  
  const onItemClickTest = (val: FilterTypes) => {
    setFilter(val);
  };
  
  const {
    data: paginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    error,
  } = trpc.useInfiniteQuery(
    [
      "lineup.infiniteLineups",
      {
        limit: 20,
        filter: filter,
      },
    ],
    {
      // getPreviousPageParam: (lastPage) => lastPage.nextCursor,
      getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    console.log(error)
    return <div className="text-center text-red-500 text-3xl my-auto">Something went wrong, soz 🙃</div>;
  }


  return (
    <Layout>
      <div className="flex flex-col">
        <h1 className="my-2 justify-center text-center text-4xl">Lineups</h1>
        <div className="mr-2 mb-2 flex items-center justify-end">
        <Select
            onValueChangeFx={(val: FilterTypes) => onValChangeTest(val)}
            onItemClickFx={(val: FilterTypes) => onItemClickTest(val)}
            defaultValue={filterOptions[0]}
            values={filterOptions.map((e) => e)}
            />
        </div>
      </div>
      <div className="mx-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedData?.pages.map((page, index) => (
          <Fragment key={page.items[0]?.id || index}>
            {page.items.map((lineup) => (
              <article key={lineup.id}>
                <div className="grid grid-cols-4">
                  <Link href={`/lineup/${lineup.id}`}>
                    <a className="col-span-3 truncate text-xl">
                      {lineup.title}
                    </a>
                  </Link>
                  <p className="flex justify-end font-thin">
                    by:
                    <Link href={`/${lineup.userId}/lineups`}>
                      <a className="ml-1 text-sky-500 underline">
                        {lineup.creator}
                      </a>
                    </Link>
                  </p>
                </div>

                <Link href={`/lineup/${lineup.id}`}>
                  <a>
                    <Image
                      src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${
                        lineup.image.split(",")[lineup.previewImg]
                      }`}
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
      <div className="mx-auto flex justify-end">
        <button
          onClick={() => fetchNextPage()}
          aria-label="Load more"
          disabled={!hasNextPage || isFetchingNextPage}
          className="my-4 mx-4 flex justify-end rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
        >
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </button>
      </div>
    </Layout>
  );
};

export default Lineups;
