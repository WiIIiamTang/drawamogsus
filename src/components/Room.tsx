"use client";
import { Socket } from "socket.io-client";
import { FunctionComponent, useState, useEffect } from "react";
import { useDraw } from "../hooks/useDraw";
import { useSocketDraw } from "../hooks/useSocketDraw";
import dynamic from "next/dynamic";
import { ColorResult } from "@hello-pangea/color-picker";
import { io } from "socket.io-client";
import { drawLine } from "../lib/drawLine";
import { RefObject } from "react";
import Chat from "./Chat";
import Users from "./Users";

// react-color (this is a fork, react-color hasn't been updated since 2020)
const SketchPicker = dynamic(
  // https://stackoverflow.com/questions/61065113/next-js-react-color-warning-prop-style-did-not-match
  () => import("@hello-pangea/color-picker").then((mod) => mod.SketchPicker),
  { ssr: false }
);

type DrawLineEmitProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

type Props = {
  room: string;
  setRoomCode: (room: string) => void;
  setJoiningRoom: (joiningRoom: boolean) => void;
  setCreatingRoom: (creatingRoom: boolean) => void;
  setNickname: (nickname: string) => void;
  nickname: string;
  socket: Socket;
  timeBeforeStart: number;
  timeDraw: number;
  timeVote: number;
  rounds: number;
  userScoresWhenJoining?: Array<UserScore>;
  useSketchColors: boolean;
  setUseSketchColors: (useSketchColors: boolean) => void;
  useFakeWords: boolean;
  setUseFakeWords: (useFakeWords: boolean) => void;
};

type UserScore = {
  name: string;
  score: number;
};

