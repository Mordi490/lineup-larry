import Layout from "../../components/layout";

const Contact = () => {
  return (
    <Layout title="Contact">
      <div className="mx-auto mt-4 max-w-2xl">
        <h1 className="my-4 text-center text-2xl font-bold">
          Found a bug or got a question?
        </h1>
        <p className="my-4">
          Send us an email at:{" "}
          <span className="underline">lineup.larry.contact@gmail.com</span>
        </p>
      </div>
    </Layout>
  );
};

export default Contact;
