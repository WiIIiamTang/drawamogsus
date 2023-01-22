import type { FunctionComponent } from "react";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Game from "./_page";

const GameWrapper = async () => {
  const session = await unstable_getServerSession(authOptions);

  const username = session?.user?.name || "";

  return <Game username={username} />;
};

export default GameWrapper;
