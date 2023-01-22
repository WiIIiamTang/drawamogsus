import type { FunctionComponent } from "react";
import Game from "./_page";

interface GameWrapperProps {}

const GameWrapper: FunctionComponent<GameWrapperProps> = () => {
  return <Game />;
};

export default GameWrapper;
