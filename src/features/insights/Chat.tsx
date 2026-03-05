import React, { useState, useRef, useEffect } from 'react';
import { useGeminiChat, ChatMode } from './useGeminiChat';
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
      <div className="w-64 glass rounded-[2rem] border-none p-5 flex flex-col space-y-3 soft-shadow relative overflow-hidden hidden md:flex">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-pastel-purple)]/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mb-2 px-2 relative z-10">Chat Modes</h2>
        <div className="space-y-2 relative z-10">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full flex items-center p-3 rounded-2xl text-left transition-all duration-300 ${mode === m.id ? 'bg-[var(--color-pastel-purple)]/20 text-[var(--color-pastel-purple)] shadow-sm' : 'hover:bg-[var(--color-sidebar-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
            >
              <m.icon className={`w-5 h-5 mr-3 ${mode === m.id ? 'text-[var(--color-pastel-purple)]' : 'text-current'}`} />
              <div>
                <div className="font-medium text-sm">{m.label}</div>
                <div className="text-xs opacity-70 truncate w-32">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-[2rem] border-none soft-shadow flex flex-col overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-pastel-blue)]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 font-sans">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-secondary)]">
              <div className="w-20 h-20 bg-[var(--color-pastel-purple)]/10 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-[var(--color-pastel-purple)]/50" />
              </div>
              <p className="text-lg">Start a comforting conversation in {modes.find(m => m.id === mode)?.label}.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] p-4 text-sm md:text-base leading-relaxed soft-shadow ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-[var(--color-pastel-purple)] to-[var(--color-pastel-blue)] text-white rounded-[25px] rounded-br-[8px]'
                  : 'glass bg-[var(--color-bg-primary)]/70 text-[var(--color-text-primary)] rounded-[25px] rounded-bl-[8px]'
                  }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="glass bg-[var(--color-bg-primary)]/70 p-5 rounded-[25px] rounded-bl-[8px] flex space-x-2 soft-shadow">
                <div className="w-2 h-2 bg-[var(--color-pastel-purple)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[var(--color-pastel-blue)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[var(--color-pastel-teal)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-[var(--color-bg-primary)]/40 backdrop-blur-md relative z-20 border-t border-[var(--color-border-subtle)]/30">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto glow-focus rounded-full transition-shadow duration-300">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-6 py-4 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]/60 focus:outline-none text-sm md:text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-4 bg-[var(--color-pastel-purple)] text-white rounded-full hover:bg-[var(--color-pastel-blue)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
