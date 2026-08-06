export default function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === "user";
  return (
    <div className={`message-row ${isUser ? "message-row-user" : "message-row-ai"}`}>
      <div className="message-margin">{isUser ? "You" : "Marginal"}</div>
      <div className={`message-bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
        {content} 
        {isStreaming && <span className="cursor-blink">▌</span>}
      </div>
    </div>
  );
}

//The outer wrapper gets a modifier class depending on who sent the message — this is almost certainly used in CSS to align user messages one way (e.g., right-aligned).

//A label showing who's speaking — "You" for the user, "Marginal" for the assistant.

// {content} is inserted as an escaped text node, so any </>/Markdown characters show up literally on screen instead of becoming real HTML/formatting — no react-markdown here.


//{isStreaming && <span>▌</span>} conditionally renders a block character right after the growing text, only on the one bubble matching streamingIndex; the actual blink comes from a cursor-blink CSS animation defined elsewhere (not in this file).