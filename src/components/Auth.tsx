import { SignIn, SignOut } from "./AuthActions";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Image from "next/image";

async function Auth() {
  const session = await unstable_getServerSession(authOptions);

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
                />
              )}
              <span>
                <small>Signed in as </small>

                <strong>{session.user.name}</strong>
              </span>
            </div>
            <SignOut />
          </div>
        ) : (
          <>
            <SignIn />
          </>
        )}
      </div>
    </>
  );
}

export default Auth;
