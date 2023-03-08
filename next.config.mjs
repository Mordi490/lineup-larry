import { env } from "./src/env/server.mjs";

import { withPlausibleProxy } from "next-plausible";

// add whatever headers you need, see: https://nextjs.org/docs/advanced-features/security-headers
// also this cannot be null, therefore I added a random example
const securityHeaders = [{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
}];

const config = withPlausibleProxy()({
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    domains: [
      "cdn.discordapp.com", // URL for discord profile pics
      "s3.eu-west-2.amazonaws.com", // PICK ONE (I THINK)
      "t3-larry-bucket.s3.eu-west-2.amazonaws.com",
      "https://i.pinimg.com", // used for blurring profile pic til user's image is being fetched
    ],
  },
});

export default config;