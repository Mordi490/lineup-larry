import { Lineup } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";

const SpecificLineup = () => {
  // need a session to check if the user is logged in, if so display edit button
  const { data } = useSession();
  const id = useRouter().query.id as string;
  const lineupQuery = trpc.useQuery(["lineup.by-id", { id }]);

  return (
    <>
      <h1 className="text-center font-bold text-3xl pt-2">
        {lineupQuery.data?.title}
      </h1>
      <div className="flex justify-between py-4">
        <div className="flex justify-start">
          <div>Created by: </div>
          <Link href={`/user/${lineupQuery.data?.user.id}`}>
            <span className="text-blue-400 underline ml-1 font-bold">
              {lineupQuery.data?.user.name}
            </span>
          </Link>
        </div>
        <div className="flex space-x-4 mr-1">
          <div>
            Created at:
            <span className="ml-1 font-semibold">
              {lineupQuery.data?.createdAt.toDateString()}
            </span>
          </div>
          <div>
            Last edit:
            <span className="ml-1 font-semibold">
              {lineupQuery.data?.updatedAt.toDateString()}
            </span>
          </div>

          {/* Conditional render of edit button */}
          {lineupQuery.data?.user.id === data?.user?.id ? (
            <Link href={`/edit/${lineupQuery.data?.id}`}>
              <button className="rounded bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl w-12 h-8">
                Edit
              </button>
            </Link>
          ) : null}

          
        </div>
      </div>
      <hr />
      <p className="py-4">{lineupQuery.data?.text}</p>
      <Image
        src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineupQuery.data?.image}`}
        alt="Valorant screenshot"
        width={1080}
        height={600}
      />
      <div className="flex">
        Votes: <span className="ml-1">{lineupQuery.data?.votes}</span>
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
