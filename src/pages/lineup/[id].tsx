import { Lineup } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";

const SpecificLineup = () => {
  const { data } = useSession();
  const id = useRouter().query.id as string;
  const { data: lineupQuery, isLoading } = trpc.useQuery([
    "lineup.by-id",
    { id },
  ]);

  if (isLoading) {
    return "...Loading";
  }

  return (
    <>
      <h1 className="text-center font-bold text-3xl pt-2">
        {lineupQuery?.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery?.user.id}`}>
            <span className="text-blue-400 underline ml-1 font-bold">
              {lineupQuery?.user.name}
            </span>
          </Link>
        </div>
        <div className="flex space-x-4 mr-1">
          <div>
            Created at:
            <span className="ml-1 font-semibold">
              {lineupQuery?.createdAt.toDateString()}
            </span>
          </div>
          <div>
            Last edit:
            <span className="ml-1 font-semibold">
              {lineupQuery?.updatedAt.toDateString()}
            </span>
          </div>

          {/* Conditional render of edit button */}
          {lineupQuery?.user.id === data?.user?.id ? (
            <Link href={`/edit/${lineupQuery?.id}`}>
              <button className="rounded bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl w-12 h-8">
                Edit
              </button>
            </Link>
          ) : null}
        </div>
      </div>
      <hr />
      <p className="py-4">{lineupQuery?.text}</p>
      <Image
        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineupQuery?.image}`}
        alt="Valorant screenshot"
        width={1080}
        height={600}
      />
      <div className="flex">
        Votes: <span className="ml-1">{lineupQuery?.votes}</span>
        <button onClick={() => console.log("+")}>
          <FaPlus />
        </button>
        <button onClick={() => console.log("-")}>
          <FaMinus />
        </button>
      </div>
    </>
  );
};

export default SpecificLineup;
