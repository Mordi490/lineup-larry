import Layout from "../../components/layout";

const Privacy = () => {
  return (
    <Layout title="Privacy Policy" text="Privacy Policy">
      <div className="container mx-auto mt-4 text-center">
        <h1 className="my-4 text-2xl font-bold">What do we collect?</h1>
        <p className="my-4">
          The only information we hold about our users are tied to their Discord
          account. From the Discord account we store the following: username,
          email (subject to change) and image.
        </p>

        <h1 className="my-4 text-2xl font-bold">
          What do we do with collected information?
        </h1>
        <p className="my-4">
          The information is only used to tie lineups to a user. The data is not
          shared with anyone, as it should be.
        </p>
      </div>
    </Layout>
  );
};

export default Privacy;
