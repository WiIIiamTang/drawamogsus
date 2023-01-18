"use client";

import React, {
  FunctionComponent,
  useRef,
  useState,
  useEffect,
  MouseEventHandler,
} from "react";
import Link from "next/link";
import useAlertTimeout from "@/hooks/useAlertTimeout";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Room from "../../components/Room";

const socket = io(
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
);

interface GameProps {}

type UserScore = {
  name: string;
  score: number;
};

const Game: FunctionComponent<GameProps> = () => {
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [canEnterRoom, setCanEnterRoom] = useState(false);
  const [userScoresWhenJoining, setUserScoresWhenJoining] = useState<
    Array<UserScore>
  >([]);
  const [timeStart, setTimeStart] = useState(5);
  const [timeVote, setTimeVote] = useState(10);
  const [timeDraw, setTimeDraw] = useState(8);
  const [numberRounds, setNumberRounds] = useState(2);
  const { invalidCode, setInvalidCode } = useAlertTimeout({
    timeout: 2000,
    setErrorMessage,
  });
  const [useColors, setUseColors] = useState(true);
  const [useFakeWords, setUseFakeWords] = useState(false);
  const roomRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const timeStartRef = useRef<HTMLInputElement>(null);
  const timeVoteRef = useRef<HTMLInputElement>(null);
  const timeDrawRef = useRef<HTMLInputElement>(null);
  const numberRoundsRef = useRef<HTMLInputElement>(null);
  const wordCategoryRef = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  const handleClickJoin = () => {
    setJoiningRoom(!joiningRoom);
  };

  const handleClickGo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!roomRef.current || !nicknameRef.current) {
      return;
    }

    if (!roomRef.current.value || !nicknameRef.current.value) {
      setInvalidCode(true);
      return;
    }

    socket.emit(
      "join_room",
      roomRef.current.value,
      nicknameRef.current.value,
      function (
        success: boolean,
        takenNickname: boolean,
        timeToStart: number,
        timeToDraw: number,
        timeToVote: number,
        rounds: number,
        userScores: Array<UserScore>
      ) {
        if (!roomRef.current || !nicknameRef.current) {
          return;
        }

        if (takenNickname) {
          setErrorMessage("Nickname already taken");
          setInvalidCode(true);
          return;
        }

        if (!success) {
          setInvalidCode(true);
          return;
        }

        setTimeStart(timeToStart);
        setTimeDraw(timeToDraw);
        setTimeVote(timeToVote);
        setNumberRounds(rounds);
        setUserScoresWhenJoining(userScores);

        setRoomCode(roomRef.current.value);
        setNickname(nicknameRef.current.value);

        socket.emit("room_user_update", roomRef.current.value);
      }
    );
  };

  const handleClickCreate = () => {
    if (!nicknameRef.current) {
      return;
    }

    if (!nicknameRef.current.value) {
      setInvalidCode(true);
      return;
    }

    setNickname(nicknameRef.current.value);
    // generate random room code
    const code = Math.random().toString(36).substring(3);
    socket.emit(
      "create_room",
      code,
      nicknameRef.current.value,
      numberRounds,
      timeDraw,
      timeStart,
      timeVote,
      wordCategoryRef.current?.value || "animal",
      useFakeWords,
      function (success: boolean) {
        if (!success) {
          setInvalidCode(true);
          return;
        }
        setRoomCode(code);
      }
    );
  };

  const handleClickCreateSetup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleClickCreate();
  };

  return (
    <div className="bg-primary h-screen w-screen flex justify-center">
      {roomCode ? (
        <Room
          room={roomCode}
          setRoomCode={setRoomCode}
          setJoiningRoom={setJoiningRoom}
          setNickname={setNickname}
          setCreatingRoom={setCreatingRoom}
          nickname={nickname}
          socket={socket}
          timeBeforeStart={timeStart}
          timeDraw={timeDraw}
          timeVote={timeVote}
          rounds={numberRounds}
          userScoresWhenJoining={userScoresWhenJoining}
          useSketchColors={useColors}
          setUseSketchColors={setUseColors}
          useFakeWords={useFakeWords}
          setUseFakeWords={setUseFakeWords}
        />
      ) : (
        <div className="w-full flex justify-center items-center overflow-hidden">
          <div className="w-1/2 h-full flex flex-col justify-center items-center gap-5">
            <input
              type="text"
              placeholder="Nickname"
              className="input w-full max-w-xs"
              ref={nicknameRef}
              defaultValue={nickname}
            />

            <div className="flex justify-center items-center w-full">
              <label
                className={`${
                  creatingRoom ? "btn-error w-14" : "w-full"
                } swap btn transition-all duration-500 ease-in-out px-8`}
              >
                <input
                  type="checkbox"
                  className="select-none cursor-pointer hidden"
                  onClick={() => setCreatingRoom(!creatingRoom)}
                />
                <div className="swap-on select-none cursor-pointer">Cancel</div>
                <div className="swap-off select-none cursor-pointer">
                  Create a game
                </div>
              </label>
            </div>

            <div
              tabIndex={0}
              className={`transition-all duration-500 ease-in-out ${
                creatingRoom ? "h-[45%] md:h-[40%] 2xl:h-[30%]" : "h-0"
              }`}
              style={{
                width: creatingRoom ? "100%" : "0",
                opacity: creatingRoom ? 1 : 0,
              }}
            >
              <form className="flex flex-col justify-center items-center transition-all duration-500 ease-in-out">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      onChange={(e) => setTimeStart(Number(e.target.value))}
                      value={timeStart}
                      className="range w-full range-secondary"
                    />
                    <span className="text-xs font-extralight w-full">
                      Time before start: {timeStart}
                    </span>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      onChange={(e) => setTimeDraw(Number(e.target.value))}
                      value={timeDraw}
                      className="range w-full range-secondary"
                    />
                    <span className="text-xs font-extralight w-full">
                      Time to draw: {timeDraw}
                    </span>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      onChange={(e) => setTimeVote(Number(e.target.value))}
                      value={timeVote}
                      className="range w-full range-secondary"
                    />
                    <span className="text-xs font-extralight w-full">
                      Time to vote: {timeVote}
                    </span>
                  </div>
                  <div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      onChange={(e) => setNumberRounds(Number(e.target.value))}
                      value={numberRounds}
                      className="range w-full range-secondary"
                    />
                    <span className="text-xs font-extralight w-full">
                      Rounds before vote: {numberRounds}
                    </span>
                  </div>
                  <div>
                    <select
                      className="select select-secondary w-full max-w-xs select-sm"
                      ref={wordCategoryRef}
                    >
                      <option value="" disabled selected>
                        Word Category
                      </option>
                      <option value="animal">animal</option>
                      <option value="anatomy">anatomy</option>
                      <option value="clothing">clothing</option>
                      <option value="country">country</option>
                      <option value="family">family</option>
                      <option value="food">food</option>
                      <option value="instrument">instrument</option>
                      <option value="mythology">mythology</option>
                      <option value="pop culture">pop culture</option>
                      <option value="profession">profession</option>
                      <option value="sports">sports</option>
                      <option value="vehicle">vehicle</option>
                      <option value="weapon">weapon</option>
                    </select>
                  </div>
                  <div className="w-full flex flex-row">
                    <div className="form-control w-1/2">
                      <label className="cursor-pointer label">
                        <span className="label-text text-xs">Colors</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-secondary"
                          defaultChecked
                          onLoad={() => setUseColors(true)}
                          onChange={(e) => setUseColors(e.target.checked)}
                          checked={useColors}
                        />
                      </label>
                    </div>
                    <div className="form-control w-1/2">
                      <label className="cursor-pointer label">
                        <span className="label-text text-xs">Fake word</span>
                        <input
                          type="checkbox"
                          className="toggle toggle-secondary"
                          onLoad={() => setUseFakeWords(false)}
                          onChange={(e) => setUseFakeWords(e.target.checked)}
                          checked={useFakeWords}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-success mt-4"
                  onClick={handleClickCreateSetup}
                >
                  Go
                </button>
              </form>
            </div>

            <div className="flex justify-center items-center w-full">
              <label
                className={`${
                  joiningRoom ? "btn-error w-14" : "w-full"
                } swap btn transition-all duration-500 ease-in-out px-8`}
              >
                <input
                  type="checkbox"
                  className="select-none cursor-pointer hidden"
                  onClick={handleClickJoin}
                />
                <div className="swap-on select-none cursor-pointer">Cancel</div>
                <div className="swap-off select-none cursor-pointer">
                  Join a game
                </div>
              </label>

              <div
                tabIndex={0}
                className="bg-transparent flex justify-center text-primary-content transition-all duration-500 ease-in-out"
                style={{
                  width: joiningRoom ? "100%" : "0",
                  height: joiningRoom ? "100%" : "0",
                  opacity: joiningRoom ? 1 : 0,
                }}
              >
                <form className="input-group">
                  <input
                    type="text"
                    placeholder="Room code"
                    className="input w-full ml-2"
                    ref={roomRef}
                  />
                  <button
                    type="submit"
                    className="btn btn-success"
                    onClick={handleClickGo}
                  >
                    Go
                  </button>
                </form>
              </div>
            </div>

            <Link href="/" className="xl:mt-24 mt-10 w-full">
              <button className="btn w-full">Back to Home</button>
            </Link>

            <div
              className={`alert alert-error shadow-lg absolute bottom-12 w-1/2 ${
                invalidCode ? "opacity-100" : "opacity-0"
              } transition-all duration-500 ease-linear`}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errorMessage ? (
                  <span>{errorMessage}</span>
                ) : (
                  <span>Invalid code and/or nickname.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
