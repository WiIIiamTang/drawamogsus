"use client"; // next13 specific issue.

import { FunctionComponent } from "react";
import Link from "next/link";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  return (
    <main className="hero min-h-screen bg-gradient-to-b from-neutral to-primary">
      <div className="hero-content text-center rounded-md">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">drawamogsus</h1>
          <p className="py-6">stupid drawing party game</p>
          <Link href="/game">
            <button className="btn btn-primary">Play</button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
