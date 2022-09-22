// default page to showcase lineups

import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import Loading from "../../components/loading";
import Layout from "../../components/layout";

const Lineups: NextPage = () => {
  const { data, isLoading, isError, error } = trpc.useQuery(["lineup.get-all"]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>{JSON.stringify(error, null, 4)}</div>;
  }

  return (
    <Layout>
      <h1 className="text-4xl text-center mb-4">Lineups</h1>
      <main className="container ml-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.length ? (
          data.map((lineup) => (
            <section key={lineup.id}>
              <Link href={`/lineup/${lineup.id}`}>
                <h3>{lineup.title}</h3>
              </Link>
              <Link href={`/user/${lineup.userId}`}>
                <p>
                  by:
                  <a className="underline text-sky-500 ml-1">
                    {lineup.creator}
                  </a>
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
          ))
        ) : (
          <div>There are currently no lineups</div>
        )}
      </main>
    </Layout>
  );
};

export default Lineups;
