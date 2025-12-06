import { useState } from 'react';
import { Send, Video, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const aiResponses = [
  "I remember those mornings at the hawker centre. Tell me what you miss most.",
  "The old days were simple but full of warmth. What brings you here today?",
  "I'm grateful you stopped by. What would you like to talk about?",
  "Those were good times, weren't they? I'm here to listen.",
];

export default function ChatTab() {
  const [showWarning, setShowWarning] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello, I'm here to share memories and stories. Feel free to ask me anything.",
      sender: 'ai',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: 'Just now',
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  if (showWarning) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <p className="text-sm text-stone-700 leading-relaxed text-center">
            You're interacting with a memorial avatar shaped from shared memories and an
            AI-generated voice. While it may feel familiar, all expressions are only a gentle
            reflection of the remembered.
          </p>
        </div>

        <button
          onClick={() => setShowWarning(false)}
          className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-500 text-stone-900 font-semibold rounded-xl transition-colors"
        >
          I understand and want to proceed
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
            <span className="text-xs text-stone-500 font-medium">LAK</span>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Lim Ah Kow</h3>
            <p className="text-xs text-stone-500">Memorial Avatar</p>
          </div>
        </div>
        <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
          <Video className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-stone-100 text-stone-900'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-stone-700' : 'text-stone-500'
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Send a message..."
            className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-4 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-5 h-5 text-stone-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
