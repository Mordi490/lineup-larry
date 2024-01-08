"use client";

// default page to showcase lineups

import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { zodApprovedAgentEnum, zodApprovedMapEnum } from "../../utils/enums";
import { api } from "../utils/api";
import PlaceholderImage from "../../public/placeholder-img.jpg";

import Link from "next/link";
import { Button } from "./_components/button";
import FilterDialog from "./_components/filterDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";

// "proper" TS enum
const filterOptions = ["recent", "most-likes", "oldest"] as const;
type FilterTypes = (typeof filterOptions)[number];

const Lineups = () => {
  const [filter, setFilter] = useState<FilterTypes>(filterOptions[0]);

  const [agent, setAgent] = useState<null | zodApprovedAgentEnum>();
  const [map, setMap] = useState<null | zodApprovedMapEnum>();

  const onFilterChange = (val: FilterTypes) => {
    setFilter(val);
  };

  const agentChange = (e: zodApprovedAgentEnum) => {
    setAgent(e);
  };

  const mapChange = (e: zodApprovedMapEnum) => {
    setMap(e);
  };

  const clearMap = () => {
    setMap(null);
  };

  const clearAgent = () => {
    setAgent(null);
  };

  const clearAll = () => {
    clearAgent();
    clearMap();
  };

  const {
    data: paginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
    error,
  } = api.lineup.infiniteLineups.useInfiniteQuery(
    {
      limit: 20,
      filter: filter,
      agent: agent,
      map: map,
    },
    {
      // getPreviousPageParam: (lastPage) => lastPage.nextCursor,
      getNextPageParam: (lastPage, pages) => lastPage?.nextCursor,
    },
  );

  if (isError) {
    console.log(error);
    return (
      <div className="my-auto text-center text-3xl text-red-500">
        Something went wrong, soz 🙃
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <h1 className="my-2 justify-center text-center text-4xl">Lineups</h1>
        <div className="mr-2 mb-2 flex items-center justify-end space-x-2">
          <FilterDialog
            mapChangeFX={mapChange}
            agentChangeFX={agentChange}
            currentAgent={agent}
            currentMap={map}
            agentClearFx={clearAgent}
            mapClearFx={clearMap}
            clearAllFilters={clearAll}
          />

          <div className="relative z-10">
            <Select
              defaultValue={filterOptions[0]}
              onValueChange={(e: FilterTypes) => onFilterChange(e)}
            >
              <SelectTrigger>
                <SelectValue placeholder="sort by" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((item) => (
                  <SelectItem value={item} key={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="mx-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedData?.pages.map((page, index) => (
          <Fragment key={page?.items[0]?.id || index}>
            {page?.items.length ? (
              page?.items.map((lineup) => (
                <article key={lineup.id}>
                  <div className="grid grid-cols-4">
                    <Link
                      className="col-span-3 truncate text-xl"
                      href={`/lineup/${lineup.id}`}
                    >
                      {lineup.title}
                    </Link>
                    <p className="flex justify-end font-thin">
                      by:
                      <Link
                        className="ml-1 text-sky-500 underline"
                        href={`/${lineup.userId}/lineups`}
                      >
                        {lineup.creator}
                      </Link>
                    </p>
                  </div>

                  <Link href={`/lineup/${lineup.id}`}>
                    {lineup.image?.length ? (
                      <ImageWithFallback
                        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${
                          lineup.image?.length &&
                          lineup.image.split(",")[lineup.previewImg]
                        }`}
                        onError={() => PlaceholderImage}
                        fallbackSrc={PlaceholderImage}
                        alt="screenshot from lineup"
                        width={1280}
                        height={720}
                      />
                    ) : lineup.YTLink ? (
                      <Image
                        width={1280}
                        height={720}
                        alt="Thumbnail for lineup"
                        src={`https://img.youtube.com/vi/${lineup.YTLink}/maxresdefault.jpg`}
                      />
                    ) : (
                      <ImageWithFallback
                        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${
                          lineup.image?.length &&
                          lineup.image.split(",")[lineup.previewImg]
                        }`}
                        onError={() => PlaceholderImage}
                        fallbackSrc={PlaceholderImage}
                        alt="screenshot from lineup"
                        width={1280}
                        height={720}
                      />
                    )}
                  </Link>
                </article>
              ))
            ) : (
              <p className="my-24 space-y-4 text-center text-lg text-red-300">
                Whelp! Seems like there are no lineups that fit your criteria!
              </p>
            )}
          </Fragment>
        ))}
      </div>
      <div className="mx-auto flex justify-end">
        <Button
          intent="primary"
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
        </Button>
      </div>
    </>
  );
};

const ImageWithFallback = ({ alt, src, fallbackSrc, ...rest }: any) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onLoadingComplete={(result) => {
        if (result.naturalWidth === 0) {
          // Broken image
          setImgSrc(fallbackSrc);
        }
      }}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default Lineups;
