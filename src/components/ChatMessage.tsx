"use client";
import { motion } from "framer-motion";
import Markdown from "@/lib/markdown";

export default function ChatMessage({
  sender,
  text,
}: {
  sender: string;
  text: string;
}) {
  const isUser = sender === "You";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-2xl shadow ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"
        }`}
      >
        <strong>{sender}:</strong>
        <div className="mt-1">
          {isUser ? <p>{text}</p> : <Markdown content={text} />}
        </div>
      </div>
    </motion.div>
  );
}
