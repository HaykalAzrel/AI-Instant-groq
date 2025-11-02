"use client";
import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import FileUpload from "@/components/FileUpload";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message && !file) return;
    const form = new FormData();
    form.append("message", message);
    if (file) form.append("file", file);

    setMessages((p) => [...p, { sender: "You", text: message }]);
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/chat", { method: "POST", body: form });
    const reader = res.body?.getReader();
    let aiResponse = "";
    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
        setMessages((p) => [...p.slice(0, -1), { sender: "AI", text: aiResponse }]);
      }
    } else {
      const data = await res.json();
      aiResponse = data.response;
      setMessages((p) => [...p, { sender: "AI", text: aiResponse }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 transition-all">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🧠 Groq AI Chat</h1>
          <ThemeToggle />
        </div>

        <div className="h-[420px] overflow-y-auto border dark:border-gray-700 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          {messages.map((m, i) => (
            <ChatMessage key={i} sender={m.sender} text={m.text} />
          ))}
          {loading && <p className="text-gray-500 italic">Thinking...</p>}
        </div>

        <FileUpload onSelect={setFile} />
        {file && <p className="text-sm text-gray-500 dark:text-gray-300">📄 {file.name}</p>}

        <div className="flex gap-2">
          <input
            className="flex-grow border dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message in English or Indonesian..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
