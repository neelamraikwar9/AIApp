# Marginal — AI Chat 

A React (Vite) frontend for your MERN AI chat app, styled as a writing journal.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** by default.

Make sure your backend is running on **http://localhost:8000** — that's the
base URL hardcoded in:
- `src/api/axios.js`
- `src/api/chat.js`

If your backend runs on a different port, update `BASE_URL` in both files.

## Structure

```
src/
├── api/
│   ├── axios.js       # axios instance, auto-attaches JWT to every request
│   └── chat.js         # streamMessage() — reads the SSE stream from /chat/messages
├── context/
│   └── AuthContext.jsx # login/register/logout state, shared app-wide
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Chat.jsx         # main chat page: sidebar + conversation + input
├── components/
│   ├── Sidebar.jsx      # conversation list ("Entries")
│   ├── ChatWindow.jsx   # scrollable message list
│   ├── MessageBubble.jsx
│   └── InputBox.jsx
├── App.jsx              # routes + protected route wrapper
├── main.jsx              # entry point
└── index.css             # all styling
```

## How the AI streaming connects to your backend

`src/api/chat.js` calls `POST /api/chat/messages` on your Node backend using
raw `fetch` (not axios), because the response is a Server-Sent Events (SSE)
stream, not a single JSON object. It reads the response body chunk by chunk
and calls `onChunk(text)` for every piece of text as it arrives — that's what
creates the "typing" effect in `Chat.jsx`.

Your backend is the only thing that talks to OpenRouter/Claude directly — the
API key never touches the frontend.

