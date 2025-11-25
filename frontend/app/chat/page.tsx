'use client';
import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '@/lib/api';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            content: "Hello! I'm your crypto learning assistant. Ask me anything about cryptocurrency, blockchain, trading, or specific coins!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatAPI.sendMessage(input);

            const botMessage: Message = {
                role: 'bot',
                content: response.data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'bot',
                content: "Sorry, I'm having trouble responding right now. Please try again!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-emerald-400">AI Crypto Assistant</h1>
                        <p className="text-slate-400">Learn about cryptocurrency and blockchain</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.role === 'bot' && (
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-6 h-6 text-emerald-400" />
                            </div>
                        )}
                        <div
                            className={`max-w-2xl rounded-xl p-4 ${message.role === 'user'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-900 text-slate-100 border border-slate-800'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs mt-2 opacity-60">
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                        {message.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-800">
                <form onSubmit={handleSend} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about crypto..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        Send
                    </button>
                </form>
                <p className="text-xs text-slate-500 mt-3 text-center">
                    💡 Try asking: "What is Bitcoin?", "How do I buy crypto?", "What is DeFi?"
                </p>
            </div>
        </div>
    );
}
