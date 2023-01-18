import { FunctionComponent } from "react";
import Link from "next/link";

interface InstructionsProps {}

const Instructions: FunctionComponent<InstructionsProps> = () => {
  return (
    <main className="hero min-h-screen bg-gradient-to-b from-neutral to-accent">
      <div className="hero-content text-center rounded-md">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4">How to play</h1>
          <h2 className="text-3xl font-bold mt-4 pt-4">Number of players</h2>
          <p className="py-2">
            Better played with at least 4-5 people. When using the fake word
            setting, 7+ players are recommended.
          </p>
          <h2 className="text-3xl font-bold mt-4">Gameplay</h2>
          <div className="py-2 overflow-y-auto">
            <p>
              The game starts out by distributing roles. There is one imposter
              which is randomly assigned, while the rest of the players are
              artists. The goal of the game is to guess who the imposter is,
              while collaboratively drawing a given word.
            </p>
            <br></br>
            <p>
              After each player receives their role, every artist will receive
              the word to draw. The imposter will <strong>not</strong> get to
              see what the word is. Do not say the word out loud!
            </p>
            <br></br>
            <p>
              Every player takes turns drawing the word. After a set amount of
              rounds, discuss and vote on who you think the imposter is! If
              you&apos;re an artist, it may help to draw the word in a way that
              makes it harder to guess (e.g., drawing a baguette for France
              instead of the Eiffel Tower). If you&apos;re the imposter, try to
              draw things that work on a variety of words if you can&apos;t
              guess the word early. Remember that the imposter doesn&apos;t have
              to guess the word to win, they just have to trick the others into
              not voting for them.
            </p>
            <br></br>
            <p>
              At the end of one game, artists gain 100 points if they voted for
              imposter, and 0 otherwise. Imposters gain 50 points for every
              artist they fooled.
            </p>
            <br></br>
            <p>
              Stay in the room after a game ends! You and your friends can
              decide on a set number of games to play. Scores will persist
              across games in a given room. You can customize your game settings
              to your liking. For example, turning on the &quot;fake word&quot;
              setting means that one artist will receive a fake word to draw.
              This means it will be much harder for the artists to win.
            </p>
          </div>
          <h2 className="text-3xl font-bold mt-4 pt-4">Other tips</h2>
          <p className="py-2">
            Although there is a chat feature, it&apos;s recommended to use
            something else to chat and discuss with your friends. You can use
            Discord, Zoom or even play in person. The whole point of the game is
            to try to deceive your friends.
          </p>
          <div className="flex flex-col gap-4 justify-center items-center mt-4">
            <Link href="/game" className="btn btn-primary w-fit">
              <button>Play</button>
            </Link>
            <Link href="/" className="btn btn-primary w-fit">
              <button>Back to home</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Instructions;
