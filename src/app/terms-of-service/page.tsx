import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms of service for Lineup Larry",
};

const TOS = () => {
  return (
    <div className="mx-auto mt-4 max-w-2xl">
      <h1 className="my-4 text-2xl font-bold">Terms of Service</h1>
      <p className="my-4">
        As of right now, none. Adding analytics may change that.
      </p>
    </div>
  );
};

export default TOS;
