import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db";
import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    // update the user's profile picture, if its new
    async signIn({ user, account, profile, email, credentials }) {
      //@ts-ignore
      const possiblyNewImage = profile.image_url;
      const currentImage = user.image;

      if (possiblyNewImage !== currentImage) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: possiblyNewImage },
        });
        return true;
      }
      return true;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID as string,
      clientSecret: env.DISCORD_CLIENT_SECRET as string,
    }),

    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
