"use client"

import Image from "next/image"
import { useRouter } from "next/router"
import { Fragment } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { FaTrashAlt } from "react-icons/fa"
import toast from "react-hot-toast"
import PepeHands from "../../../public/PepeHands.png"
import Link from "next/link"
import { api } from "../../../utils/api"
import { Button } from "../../_components/button"

const Page = () => {
  const router = useRouter()
  const id = router.query.id as string

  // TODO or consider making this a popup/alert
  const { mutate: delGroup } = api.group.deleteGroup.useMutation({
    onSuccess: (res) => {
      toast.remove()
      toast.success(`${res.name} has been deleted`)
    },
    onError: (err) => {
      console.log(err)
      toast.error(`Something went wrong`)
    },
  })

  const { data: userInfo } = api.user.getUser.useQuery({ id })

  // Consider adding a endpoint for #lineups, #votes, etc.
  const { data: userData, isLoading: userDataIsLoading } =
    api.lineup.userStats.useQuery({ id })

  // fetch groups, std for now, impl inf l8er
  const { data: groups } = api.group.publicGroupsFromUser.useQuery({ id })

  const {
    data: ratedLineups,
    hasNextPage: ratedHasNextPage,
    isFetchingNextPage: ratedIsFetchingNextPage,
    fetchNextPage: ratedFetchNextPage,
    isLoading: ratedIsLoading,
  } = api.lineup.highestRatedLineupsFromUser.useInfiniteQuery(
    { limit: 21, userID: id },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const { mutate: removeFromGroup } = api.group.removeFromGroup.useMutation({
    onSuccess: (res) => {
      toast.remove()
      toast.success(`${res.name} was removed from group`)
    },
    onError: (err) => {
      console.log(err)
      toast.remove()
      toast.error("Something went wrong")
    },
  })

  const {
    data: paginatedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading: recentIsLoading,
  } = api.lineup.recentLineupsFromUser.useInfiniteQuery(
    { limit: 21, userID: id },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  /*
  if (recentIsLoading || userDataIsLoading || ratedIsLoading) {
    return <Loading />;
  }
  */

  return (
    <>
      <div className="my-4 flex flex-col">
        {/* profile pic & profile name */}
        <div className="grid grid-cols-2">
          <div className="grid justify-items-center">
            {userInfo?.image && (
              <Image
                placeholder="blur"
                blurDataURL={userInfo?.image}
                onError={() => "/pepeHands.png"}
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
              <p>
                Joined at: {userData?.joinedAt?.joinedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* card of recent lineups */}
        <div className="my-2 ml-2 flex flex-col">
          <h1 className="text-center text-xl font-medium">Recent lineups</h1>
          <ul className="mx-auto mt-2 grid grid-cols-3">
            {paginatedData?.pages.map((page, index) => (
              <Fragment key={page.items[0]?.id || index}>
                {page.items.length ? (
                  page.items.map((lineup) => (
                    <Link
                      className="truncate text-slate-300 underline"
                      key={lineup.id}
                      href={`/lineup/${lineup.id}`}
                    >
                      {lineup.title}
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
          <Button
            aria-label="Load more"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="my-4 mx-4 rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </Button>
        </div>

        {/*new: card of most "liked" lineups */}
        <div className="my-2 ml-2 flex flex-col">
          <h1 className="text-center text-xl font-medium">
            Highest rated lineups
          </h1>
          <ul className="mx-auto mt-2 grid max-w-3xl grid-cols-3">
            {ratedLineups?.pages.map((page, index) => (
              <Fragment key={page.items[0]?.id || index}>
                {page.items.length ? (
                  page.items.map((lineup) => (
                    <Link
                      className="w-fit truncate text-slate-300 underline"
                      key={lineup.id}
                      href={`/lineup/${lineup.id}`}
                    >
                      {lineup.title}
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
          <Button
            intent={"primary"}
            onClick={() => ratedFetchNextPage()}
            aria-label="Load more"
            disabled={!ratedHasNextPage || ratedIsFetchingNextPage}
            className="my-4 mx-4 rounded-lg bg-blue-600 px-8 py-4 font-semibold uppercase text-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            {ratedIsFetchingNextPage
              ? "Loading more..."
              : ratedHasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </Button>
        </div>
      </div>

      {/* showcase public groups */}
      <h1 className="text-center text-xl font-medium">Groups</h1>
      <div className="mx-auto max-w-xl">
        {groups?.length ? (
          groups.map((gr) => (
            <div key={gr.id} className="flex p-2">
              <Dialog.Root>
                <div className="flex w-full justify-between">
                  <Dialog.Trigger asChild className="ml-2">
                    <button
                      aria-label="Open group"
                      className="truncate underline"
                    >
                      {gr.name}
                    </button>
                  </Dialog.Trigger>
                  <button
                    onClick={() => delGroup({ id: gr.id })}
                    aria-label="Delete group"
                    className="ml-2 flex items-center rounded-md bg-red-500 py-1 px-2 font-medium uppercase text-neutral-800 hover:bg-red-400"
                  >
                    Delete{" "}
                    <span className="ml-1">
                      <FaTrashAlt size={14} color="black" />
                    </span>
                  </button>
                </div>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-20 grid items-center overflow-y-auto bg-black/80">
                    <Dialog.Content className="z-50 mx-auto w-[95vw] max-w-2xl flex-col rounded-lg bg-gray-800 p-8 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 md:w-full">
                      <Dialog.Title className="text-center text-lg font-semibold">
                        {gr.name}
                      </Dialog.Title>
                      {gr.Lineup.map((ln) => (
                        <div key={ln.id} className="my-4 shadow-2xl">
                          <div>
                            <div className="mb-2 flex justify-between">
                              <Link
                                className="truncate text-lg font-medium hover:cursor-pointer"
                                href={`/lineup/${ln.id}`}
                              >
                                {ln.title}
                              </Link>

                              {/* TODO/QoL: optimistic UI here */}
                              <Button
                                intent={"danger"}
                                aria-label="Remove from group"
                                onClick={() =>
                                  removeFromGroup({
                                    groupId: gr.id,
                                    lineupId: ln.id,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                            <Link href={`/lineup/${ln.id}`}>
                              {/* TODO: fucks up w/vid previews */}
                              <Image
                                placeholder="blur"
                                blurDataURL={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${
                                  ln.image?.split(",")[ln.previewImg]
                                }`}
                                onError={() => PepeHands}
                                className="hover:cursor-pointer"
                                width={900}
                                height={600}
                                alt="Valorant screenshot"
                                src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${
                                  ln.image?.split(",")[ln.previewImg]
                                }`}
                              />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </Dialog.Content>
                  </Dialog.Overlay>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          ))
        ) : (
          <p className="mt-1 text-center">This user has no groups</p>
        )}
      </div>
    </>
  )
}

export default Page
