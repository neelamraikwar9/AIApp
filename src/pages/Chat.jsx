import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { streamMessage } from "../api/chat.js";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import InputBox from "../components/InputBox.jsx";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingIndex, setStreamingIndex] = useState(null);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load the sidebar list once on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages whenever the active conversation changes
  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId]);

  async function loadConversations() {
    const { data } = await api.get("/chat/conversations");
    setConversations(data);
    if (!activeId && data.length > 0) setActiveId(data[0]._id);
  }

  async function loadMessages(conversationId) {
    const { data } = await api.get(
      `/chat/conversations/${conversationId}/messages`,
    );
    setMessages(data);
  }

  async function handleNewChat() {
    const { data } = await api.post("/chat/conversations", {
      title: "New entry",
    });
    setConversations((prev) => [data, ...prev]);
    setActiveId(data._id);
    setMessages([]);
    setSidebarOpen(false); // close drawer on mobile after creating a chat
  }

  function handleSelectConversation(id) {
    setActiveId(id);
    setSidebarOpen(false); // close drawer on mobile after picking a conversation
  }

  async function handleSend(text) {
    if (!activeId) return;

    // Optimistically show the user's message immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // Add an empty placeholder for the AI reply, and start streaming into it
    setMessages((prev) => {
      const next = [...prev, { role: "assistant", content: "" }];
      setStreamingIndex(next.length - 1);
      return next;
    });

    setSending(true);
    try {
      await streamMessage(activeId, text, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          updated[last] = {
            ...updated[last],
            content: updated[last].content + chunk,
          };
          return updated;
        });
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong reaching the AI. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreamingIndex(null);
      setSending(false);
    }
  }

  return (
    <div className={`chat-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* dims the screen and closes the drawer on tap, mobile only */}
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

      <main className="chat-main">
        {/* hamburger only visible on mobile via CSS */}
        <div className="mobile-topbar">
          <button
            className="btn-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open entries"
          >
            ☰
          </button>
        </div>

        {activeId ? (
          <>
            <ChatWindow messages={messages} streamingIndex={streamingIndex} />
            <InputBox onSend={handleSend} disabled={sending} />
          </>
        ) : (
          <div className="chat-window chat-window-empty">
            <p className="empty-mark">¶</p>
            <p>Create your first chat to begin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
