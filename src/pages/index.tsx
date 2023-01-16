import type { NextPage } from "next";
import Link from "next/link";
import Layout from "../components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <h1 className="mx-auto max-w-2xl text-center text-xl font-extrabold leading-normal text-red-400 md:text-3xl">
        FYI THIS SITE IS A WIP AND IS BEING ACTIVELY WORKED ON!
      </h1>
      <hr className="my-4" />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold leading-normal md:text-[5rem]">
          Lineup Larry
        </h1>
        <p className="text-2xl text-gray-400">Become a nerd today</p>
        <div className="mt-3 hidden max-w-xl gap-3 py-3 text-center md:grid md:grid-cols-2 lg:w-2/3">
          <Link href="/lineups">
            <a className="rounded-l-lg bg-sky-400 p-1 text-xl text-gray-700 hover:bg-sky-500">
              View lineups
            </a>
          </Link>
          <Link href="/api/auth/signin">
            <a className="rounded-r-lg bg-sky-400 p-1 text-xl text-gray-700 hover:bg-sky-500">
              Login
            </a>
          </Link>
          <Link href="/create">
            <a className="rounded-l-lg bg-sky-400 p-1 text-xl text-gray-700 hover:bg-sky-500">
              Submit lineup
            </a>
          </Link>
          <Link href="/api/auth/signout">
            <a className="rounded-r-lg bg-sky-400 p-1 text-xl text-gray-700 hover:bg-sky-500">
              Logout
            </a>
          </Link>
        </div>

        <div className="mt-3 grid gap-3 py-3 text-center md:hidden md:grid-cols-2 lg:w-2/3 ">
          <Link href="/lineups">
            <a className="rounded bg-sky-400 p-2 text-xl text-gray-700 hover:bg-sky-500">
              View lineups
            </a>
          </Link>
          <Link href="/api/auth/signin">
            <a className="rounded bg-sky-400 p-2 text-xl text-gray-700 hover:bg-sky-500">
              Login
            </a>
          </Link>
          <Link href="/create">
            <a className="rounded bg-sky-400 p-2 text-xl text-gray-700 hover:bg-sky-500">
              Submit lineup
            </a>
          </Link>
          <Link href="/api/auth/signout">
            <a className="rounded bg-sky-400 p-2 text-xl text-gray-700 hover:bg-sky-500">
              Logout
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
