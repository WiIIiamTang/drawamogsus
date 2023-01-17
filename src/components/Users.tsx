import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type UserVotes = {
  [key: string]: number;
};

type UserScore = {
  name: string;
  score: number;
};

type Props = {
  socket: Socket;
  room: string;
  currentNickname: string;
  voting: boolean;
  setVoteFor: Dispatch<SetStateAction<string>>;
  userScores: Array<UserScore>;
  setUserScores: Dispatch<SetStateAction<Array<UserScore>>>;
  sendVote: boolean;
  votefor: string;
  setImposter: Dispatch<SetStateAction<string>>;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  setSendVote: Dispatch<SetStateAction<boolean>>;
  setUsersFooled: Dispatch<SetStateAction<number>>;
  role: string;
};

const Users = (props: Props) => {
  const [users, setUsers] = useState<string[]>([props.currentNickname]);
  useEffect(() => {
    props.socket.on("joined_room", (room: string, nickname: string) => {
      if (!users.includes(nickname)) {
        setUsers((users) => [...users, nickname]);
      }
    });

    props.socket.on("users_room_update", (newusers: string[]) => {
      setUsers((oldu) => [...newusers]);
    });

    props.socket.on("left_room", (room: string, nickname: string) => {
      setUsers((users) => users.filter((user) => user !== nickname));
    });

    props.socket.on("left_room_dc", (nickname: string) => {
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

  useEffect(() => {
    if (props.sendVote) {
      props.socket.emit(
        "send_vote",
        props.room,
        props.votefor,
        props.currentNickname,
        props.userScores,
        (scores: Array<UserScore>, imposter: string, users_fooled: number) => {
          props.setUserScores((prev) => [...scores]);
          props.setImposter(imposter);
          props.setShowResults(true);
          props.setUsersFooled(users_fooled);
        }
      );
      props.setSendVote(false);
    }
  }, [
    props,
    props.votefor,
    props.socket,
    props.room,
    props.userScores,
    props.currentNickname,
    props.setImposter,
    props.setUserScores,
    props.setShowResults,
  ]);

  return (
    <div className="bg-secondary px-4 rounded border border-slate-400 h-full overflow-auto">
      <h3 className="text-lg font-bold">
        Users{" "}
        {props.voting &&
          ` - ${
            props.role === "imposter" ? "Imposter can't vote" : "Vote here!"
          }`}
      </h3>

      <ul>
        {!props.voting
          ? users.map((user, i) => (
              <li key={i}>
                {user} [
                {props.userScores.find((u) => u.name === user)?.score || 0}]
              </li>
            ))
          : users.map((user, i) => (
              <li key={i}>
                <label className="label cursor-pointer">
                  <span className="label-text">{user}</span>
                  <input
                    type="radio"
                    className="radio radio-error"
                    name="vote-radio"
                    onChange={handleVoteChange}
                    value={user}
                    disabled={props.role === "imposter"}
                  />
                </label>
              </li>
            ))}
      </ul>
    </div>
  );
};

export default Users;
