import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type Props = {
  socket: Socket;
  room: string;
  currentNickname: string;
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

  return (
    <div className="bg-secondary px-4 rounded border border-slate-400 h-full overflow-auto">
      <h3 className="text-lg font-bold">Users</h3>

      <ul>
        {users.map((user, i) => (
          <li key={i}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
