import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, ChevronDown, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/utils';
import axios from 'axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', content: "Hi! I'm your Cloth Couture stylist. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
    setMessage('');
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Simulate AI response for now (can be integrated with a real endpoint later)
      // We'll add logic to check for 'order', 'shipping', 'dress', etc.
      setTimeout(() => {
        let response = "I'm not quite sure about that. Would you like to see our latest collections?";
        
        const msg = userMsg.toLowerCase();
        if (msg.includes('order') || msg.includes('track')) {
          response = "You can track your orders in the 'My Orders' section of your profile. Is there a specific order ID you're looking for?";
        } else if (msg.includes('shipping') || msg.includes('delivery')) {
          response = "We offer free shipping on orders over ₹1500! Standard delivery takes 7-10 days as our items are handmade with love.";
        } else if (msg.includes('size') || msg.includes('fit')) {
          response = "Most of our garments are true to size. You can find a detailed Size Guide on every product page to help you choose the perfect fit!";
        } else if (msg.includes('return') || msg.includes('refund')) {
          response = "We accept returns within 7 days of delivery for unworn items with tags. You can initiate a return from your order history.";
        } else if (msg.includes('dress') || msg.includes('suit') || msg.includes('kurta')) {
          response = "Great choice! We have some beautiful handmade pieces in our shop. Would you like me to show you our bestsellers?";
        } else if (msg.includes('hello') || msg.includes('hi')) {
          response = "Hello! Looking for something special today? I can help you find the perfect outfit.";
        }

        setChat(prev => [...prev, { role: 'bot', content: response }]);
        setLoading(false);
      }, 1000);

      // Real integration would look like this:
      /*
      const { data } = await axios.post(`${API_BASE_URL}/api/ai/chat`, { message: userMsg });
      setChat(prev => [...prev, { role: 'bot', content: data.reply }]);
      */
    } catch (error) {
      setChat(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Track my order",
    "Shipping policy",
    "Size guide",
    "Latest items"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-background border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm">Couture Stylist</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-medium opacity-80">AI Assistant Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-1">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {chat.length === 1 && (
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {suggestedQuestions.map(q => (
                  <button key={q} onClick={() => setMessage(q)} className="text-[10px] font-medium bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full px-3 py-1 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2 bg-muted/30">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${message.trim() ? 'bg-primary text-white shadow-lg scale-105 active:scale-95' : 'bg-muted text-muted-foreground'}`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group relative border-4 border-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageSquare className="h-6 w-6 group-hover:hidden" />
              <Sparkles className="h-6 w-6 hidden group-hover:block animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
