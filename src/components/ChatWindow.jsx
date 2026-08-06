import { useEffect, useRef } from "react"; // useRef to hold a mutable reference to a DOM node
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({ messages, streamingIndex }) {
  //an array of message objects (each with at least role and content).
  //streamingIndex — the index of the message currently being streamed in (i.e., the AI reply that's still being typed out live).

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  //bottomRef is attached to an empty <div> placed after all the messages (see below). Every time messages changes — i.e., a new message is added, or the array reference updates as a streaming reply grows — this effect fires and smoothly scrolls that invisible bottom div into view. This is the classic "auto-scroll to newest message" pattern for chat UIs.

  if (messages.length === 0) {
    return (
      <div className="chat-window chat-window-empty">
        <p className="empty-mark">¶</p>
        <p>This entry is blank. Write the first line below.</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((m, i) => (
        <MessageBubble
          key={i}
          role={m.role}
          content={m.content}
          isStreaming={i === streamingIndex} //only for the one message currently being streamed (matched by index), letting MessageBubble show a typing cursor/animation for just that bubble.
        />
      ))}
      <div ref={bottomRef} /> 
    </div>
  );
}

//acts as a scroll anchor/target for the auto-scroll effect above.