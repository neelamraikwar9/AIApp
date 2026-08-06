import { useState } from "react";

export default function InputBox({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim(); //Trims whitespace off the input.
    if (!trimmed || disabled) return; //Guards against sending: empty/whitespace-only text, or when the component is disabled (likely true while a previous message is still streaming, so the user can't send a second message mid-reply).
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  }
  //This intercepts keypresses in the textarea. If the user presses Enter without Shift, it submits the form programmatically by calling handleSubmit. 

  return (
    <form className="input-box" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your query press Enter to send"
        rows={1}
        disabled={disabled}
      />
      <button
        type="submit"
        className="btn-send"
        disabled={disabled || !text.trim()}
      >
        Send
      </button>
    </form>
  );
}
