// default page to showcase lineups

import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Nav from "../../components/Nav";
import { trpc } from "../utils/trpc";

const Lineups: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["lineup.get-all"]);

  if (isLoading) {
    return (
      <div className="flex text-center text-4xl justify-center items-center mt-6">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Nav />
      <h1 className="text-4xl text-center mb-4">Lineups</h1>
      <main className="container ml-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.map((lineup) => (
          <section key={lineup.id}>
            <Link href={`/lineup/${lineup.id}`}>
              <h3>{lineup.title}</h3>
            </Link>
            <Link href={`/user/${lineup.userId}`}>
              <p>
                by:
                <a className="underline text-sky-500 ml-1">{lineup.creator}</a>
              </p>
            </Link>

            <Link href={`/lineup/${lineup.id}`}>
              <a>
                <Image
                  src={`https://t3-larry-bucket.s3.eu-west-2.amazonaws.com/${lineup.image}`}
                  alt="lineup"
                  width={1280}
                  height={720}
                />
              </a>
            </Link>
          </section>
        ))}
      </main>
    </>
  );
};

export default Lineups;
