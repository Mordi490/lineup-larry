"use client"

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import Link from "next/link";
import CommentSection from "../../_components/commentSection";
import { Button } from "../../_components/button";
import DelLineupModal from "../../_components/delLineupModal";
import { Votes } from "../../_components/votes";
import CommentForm from "../../_components/commentForm";
import { GroupDialog } from "../../_components/groupDialog";

const SpecificLineup = () => {
  const { data } = useSession();
  const id = useRouter().query.id as string;

  const { data: lineupQuery, isLoading } = api.lineup.byId.useQuery({ id });

  if (!lineupQuery) {
    return (
      <>
        <p className="text-center text-4xl text-red-500">
          SOMETHING WENT WRONG
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="pt-2 text-center text-3xl font-bold">
        {lineupQuery.title}
      </h1>
      {/* mobile thingy */}
      <div className="hidden sm:my-2 sm:flex sm:justify-between">
        {/* start of creation details */}
        {/* left side */}
        <div className="ml-2 flex items-center justify-start">
          {/* "Created by: <name>" */}
          <p className="justify-start">
            Created by:
            <span>
              <Link
                className="ml-1 font-bold text-blue-400 underline"
                href={`/user/${lineupQuery.user.id}`}
              >
                {lineupQuery.user.name}
              </Link>
            </span>
          </p>
        </div>

        {/* right side*/}
        <div className="mr-2 flex items-center  justify-end">
          {/* Dates 'n' stuff */}
          <div className="flex justify-between italic">
            <div>
              created at: <span>{lineupQuery.createdAt.toDateString()}</span>
            </div>
            <div className="mx-2">
              Last edit: <span>{lineupQuery.updatedAt.toDateString()}</span>
            </div>
          </div>

          {/* Conditional render of extra options of the user created the lineup */}
          {lineupQuery.user.id === data?.user?.id ? (
            <div className="grid grid-cols-2 gap-2 text-center">
              <Link href={`/edit/${lineupQuery.id}`}>
              <Button intent={"primary"}>
                Edit
              </Button>
              <Button intent={"danger"}>
                <DelLineupModal
                  id={lineupQuery.id}
                  title={lineupQuery.title}
                  key={lineupQuery.id}
                />
              </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
      <hr />
      <div className="flex flex-col">
        <p className="ml-1 pt-4 text-xl font-medium lg:text-center">
          {lineupQuery.text}
        </p>
        {/* For mobile view the edit/del buttons underneath the desc/text */}
        {lineupQuery.user.id === data?.user?.id ? (
          <div className="mx-2 flex justify-end gap-4 sm:hidden">
            <Link href={`/edit/${lineupQuery.id}`}>
            <Button intent={"primary"}>
              Edit
            </Button>
            <Button intent="danger">
              <DelLineupModal
                id={lineupQuery.id}
                title={lineupQuery.title}
                key={lineupQuery.id}
              />
            </Button>
            </Link>
          </div>
        ) : null}
        {lineupQuery.image?.length
          ? lineupQuery.image.split(",").map((urlId) => (
              <div className="my-4 mx-auto" key={urlId}>
                {urlId.includes("video") ? (
                  <video
                    controls
                    src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
                  />
                ) : (
                  <Image
                    placeholder="blur"
                    blurDataURL={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
                    onError={() => "/pepeHands.png"}
                    src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
                    alt="Valorant screenshot"
                    width={1080}
                    height={600}
                  />
                )}
              </div>
            ))
          : null}
        {lineupQuery.YTLink ? (
          <iframe
            className="aspect-video"
            title={lineupQuery.title}
            sandbox="allow-same-origin allow-forms allow-popups allow-scripts allow-presentation"
            src={`https://youtube.com/embed/${lineupQuery.YTLink}?autoplay=0`}
          ></iframe>
        ) : null}
      </div>
      {/* This is for mobile*/}
      <div className="sm:hidden">
        <div className="flex flex-col items-center">
          <div className="my-2">
            <Votes lineupId={id} votes={lineupQuery.votes} />
          </div>
          <div className="my-2">{data?.user ? <GroupDialog /> : null}</div>
        </div>
      </div>
      {/* This is for non-mobile*/}
      <div className="hidden items-center justify-between sm:flex lg:justify-around">
        <div className="my-2 mx-4">
          <Votes lineupId={id} votes={lineupQuery.votes} />
        </div>
        <div className="my-2 mx-4">{data?.user ? <GroupDialog /> : null}</div>
      </div>
      <CommentForm />
      <hr className="my-4" />
      <CommentSection author={lineupQuery.user.id} />
    </>
  );
};

export default SpecificLineup;
