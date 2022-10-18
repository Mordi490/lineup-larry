import { env } from "./src/env/server.mjs";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "cdn.discordapp.com", // URL for discord profile pics
      "lh3.googleusercontent.com", // URL for google profile pics
      "s3.eu-west-2.amazonaws.com", // PICK ONE (I THINK)F
      "t3-larry-bucket.s3.eu-west-2.amazonaws.com",
    ],
  },
});
