import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recommendations for uploads",
  description: "Reasonable settings for screenshots and recording",
};

const Guide = () => {
  // This page is meant to geforce/shadowplay settings for optimal images/video for the site

  return (
    <>
      <div className="mx-auto mt-4 max-w-2xl space-y-4">
        <h1 className="text-center text-2xl font-bold">
          Guidelines/recommendations for screenshots & videos
        </h1>
        <p>
          Use your GPU&apos;s screen recoridng software, ie. shadowplay for
          Nvidia and relive for AMD. 60 fps is and bitrates over XYZ is overkill
          and result in just too large file sizes. Therefore we recommend you
          use 30 fps and XYZ bitrate
        </p>
        <p>
          Feel free to also edit in pointers, arrows and circles to hightlight
          where things need to lineup.
        </p>
      </div>
    </>
  );
};

export default Guide;
