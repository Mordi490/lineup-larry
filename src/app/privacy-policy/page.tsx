import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy policy for Lineup Larry",
};

const Privacy = () => {
  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <h1 className="my-4 text-center text-2xl font-bold">
        What do we collect?
      </h1>
      <p className="my-4">
        The only information we hold about our users are tied to their Discord
        account. From the Discord account we store the following: username,
        email (subject to change) and image.
      </p>

      <h1 className="my-4 text-center text-2xl font-bold">
        What do we do with collected information?
      </h1>
      <p className="my-4">
        The information is only used to tie lineups to a user. The data is not
        shared with anyone, as it should be.
      </p>
    </div>
  );
};

export default Privacy;