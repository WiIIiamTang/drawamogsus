import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    // pass the discord user to session through jwt
    jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          ...user,
        };
      }
      return token;
    },
  },
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
};

export default NextAuth(authOptions);
