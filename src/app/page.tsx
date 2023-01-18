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
          <div>
            <p className="py-6">stupid drawing party game</p>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link href="/game" className="btn btn-primary">
              <button>Play</button>
            </Link>
            <Link href="/howtoplay" className="btn btn-primary">
              <button>How to play</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
