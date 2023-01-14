import { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";

type Props = {
  socket: Socket;
  room: string;
  currentNickname: string;
};

type UserMessage = {
  message: string;
  name: string;
};

const Chat = (props: Props) => {
  // messages from oldest to newest
  const [messages, setMessages] = useState<Array<UserMessage>>([
    { message: "test1", name: "bob" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onFormMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // get input value
    const input = e.currentTarget[0] as HTMLInputElement;
    const message = input.value;
    console.log(message);

    // add to messages
    setMessages((messages) => [
      ...messages,
      { message, name: props.currentNickname },
    ]);

    // emit
    props.socket.emit("chat_room", props.room, message, props.currentNickname);

    // clear input
    input.value = "";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    props.socket.on("chat_room", (message: string, name: string) => {
      const m = {
        message: message,
        name: name,
      };
      setMessages((messages) => [...messages, m]);
    });

    return () => {
      props.socket.off("chat_room");
    };
  }, [messages, props.socket]);

  return (
    <div className="rounded border border-slate-400 bg-secondary flex flex-col">
      <h3 className="px-4 h-1/12 text-lg font-bold">Chat</h3>
      <div className="h-56 max-h-full w-full border-black mt-auto overflow-y-auto overflow-x-hidden flex flex-col min-w-0 break-all min-h-0">
        {messages.map((message, i) => (
          <div
            className={`chat ${
              message.name === props.currentNickname ? "chat-end" : "chat-start"
            }`}
            key={i}
          >
            <div className="chat-header">{message.name}</div>
            <div className="chat-bubble chat-bubble-accent text-sm font-light mb-0 pb-0 break-all w-56">
              {message.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full">
        <div className="form-control w-full">
          <div className="input-group w-full">
            <form onSubmit={onFormMessageSubmit} className="w-full">
              <input
                type="text"
                placeholder="Send a message..."
                className="input bg-transparent focus:outline-none w-10/12"
              />
              <button
                type="submit"
                className="btn btn-square bg-transparent border-0 hover:bg-transparent w-2/12"
              >
                <svg
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
