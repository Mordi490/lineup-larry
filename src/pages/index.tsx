import { Button } from "@ui/button";
import type { NextPage } from "next";
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
        <div className="mt-3 hidden max-w-xl gap-3 py-3 text-center md:grid md:grid-cols-2">
          <Button intent="primary" href="/lineups">
            View Lineups
          </Button>

          <Button intent="primary" href="/api/auth/signin">
            Login
          </Button>

          <Button intent="primary" href="/create">
            Submit Lineup
          </Button>

          <Button intent="primary" href="/api/auth/signout">
            Logout
          </Button>
        </div>

        <div className="mt-3 grid gap-3 py-3 text-center md:hidden md:grid-cols-2">
          <Button intent="primary" href="/lineups">
            View Lineups
          </Button>

          <Button intent="primary" href="/api/auth/signin">
            Login
          </Button>

          <Button intent="primary" href="/create">
            Submit Lineup
          </Button>

          <Button intent="primary" href="/api/auth/signout">
            Logout
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
