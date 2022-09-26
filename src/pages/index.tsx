import type { NextPage } from "next";
import Link from "next/link";
import Layout from "../../components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold">
          Lineup Larry
        </h1>
        <p className="text-2xl text-gray-400">Become a nerd today</p>
        <div className="grid gap-3 py-3 mu-3 text-center md:grid-cols-2 lg:w-2/3 ">
          <Link href="/lineups">
            <a className="rounded-l-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              View lineups
            </a>
          </Link>
          <Link href="/api/auth/signin">
            <a className="rounded-r-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              Login
            </a>
          </Link>
          <Link href="/create">
            <a className="rounded-l-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              Submit lineup
            </a>
          </Link>
          <Link href="/api/auth/signout">
            <a className="rounded-r-lg bg-sky-400 hover:bg-sky-500 text-gray-700 text-xl">
              Logout
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
