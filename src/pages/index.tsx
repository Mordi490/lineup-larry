import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import React from "react";
import { LogoutIcon } from "@heroicons/react/outline";
import { FaDiscord } from "react-icons/fa";
import { GiBowArrow } from "react-icons/gi";
import Image from "next/image";

const Nav: React.FC<{ userId: string }> = ({ userId }) => {
  const { data } = useSession();

  return (
    <>
      <Link href={"/"}>
        <button>
          <GiBowArrow size={64} color="cyan" />
        </button>
      </Link>
      <div className="flex gap-2 justify-end">
        <Link href={`/user/${data?.user?.id}/lineups`}>
          <button className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
            View my lineups
          </button>
        </Link>
        <Link href={`/create`}>
          <button className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100">
            Submit a Lineup
          </button>
        </Link>
        {/* TODO: profile is a menu that opens up all options, shortcuts for submittion is fine */}
        <button className="rounded">
          <Image
            src={data?.user?.image}
            height={64}
            width={64}
            alt="Discord profile picture"
          />
        </button>
        <button
          onClick={() => signOut()}
          className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
        >
          Logout <LogoutIcon width={32} />
        </button>
      </div>
    </>
  );
};

const Home: NextPage = () => {
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

  const { data: session, status } = useSession();
  const user = session?.user;

  if (!session)
    return (
      <div className="flex grow flex-col items-center justify-start">
        <div className="text-2xl font-bold">Please login below</div>
        <div className="p-4">
          <button
            onClick={() => signIn("discord")}
            className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
          >
            <span>Sign in with Discord</span>
            <FaDiscord />
          </button>
        </div>

        <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
        </div>
      </div>
    );

  return (
    <>
      <Nav userId={session.user?.id} />
      <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
        Lineup Larry
      </h1>
      <p className="text-2xl text-gray-700">Become a nerd today</p>
      <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3 h-16">
        <Link href="/lineups">
          <button className="rounded-l-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
            View lineups
          </button>
        </Link>
        <button className="rounded-r-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
          <Link href="/api/auth/signin">Sign in</Link>
        </button>
        <Link href="/create">
          <button className="rounded-l-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
            Submit lineup
          </button>
        </Link>
        <Link href="/api/auth/signout">
          <button className="rounded-r-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
            Logout
          </button>
        </Link>
      </div>
      <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
        {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
      </div>
    </>
  );
};

export default Home;
