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
    async signIn({ user, account, profile, email, credentials }) {
      const discordAccountId = user.id;

      if (!discordAccountId) {
        return false;
      }

      return true;
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
