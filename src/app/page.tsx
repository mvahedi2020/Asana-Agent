"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant" | "agent";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Hey! I'm your Asana AI agent. I can read your tasks, prioritize them, surface blockers, and take actions on your behalf. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const newMessages = [...messages, { role: "user", content: text } as Message];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === "agent" ? "assistant" : m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      const reply = data.content?.find((b: any) => b.type === "text")?.text || "No response.";
      
      setMessages([...newMessages, { role: "agent", content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "agent", content: "Error reaching the agent. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "agent",
        content: "Hey! I'm your Asana AI agent. I can read your tasks, prioritize them, surface blockers, and take actions on your behalf. What would you like to do?",
      },
    ]);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-[780px] h-[88vh] bg-white rounded-3xl border border-gray-300 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 flex items-center gap-3 bg-gradient-to-br from-white to-blue-50">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_7px_#22c55e]"></div>
          <h1 className="text-[15px] font-bold text-gray-900 flex-1">Asana AI Agent</h1>
          <button 
            onClick={clearChat}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                msg.role === "user" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {msg.role === "user" ? "MO" : "AI"}
              </div>
              <div 
                className={`max-w-[75%] px-4 py-3 text-[13.5px] leading-relaxed border ${
                  msg.role === "user"
                    ? "bg-blue-50 border-blue-200 text-blue-900 rounded-[20px_4px_20px_20px]"
                    : "bg-gray-50 border-gray-300 text-gray-900 rounded-[4px_20px_20px_20px]"
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-blue-50 text-blue-700 border border-blue-200">AI</div>
              <div className="max-w-[75%] px-4 py-3 text-[13.5px] leading-relaxed border bg-gray-50 border-gray-300 text-gray-500 italic rounded-[4px_20px_20px_20px]">
                Checking Asana...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-6 py-3 flex gap-2 flex-wrap border-t border-gray-300 bg-white">
          {["Show all tasks", "What should I focus on today?", "Any blockers or overdue tasks?", "Summarize project health"].map((chip) => (
            <button 
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-xs px-3.5 py-1.5 rounded-full border border-gray-300 text-gray-700 bg-white font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-300 flex gap-2 bg-white rounded-b-3xl items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask your agent anything..."
            className="flex-1 px-4 py-2.5 text-[13.5px] rounded-full border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-600 outline-none transition-colors"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="px-5 py-2.5 text-[13px] rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