const Room = (props: Props) => {
  const socket = props.socket;
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [numberGames, setNumberGames] = useState<number>(0);
  const [userScores, setUserScores] = useState<Array<UserScore>>([]);
  const [countdownCount, setCountdownCount] = useState<number>(0);
  const [countdownDraw, setCountdownDraw] = useState<number>(0);
  const [countdownVote, setCountdownVote] = useState<number>(0);
  const [currentDrawer, setCurrentDrawer] = useState<string>("");
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [sendVote, setSendVote] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [imposter, setImposter] = useState<string>("");
  const [voting, setVoting] = useState<boolean>(false);
  const [votefor, setVoteFor] = useState<string>("");
  const [word, setWord] = useState<string>("");
  const [publicWord, setPublicWord] = useState<string>("");
  const { canvasRef, onMouseDown, clear } = useDraw(createLine, isDrawing);
  const [color, setColor] = useState<string>("#000");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [abouttoStart, setAbouttoStart] = useState<boolean>(false);
  const [role, setRole] = useState<string>("");
  const [usersFooled, setUsersFooled] = useState<number>(0);
  const [canvasWidth, setCanvasWidth] = useState<number>(window.outerWidth / 2);
  const [canvasHeight, setCanvasHeight] = useState<number>(
    window.outerHeight / 2
  );
  const handleColorChangeComplete = (color: ColorResult) => setColor(color.hex);
  const timeBeforeStart = props.timeBeforeStart;
  const timeDraw = props.timeDraw;
  const timeVote = props.timeVote;
  const rounds = props.rounds;

  useEffect(() => {
    if (props.userScoresWhenJoining) {
      setUserScores(props.userScoresWhenJoining);
    }
  }, [props.userScoresWhenJoining]);

  useSocketDraw(canvasRef, socket, clear);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit(
      "draw_line",
      {
        prevPoint,
        currentPoint,
        color,
        canvasWidth: canvasRef.current?.width,
        canvasHeight: canvasRef.current?.height,
      },
      props.room
    );
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  function handleResizeCanvas(
    ref: RefObject<HTMLCanvasElement>,
    canvasHeight: number,
    canvasWidth: number
  ) {
    if (!ref.current) return;

    ref.current.width = canvasWidth;
    ref.current.height = canvasHeight;
  }

  // this is used to resize the canvas at load
  useEffect(() => {
    handleResizeCanvas(canvasRef, canvasHeight + 100, canvasWidth); // TODO: +100 is a stupid temporary fix

    // window.addEventListener("resize", () => {
    //   setCanvasWidth(window.outerWidth / 2);
    //   setCanvasHeight(window.outerHeight / 2);
    // });

    // return () => {
    //   window.removeEventListener("resize", () => {
    //     setCanvasWidth(window.outerWidth / 2);
    //     setCanvasHeight(window.outerHeight / 2);
    //   });
    // };
  }, [canvasRef, canvasHeight, canvasWidth]);

  useEffect(() => {
    // this hook handles socket game logic
    socket.on(
      "assign_role",
      (role: string, firstdraw: boolean, word: string, drawer: string) => {
        setCountdownCount(timeBeforeStart);
        setAbouttoStart(true);
        setPublicWord("");

        setTimeout(() => {
          setCurrentRound(0);
          setAbouttoStart(false);
          setGameStarted(true);
          setRole(role);
          setIsDrawing(firstdraw);
          if (word) setWord(word);
          if (drawer) {
            setCurrentDrawer(drawer);
            setCountdownDraw(timeDraw);
          }
        }, timeBeforeStart * 1000);
      }
    );

    socket.on("game_end", () => {
      setCurrentRound(2);
      setCountdownVote(timeVote);
      setVoting(true);

      setTimeout(() => {
        setSendVote(true);
        setVoting(false);
        setGameStarted(false);
        setAbouttoStart(false);
        setCountdownCount(0);
        setCountdownDraw(0);
        setWord("");
        // setRole("");
        setCurrentDrawer("");
        //setVoteFor("");
        setIsDrawing(false);
        setCurrentRound(3);
      }, timeVote * 1000);
    });

    socket.on("new_drawer", (drawer: string, round: number) => {
      if (drawer === props.nickname) {
        setIsDrawing(true);
        setCountdownDraw(timeDraw);
      } else {
        setIsDrawing(false);
      }
      setCurrentDrawer(drawer);

      if (round !== currentRound) {
        setCurrentRound(round);
      }
    });

    socket.on("show_public_word", (word: string) => {
      setPublicWord(word);
    });

    return () => {
      socket.off("assign_role");
      socket.off("game_end");
      socket.off("new_drawer");
      socket.off("show_public_word");
    };
  }, [
    socket,
    props.nickname,
    currentRound,
    timeBeforeStart,
    timeDraw,
    timeVote,
  ]);

  useEffect(() => {
    // coutdown timer
    if (abouttoStart) {
      const interval = setInterval(() => {
        setCountdownCount((countdownCount) => countdownCount - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [abouttoStart, countdownCount]);

  useEffect(() => {
    // vote countdown timer
    if (voting) {
      const interval = setInterval(() => {
        setCountdownVote((countdownVote) => countdownVote - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [voting, countdownVote]);

  useEffect(() => {
    // countdown draw timer
    if (isDrawing) {
      const interval = setInterval(() => {
        setCountdownDraw((countdownDraw) => countdownDraw - 1);
        if (countdownDraw === 0) {
          setIsDrawing(false);
          socket.emit(
            "done_drawing",
            props.room,
            props.nickname,
            word,
            currentRound,
            (shouldDrawNext: boolean, round: number) => {
              if (round !== currentRound) {
                setCurrentRound(round);
              }

              if (shouldDrawNext) {
                setCountdownDraw(timeDraw);
                setIsDrawing(true);
              } else {
                setCountdownDraw(0);
                setIsDrawing(false);
              }
            }
          );
          return () => clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isDrawing,
    countdownDraw,
    props.nickname,
    props.room,
    socket,
    word,
    currentRound,
    timeDraw,
  ]);

  const handleClickGameStart = () => {
    setShowResults(false);
    setImposter("");
    setSendVote(false);
    setCurrentRound(0);
    setVoteFor("");
    setPublicWord("");
    socket.emit("clear", props.room);
    socket.emit("game_start", props.room, props.nickname);
  };

  return (
    <div>
      <div className="h-full w-full flex flex-col bg-transparent justify-center items-center gap-2">
        <div>
          {gameStarted ? (
            <div className="flex flex-col justify-center items-center gap-4">
              <span>
                Game has started! Your role is: {role}.{" "}
                {word && <span> The word is: {word}</span>}{" "}
              </span>
              <span
                className={`font-bold text-lg ${
                  isDrawing && "text-indigo-600 animate-bounce"
                }`}
              >
                {isDrawing && !voting
                  ? `You are drawing. Time left: ${countdownDraw}`
                  : !voting && `${currentDrawer} is drawing.`}

                {voting &&
                  `Vote for who you think the imposter is. Time left: ${countdownVote}`}
              </span>
            </div>
          ) : abouttoStart ? (
            <div className="animate-bounce">
              Game is about to start, please wait... {countdownCount}
            </div>
          ) : showResults ? (
            <div className="flex flex-col justify-center items-center gap-4">
              <span>
                The imposter was {imposter}!{" "}
                {role !== "imposter"
                  ? imposter === votefor
                    ? `You guessed correctly! The word was ${publicWord}.`
                    : `You didn't guess correctly. The word was ${publicWord}.`
                  : `You fooled ${usersFooled} people! The word was ${publicWord}.`}
              </span>
            </div>
          ) : (
            <div>Game has not started yet</div>
          )}
        </div>
        <h1 className="font-bold text-xl text-slate-800">
          {props.nickname}{" "}
          <span className="ml-4 text-md font-light">{props.room}</span>
          <label
            onClick={() => {
              navigator.clipboard.writeText(props.room);
            }}
            className="btn btn-circle swap swap-rotate bg-transparent border-0 hover:bg-transparent"
          >
            <input type="checkbox" />

            <svg
              className="swap-off fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 115.77 122.88"
            >
              <path d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z" />
            </svg>

            <svg
              className="swap-on fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 122.88 122.88"
            >
              <path
                xmlns="http://www.w3.org/2000/svg"
                d="M34.388,67.984c-0.286-0.308-0.542-0.638-0.762-0.981c-0.221-0.345-0.414-0.714-0.573-1.097 c-0.531-1.265-0.675-2.631-0.451-3.934c0.224-1.294,0.812-2.531,1.744-3.548l0.34-0.35c2.293-2.185,5.771-2.592,8.499-0.951 c0.39,0.233,0.762,0.51,1.109,0.827l0.034,0.031c1.931,1.852,5.198,4.881,7.343,6.79l1.841,1.651l22.532-23.635 c0.317-0.327,0.666-0.62,1.035-0.876c0.378-0.261,0.775-0.482,1.185-0.661c0.414-0.181,0.852-0.323,1.3-0.421 c0.447-0.099,0.903-0.155,1.356-0.165h0.026c0.451-0.005,0.893,0.027,1.341,0.103c0.437,0.074,0.876,0.193,1.333,0.369 c0.421,0.161,0.825,0.363,1.207,0.604c0.365,0.231,0.721,0.506,1.056,0.822l0.162,0.147c0.316,0.313,0.601,0.653,0.85,1.014 c0.256,0.369,0.475,0.766,0.652,1.178c0.183,0.414,0.325,0.852,0.424,1.299c0.1,0.439,0.154,0.895,0.165,1.36v0.23 c-0.004,0.399-0.042,0.804-0.114,1.204c-0.079,0.435-0.198,0.863-0.356,1.271c-0.16,0.418-0.365,0.825-0.607,1.21 c-0.238,0.377-0.518,0.739-0.832,1.07l-27.219,28.56c-0.32,0.342-0.663,0.642-1.022,0.898c-0.369,0.264-0.767,0.491-1.183,0.681 c-0.417,0.188-0.851,0.337-1.288,0.44c-0.435,0.104-0.889,0.166-1.35,0.187l-0.125,0.003c-0.423,0.009-0.84-0.016-1.241-0.078 l-0.102-0.02c-0.415-0.07-0.819-0.174-1.205-0.31c-0.421-0.15-0.833-0.343-1.226-0.575l-0.063-0.04 c-0.371-0.224-0.717-0.477-1.032-0.754l-0.063-0.06c-1.58-1.466-3.297-2.958-5.033-4.466c-3.007-2.613-7.178-6.382-9.678-9.02 L34.388,67.984L34.388,67.984z M61.44,0c16.96,0,32.328,6.883,43.453,17.987c11.104,11.125,17.986,26.493,17.986,43.453 c0,16.961-6.883,32.329-17.986,43.454C93.769,115.998,78.4,122.88,61.44,122.88c-16.961,0-32.329-6.882-43.454-17.986 C6.882,93.769,0,78.4,0,61.439C0,44.48,6.882,29.112,17.986,17.987C29.112,6.883,44.479,0,61.44,0L61.44,0z M96.899,25.981 C87.826,16.907,75.29,11.296,61.44,11.296c-13.851,0-26.387,5.611-35.46,14.685c-9.073,9.073-14.684,21.609-14.684,35.458 c0,13.851,5.611,26.387,14.684,35.46s21.609,14.685,35.46,14.685c13.85,0,26.386-5.611,35.459-14.685s14.684-21.609,14.684-35.46 C111.583,47.59,105.973,35.054,96.899,25.981L96.899,25.981z"
              />
            </svg>
          </label>
        </h1>

        <div className="flex flex-row flex-wrap gap-2 justify-center w-full">
          <div className="flex flex-col gap-2">
            {props.useSketchColors && (
              <SketchPicker
                color={color}
                onChangeComplete={handleColorChangeComplete}
                disableAlpha={true}
              />
            )}

            {/* <button
              type="button"
              className="btn mt-8"
              onClick={() => socket.emit("clear", props.room)}
            >
              Clear
            </button> */}

            <button
              type="button"
              className="btn"
              onClick={() => {
                props.setJoiningRoom(false);
                props.setCreatingRoom(false);
                props.setRoomCode("");
                props.setNickname(props.nickname);
                props.setUseSketchColors(true);
                props.setUseFakeWords(false);
                socket.emit("leave_room", props.room, props.nickname);
              }}
            >
              Quit Room
            </button>

            {!abouttoStart && !gameStarted && (
              <button
                type="button"
                className="btn"
                onClick={handleClickGameStart}
              >
                Start Game
              </button>
            )}
          </div>

          <canvas
            onMouseDown={onMouseDown}
            ref={canvasRef}
            id="roomCanvas"
            className="border border-slate-600 rounded-md bg-white shadow-lg"
          />

          <div id="users-and-chat" className="flex flex-col h-full">
            <div className="h-1/5 w-full">
              <Users
                socket={socket}
                room={props.room}
                currentNickname={props.nickname}
                voting={voting}
                setVoteFor={setVoteFor}
                userScores={userScores}
                setUserScores={setUserScores}
                setImposter={setImposter}
                setShowResults={setShowResults}
                sendVote={sendVote}
                votefor={votefor}
                setSendVote={setSendVote}
                role={role}
                setUsersFooled={setUsersFooled}
              />
            </div>
            <div className="h-3/5 w-full">
              <Chat
                socket={socket}
                room={props.room}
                currentNickname={props.nickname}
              />
            </div>
            <div className="h-1/5 max-w-xs flex flex-col justify-end">
              <ul className="steps text-sm font-light">
                {Array(rounds)
                  .fill(0)
                  .map((_, i) => {
                    if (i === 0) {
                      return (
                        <li
                          key={i}
                          className={`step ${
                            currentRound >= i &&
                            (gameStarted || showResults) &&
                            "step-accent"
                          }`}
                        >
                          {rounds < 4 && `Round${i + 1}`}
                        </li>
                      );
                    }
                    return (
                      <li
                        key={i}
                        className={`step ${currentRound >= i && "step-accent"}`}
                      >
                        {rounds < 4 && `Round${i + 1}`}
                      </li>
                    );
                  })}
                <li className={`step ${currentRound >= 2 && "step-accent"}`}>
                  {rounds < 4 && `Vote`}
                </li>
                <li className={`step ${currentRound >= 3 && "step-accent"}`}>
                  {rounds < 4 && `Results`}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
