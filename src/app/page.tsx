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

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "agent", content: "I have updated the Asana task for you." }]);
      setIsTyping(false);
    }, 1500);
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
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] p-4 font-sans relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[850px] h-[90vh] bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] z-10">
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/10 flex items-center gap-4 bg-white/5 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"></div>
          <h1 className="text-lg font-semibold text-white flex-1 tracking-wide">Asana AI Agent</h1>
          <button 
            onClick={clearChat}
            className="px-4 py-2 text-sm font-medium rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 items-end ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-lg ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
                  : "bg-gradient-to-br from-zinc-700 to-zinc-800 text-gray-100 border border-white/10"
              }`}>
                {msg.role === "user" ? "MO" : "AI"}
              </div>
              <div 
                className={`max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-md ${
                  msg.role === "user"
                    ? "bg-indigo-500/80 border border-indigo-400/30 text-white rounded-[24px_24px_4px_24px]"
                    : "bg-white/10 border border-white/10 text-gray-100 rounded-[24px_24px_24px_4px]"
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4 items-end">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-lg bg-gradient-to-br from-zinc-700 to-zinc-800 text-gray-100 border border-white/10">AI</div>
              <div className="max-w-[75%] px-6 py-5 text-[15px] leading-relaxed shadow-lg backdrop-blur-md bg-white/10 border border-white/10 text-gray-300 rounded-[24px_24px_24px_4px] flex items-center gap-2">
                <span className="flex gap-1.5 items-center justify-center h-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-8 py-4 flex gap-3 flex-wrap border-t border-white/10 bg-black/20 backdrop-blur-md">
          {["Show all tasks", "What should I focus on today?", "Any blockers or overdue tasks?", "Summarize project health"].map((chip) => (
            <button 
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-sm px-4 py-2 rounded-full border border-white/10 text-gray-300 bg-white/5 font-medium hover:bg-white/15 hover:text-white transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-5 bg-black/30 backdrop-blur-xl flex gap-3 items-center border-t border-white/5">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask your agent anything..."
            className="flex-1 px-6 py-4 text-[15px] rounded-full border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all duration-300 shadow-inner"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="px-8 py-4 text-[15px] rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
