/* eslint-disable react/no-unescaped-entities */
import { Link } from "@ui/link";
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
          Does this side project have goals
        </h1>
        <p className="my-4">
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
    </Layout>
  );
};

export default FAQ;
