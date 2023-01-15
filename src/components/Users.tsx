import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type UserVotes = {
  [key: string]: number;
};

type Props = {
  socket: Socket;
  room: string;
  currentNickname: string;
  voting: boolean;
  setVoteFor: Dispatch<SetStateAction<string>>;
};

const Users = (props: Props) => {
  const [users, setUsers] = useState<string[]>([props.currentNickname]);
  useEffect(() => {
    props.socket.on("joined_room", (room: string, nickname: string) => {
      console.log("joined room", room, nickname);
      if (!users.includes(nickname)) {
        setUsers((users) => [...users, nickname]);
      }
    });

    props.socket.on("users_room_update", (newusers: string[]) => {
      console.log("users room update", newusers);
      setUsers((oldu) => [...newusers]);
    });

    props.socket.on("left_room", (room: string, nickname: string) => {
      console.log("left room", room, nickname);
      setUsers((users) => users.filter((user) => user !== nickname));
    });

    props.socket.on("left_room_dc", (nickname: string) => {
      console.log("left room dc", nickname);
      setUsers((users) => users.filter((user) => user !== nickname));
    });

    return () => {
      props.socket.off("joined_room");
      props.socket.off("left_room");
      props.socket.off("left_room_dc");
    };
  }, [props.socket, users]);

  const handleVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.setVoteFor(e.target.value);
  };

  return (
    <div className="bg-secondary px-4 rounded border border-slate-400 h-full overflow-auto">
      <h3 className="text-lg font-bold">
        Users {props.voting && " - Vote here!"}
      </h3>

      <ul>
        {!props.voting
          ? users.map((user, i) => <li key={i}>{user}</li>)
          : users.map((user, i) => (
              <li key={i}>
                <label className="label cursor-pointer">
                  <span className="label-text">{user}</span>
                  <input
                    type="radio"
                    className="radio radio-error"
                    name="vote-radio"
                    onChange={handleVoteChange}
                    value={props.socket.id}
                  />
                </label>
              </li>
            ))}
      </ul>
    </div>
  );
};

export default Users;
