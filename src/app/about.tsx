"use client";

import Layout from "@ui/layout";

const About = () => {
    return (
      <Layout
        title="About"
        name="description"
        description="about the site/project"
      >
        <div className="mx-auto mt-4 max-w-2xl">
          <h1 className="my-4 text-center text-2xl font-bold">About?</h1>
          <p className="my-4">
            This site/project aims to be a hub for Valorant lineups. This site
            also aims to be a different experience than lineup guides on YouTube
            or other video based platforms. This site will be primarily be picture
            based. There are a few reasons for this, but the biggest one is that
            it&apos;s faster than jumping between timelines on a video. Once you
            know ~80% of a lineup, you only need a picture or two to confirm
            placement of character and crosshair placement.
          </p>
  
          <p>
            This website is not affiliated with or endorsed by Riot Games. All
            trademarks and gameplay appearing on the site are the property of
            their respective owners.
          </p>
        </div>
      </Layout>
    );
  };
  
  export default About;
  