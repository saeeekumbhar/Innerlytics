import React, { useState, useRef, useEffect } from 'react';
import { useGeminiChat, ChatMode } from '../hooks/useGeminiChat';
import { Send, MessageSquare, Wind, Brain, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

const modes: { id: ChatMode; label: string; icon: any; desc: string }[] = [
  { id: 'vent', label: 'Vent Mode', icon: MessageSquare, desc: 'Just let it all out. I\'m here to listen.' },
  { id: 'reflection', label: 'Reflection', icon: Brain, desc: 'Deepen your understanding with questions.' },
  { id: 'cbt', label: 'CBT Coach', icon: HeartHandshake, desc: 'Reframe negative thoughts together.' },
  { id: 'grounding', label: 'Grounding', icon: Wind, desc: 'Calm down with breathing exercises.' },
];

const Chat = () => {
  const [mode, setMode] = useState<ChatMode>('vent');
  const { messages, sendMessage, loading } = useGeminiChat(mode);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <div className="w-64 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col space-y-2">
        <h2 className="text-lg font-serif font-bold text-slate-900 mb-4 px-2">Chat Modes</h2>
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center p-3 rounded-xl text-left transition-colors ${
              mode === m.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <m.icon className={`w-5 h-5 mr-3 ${mode === m.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            <div>
              <div className="font-medium text-sm">{m.label}</div>
              <div className="text-xs text-slate-400 truncate w-32">{m.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-indigo-300" />
              </div>
              <p>Start a conversation in {modes.find(m => m.id === mode)?.label}.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-none flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
