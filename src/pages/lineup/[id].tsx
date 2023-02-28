import { Button } from "@ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Link } from "@ui/link";
import { useRouter } from "next/router";
import CommentForm from "../../components/commentForm";
import CommentSection from "../../components/commentSection";
import DelLineupModal from "../../components/delLineupModal";
import { GroupDialog } from "../../components/groupDialog";
import Layout from "../../components/layout";
import Loading from "../../components/loading";
import { Votes } from "../../components/Votes";
import { api } from "../../utils/api";
import ErrImg from "../../../public/PepeHands.png"
import Placeholder from "../../../public/placeholder-img.jpg"

const SpecificLineup = () => {
  const { data } = useSession();
  const id = useRouter().query.id as string;

  const { data: lineupQuery, isLoading } = api.lineup.byId.useQuery({ id });

  if (isLoading) {
    return <Loading />;
  }

  if (!lineupQuery) {
    return (
      <Layout>
        <p className="text-center text-4xl text-red-500">
          SOMETHING WENT WRONG
        </p>
      </Layout>
    );
  }

  return (
    <Layout title={`${lineupQuery.title}`}>
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
              <Button intent={"primary"} href={`/edit/${lineupQuery.id}`}>
                Edit
              </Button>
              <Button intent={"danger"}>
                <DelLineupModal
                  id={lineupQuery.id}
                  title={lineupQuery.title}
                  key={lineupQuery.id}
                />
              </Button>
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
            <Button intent={"primary"} href={`/edit/${lineupQuery.id}`}>
              Edit
            </Button>
            <Button intent="danger">
              <DelLineupModal
                id={lineupQuery.id}
                title={lineupQuery.title}
                key={lineupQuery.id}
              />
            </Button>
          </div>
        ) : null}
        {lineupQuery.image.split(",").map((urlId) => (
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
                onError={() => ErrImg}
                src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${urlId}`}
                alt="Valorant screenshot"
                width={1080}
                height={600}
              />
            )}
          </div>
        ))}
      </div>
      {/* This is for mobile*/}
      <div className="sm:hidden">
        <div className="flex flex-col items-center">
          <div className="my-2">
            <Votes id={id} votes={lineupQuery.votes} />
          </div>
          <div className="my-2">{data?.user ? <GroupDialog /> : null}</div>
        </div>
      </div>
      {/* This is for non-mobile*/}
      <div className="hidden items-center justify-between sm:flex lg:justify-around">
        <div className="my-2 mx-4">
          <Votes id={id} votes={lineupQuery.votes} />
        </div>
        <div className="my-2 mx-4">{data?.user ? <GroupDialog /> : null}</div>
      </div>
      <CommentForm />
      <hr className="my-4" />
      <CommentSection />
    </Layout>
  );
};

export default SpecificLineup;
