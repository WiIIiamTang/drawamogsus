import { SignIn, SignOut } from "./AuthActions";
import Image from "next/image";
import type { Session } from "next-auth/core/types";

type AuthProps = {
  session?: Session | null;
  connected?: boolean | undefined;
};

function Auth({ session }: AuthProps) {
  return (
    <>
      <div className="absolute top-0">
        {session?.user ? (
          <div className="mx-2 my-2">
            <div className="flex flex-row flex-wrap gap-2 justify-center items-center">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt="User Image"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col justify-center items-start">
                <span>
                  <span className="text-sm">Signed in as </span>

                  <strong>{session.user.name}</strong>
                </span>
                <SignOut />
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-2 my-2">
            <SignIn />
          </div>
        )}
      </div>
    </>
  );
}

export default Auth;
