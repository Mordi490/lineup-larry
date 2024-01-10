import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description: "FAQ for Lineup Larry",
};

const FAQ = () => {
  return (
    <div className="mx-auto mt-4 max-w-2xl space-y-4">
      <h1 className="text-center text-2xl font-bold">
        Why does this exist? (TLDR version)
      </h1>
      <p>This is sort of a side project, so for fun I guess</p>
      <h1 className="text-center text-2xl font-bold">How do I help</h1>
      <p>
        By uploading lineups, take a look at the
        <Link href="/guide" className="ml-1 font-medium underline">
          guide
        </Link>{" "}
        that gives advice around tools & settings for screenshots & recordings
      </p>
      <h1 className=" text-center text-2xl font-bold">
        Does this side project have goals
      </h1>
      <p>
        Nothing, specific. I wanted to get better at TS in general, and the
        <Link
          href="https://create.t3.gg/"
          className="ml-1 font-medium underline"
        >
          T3-stack
        </Link>{" "}
        was starting to gain some traction, leading me to try it
      </p>
    </div>
  );
};

export default FAQ;
