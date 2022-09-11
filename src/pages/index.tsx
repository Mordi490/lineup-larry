import type { NextPage } from "next";
import Link from "next/link";
import Nav from "../../components/Nav";

const Home: NextPage = () => {

  return (
    <>
      <Nav />
      <div className="flex flex-col flex-grow mx-auto justify-center items-center">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold">
          Lineup Larry
        </h1>
        <p className="text-2xl text-gray-400">Become a nerd today</p>
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3 h-16">
          <Link href="/lineups">
            <button className="rounded-l-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              View lineups
            </button>
          </Link>
          <Link href="/api/auth/signin">
            <button className="rounded-r-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              Login
            </button>
          </Link>
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
      </div>
    </>
  );
};

export default Home;
