import Layout from "../../components/layout";

const About = () => {
  return (
    <Layout title="About">
      <div className="container mx-auto mt-4 text-center">
        <h1 className="my-4 text-2xl font-bold">About?</h1>
        <p className="my-4">
          This site/project aims to be a hub for Valorant lineups. This site
          also aims to be a different experience than lineup guides on YouTube
          or other video based platforms. This site will be primarily be picture
          based. There are a few reasons for this, but the biggest one is that
          it&apos;s faster than jumping between timelines on a video. Once you
          know ~s80% of a lineup, you only need a picture or two to confirm
          placement of character and crosshair placement.
        </p>
      </div>
    </Layout>
  );
};

export default About;
