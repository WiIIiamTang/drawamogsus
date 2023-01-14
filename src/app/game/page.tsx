"use client";

import { FunctionComponent, useRef, useState, useEffect } from "react";
import Link from "next/link";
import useAlertTimeout from "@/hooks/useAlertTimeout";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Room from "../../components/Room";

const socket = io(
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
);

interface GameProps {}

const Game: FunctionComponent<GameProps> = () => {
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [canEnterRoom, setCanEnterRoom] = useState(false);
  const { invalidCode, setInvalidCode } = useAlertTimeout({ timeout: 2000 });
  const roomRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleClickJoin = () => {
    setJoiningRoom(!joiningRoom);
  };

  const handleClickGo = () => {
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
      function (success: boolean) {
        if (!roomRef.current || !nicknameRef.current) {
          return;
        }

        if (!success) {
          setInvalidCode(true);
          return;
        }

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
      function (success: boolean) {
        if (!success) {
          setInvalidCode(true);
          return;
        }
        setRoomCode(code);
      }
    );
  };

  return (
    <div className="bg-primary h-screen w-screen flex justify-center">
      {roomCode ? (
        <Room
          room={roomCode}
          setRoomCode={setRoomCode}
          setJoiningRoom={setJoiningRoom}
          setNickname={setNickname}
          nickname={nickname}
          socket={socket}
        />
      ) : (
        <div className="w-1/2 h-full flex flex-col justify-center items-center gap-5">
          <input
            type="text"
            placeholder="Nickname"
            className="input w-full max-w-xs"
            ref={nicknameRef}
            defaultValue={nickname}
          />

          <button className="btn w-full" onClick={handleClickCreate}>
            <p>Create a game</p>
          </button>

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
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Room code"
                  className="input w-full ml-2"
                  ref={roomRef}
                />
                <button className="btn btn-success" onClick={handleClickGo}>
                  Go
                </button>
              </div>
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
              <span>Invalid code and/or nickname.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
