import Link from "next/link";
import Layout from "../components/layout";

const Guide = () => {
  // This page is meant to geforce/shadowplay settings for optimal images/video for the site

  return (
    <Layout name="description" description="Recommended tools & settings for recordings & screenshots">
      <div className="mx-auto mt-4 max-w-2xl space-y-4">
        <h1 className="text-center text-2xl font-bold">
          Guidelines/recommendations for screenshots & videos
        </h1>
        <h3 className="text-center text-xl font-semibold">
          ShadowPlay & recording
        </h3>
        <p>
          Vanguard limits our options quite a bit, tools like ShareX do not
          work. However owners of Nvidia GFX can you ShadowPlay & other GeForce
          features to take screenshots and record. This page will go in-depth on
          what settings to tweak. If you own an AMD GFX you&apos;ll have to dig
          through the UI yourself to find out where things are.
        </p>

        <h3 className="text-center text-xl font-semibold">
          Recording settings
        </h3>

        <p>
          As for settings, 30 fps and 35-50mbps is a good starting point for
          most resolutions. Remember to mute other audio sources such as your
          microphone and other programs (YouTube, Spotify, etc).
        </p>

        <h3 className="text-center text-xl font-semibold">
          Screenshot settings
        </h3>
        <p>
          which ever GFX you comes with a utility tool that you can use for
          screenshots. Recommend settings is: xyz
        </p>

        <h3 className="text-center text-xl font-semibold">
          Simple editing/cutting
        </h3>
        <p>
          Recording can be cut within the GeForce utility simply by opening the
          gallery. Another option is to use something like{" "}
          <Link
            href="https://handbrake.fr/"
            className="ml-1 font-medium underline"
          >
            HandBrake
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Guide;
