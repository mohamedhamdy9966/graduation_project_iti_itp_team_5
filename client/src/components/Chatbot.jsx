import React, { useState } from "react";
import { assets } from "../assets/assets_frontend/assets";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { sender: "user", text: input }]);
      // Simulate bot response (replace with API call later)
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `You said: "${input}". How can I help further?`,
        },
      ]);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
      >
        <img
          src={assets.logo || "https://via.placeholder.com/24"}
          alt="Chat"
          className="w-6 h-6"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-0 md:right-4 w-full md:w-96 h-[80vh] md:h-[500px] bg-white border border-indigo-100 shadow-2xl rounded-2xl flex flex-col transition-all duration-300">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-100 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-indigo-900">
              Roshetta Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
            >
              <img
                src={assets.cross_icon || "https://via.placeholder.com/20"}
                alt="Close"
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-100 text-indigo-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-indigo-100 bg-indigo-50 rounded-b-2xl"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
