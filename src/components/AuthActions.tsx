"use client";
import { signIn, signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button onClick={() => signOut()} className="text-sm">
      Sign out
    </button>
  );
}

export function SignIn() {
  return <button onClick={() => signIn("discord")}>Sign in</button>;
}
