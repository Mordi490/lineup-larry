import { Button } from "@ui/button";
import type { NextPage } from "next";
import { toast } from "react-hot-toast";
import Layout from "../components/layout";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

const Home: NextPage = () => {
  useEffect(() => {
    return () => {
      const hasSeenToast = localStorage.getItem("hasSeenToast")
      if (!hasSeenToast) {
        toast.error(
          "NB! this site a WIP, therefore odd design choices and errors may occur", { duration: 8000, icon: <AlertCircle size={64} fill="#FFD700"  /> }
        );
        localStorage.setItem("hasSeenToast", "true");
      }
    };
  }, []);

  return (
    <Layout>
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
