/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Layout from "../components/layout";

const FAQ = () => {
  return (
    <Layout title="FAQ">
      <div className="mx-auto mt-4 max-w-2xl">
        <h1 className="my-4 text-center text-2xl font-bold">
          Why does this exist? (TLDR version)
        </h1>
        <p className="my-4">For fun</p>
        <h1 className="my-4 text-center text-2xl font-bold">
          Why does this exist?
        </h1>
        <p className="my-4">
          This site/project aims to be a hub for Valorant lineups. This site
          also aims to be a different experience than lineup guides on YouTube
          or other video based platforms. This site will be primarily be picture
          based. There are a few reasons for this, but the biggest one is that
          its's faster than jumping between timelines on a video. Once you know
          ~80% of a lineup, you only need a picture or two to confirm placement
          of character and crosshair placement.
        </p>

        <h1 className="my-4 text-center text-2xl font-bold">
          What about other sites that do the same thing
        </h1>
        <p className="my-4">
          This is is side project, and the goal is not necessarily to be
          "better" and replace other sites. But I do feel that Discord
          integration and UI (hopefully) in my opinion makes this site a good
          contender vs others.
        </p>

        <h1 className="my-4 text-center text-2xl font-bold">
          Does this side project have goals
        </h1>
        <p className="my-4">
          Nothing, specific. I wanted to get better at TS in general, and the
          <Link href="https://create.t3.gg/">
            <a className="ml-1 font-medium underline">T3-stack</a>
          </Link>{" "}
          was starting to gain some traction, leading me to try it
        </p>
      </div>
    </Layout>
  );
};

export default FAQ;
