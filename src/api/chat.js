const BASE_URL = "https://ai-eng-app-ap-is.vercel.app/api";

//6: 45

/**
 * Sends a message to the backend and reads the AI's reply as it streams in.
 * onChunk(text) is called for every small piece of text as it arrives.
 * Returns the full assembled reply once the stream ends.
 */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
export async function streamMessage(conversationId, content, onChunk) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
  }); //standard jwt style auth It post the conv.Id and Cont. and expect server to respond with a streaming body that's why it reads res.body rather than calling res.json().

  if (!res.ok || !res.body) {
    throw new Error("Failed to reach the chat endpoint");
  }

  const reader = res.body.getReader(); //res.body is a Readable Stream raw bytes. getReader() lets you pull chunks of bytes manually.
  const decoder = new TextDecoder(); //TextDecoder converts those bytes into text (handling multi-byte UTF-8 characters split across chunks correctly, thanks to { stream: true }).
  let buffer = ""; //holds text that's arrived but hasn't yet formed a complete "event."
  let fullReply = ""; //accumulates the complete AI response across all chunks.

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    //This repeatedly pulls the next available piece of bytes from the network. done becomes true when the server closes the stream.

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n"); //Splits on \n\n to get all complete events.
    buffer = events.pop(); //Pops off the last entry and keeps it in buffer — because it might be an incomplete event still waiting for more data. ==//// keep any incomplete event for the next loop
   // it is key parsing trick. Backend is sending SSE style msg. where each "event" is separated by a blank line (\n\n).

    for (const rawEvent of events) {
      if (!rawEvent.startsWith("data: ")) continue;
      const payload = JSON.parse(rawEvent.replace("data: ", ""));
      //Each complete event is expected to look like data: {...json...}. Non-data: lines (e.g., SSE comments or event: lines) are skipped. The JSON payload is then parsed.

      if (payload.chunk) {
        fullReply += payload.chunk;
        onChunk(payload.chunk);
      }
      //If the payload has a chunk field, that's a piece of the AI's text — it's appended to the running total and passed to the onChunk callback so the UI can render it incrementally (e.g., "typing" effect).

      if (payload.error) {
        throw new Error(payload.error);
      } //If the server signals an error mid-stream, it throws immediately.
      
      if (payload.done) {
        return fullReply;
      }
      //If the server signals it's finished, the function returns the fully assembled reply right away — even if the underlying stream hasn't technically closed yet.
    }
  }

  return fullReply;
}
