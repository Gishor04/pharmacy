import React from 'react';
import { Send, Bot, User, RefreshCw, Volume2, VolumeX, AlertTriangle, HelpCircle } from 'lucide-react';
import { translations, Language } from '../translations';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  currentLang: Language;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
}

export default function AIAssistant({ currentLang, accessibility }: AIAssistantProps) {
  const t = translations[currentLang];
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: "Vanakkam and Ayubowan! I am your Gishor Pharmacy AI Health Assistant. I can help you check minor symptoms, explain dosage guidelines, and suggest OTC support. \n\n*To help me assist you safely, please specify your symptoms, age, and any active medications or allergies.*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [vocalizeEnabled, setVocalizeEnabled] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send chat history and current message to the server API
      const response = await fetch('/api/chats/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });

      if (!response.ok) {
        throw new Error("Network issue.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Vocalize if enabled
      if (vocalizeEnabled && 'speechSynthesis' in window) {
        const cleanText = data.text.replace(/[*⚠️🚨]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = currentLang === 'ta' ? 'ta-IN' : currentLang === 'si' ? 'si-LK' : 'en-US';
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error(err);
      // Append fallback failure explanation
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I am experiencing brief network strain, but please remember: Paracetamol (Panadol) is safe for acute fevers, and Cetirizine handles runy noses. For continuous fevers exceeding 48 hours in Jaffna, check in immediately at teaching hospital.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: "Vanakkam! Let's start over. Tell me about your wellness needs, or choose one of our quick questions below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const starterChips = [
    { label: "Check sudden fever symptoms", text: "I have had a sudden fever and joint pain since yesterday. Can you suggest what to do?" },
    { label: "Insulin storage instructions", text: "How should I store my insulin cartridges at home in Sri Lanka's climate?" },
    { label: "Metformin usage guidelines", text: "Should I take Glucophage (Metformin) on an empty stomach or with food?" },
    { label: "Elderly joint safety advice", text: "My 72-year-old father has mild knee stiffness. What supplements can assist?" }
  ];

  return (
    <div className={`rounded-2xl shadow-md border flex flex-col h-[580px] overflow-hidden ${
      accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-gray-100'
    }`} id="ai-chat-assistant-container">
      
      {/* Header of Assistant */}
      <div className={`p-4 flex justify-between items-center border-b ${
        accessibility.highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-[#F5FAFF] border-gray-100'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#0F6CBD] text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold ${accessibility.largeText ? 'text-lg' : 'text-sm'} ${
              accessibility.highContrast ? 'text-yellow-400' : 'text-[#0F6CBD]'
            }`}>
              {t.aiAssistantTitle}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">Symptom Checker & Dosage Education</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Vocalization Switcher */}
          <button
            onClick={() => setVocalizeEnabled(!vocalizeEnabled)}
            className={`p-2 rounded-lg transition ${
              vocalizeEnabled ? 'bg-[#22A06B] text-white' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800'
            }`}
            title="Read suggestions aloud (Speech Synthesis)"
            id="ai-audio-speaker-toggle"
          >
            {vocalizeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {/* Refresh Chat */}
          <button
            onClick={resetChat}
            className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            title="Reset Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Alert Warning Line */}
      <div className="bg-amber-50 text-amber-800 px-4 py-2 text-[11px] flex items-start space-x-1.5 border-b border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <span>
          <strong>{t.disclaimerLabel}:</strong> AI suggestions are informational only. Always consult a registered doctor for severe issues. Emergency dispatcher: <strong>+94212222222</strong>.
        </span>
      </div>

      {/* Messages Feed */}
      <div className={`flex-1 p-4 overflow-y-auto space-y-4 ${
        accessibility.highContrast ? 'bg-zinc-950' : 'bg-gray-50'
      }`} id="ai-chat-messages-box">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-1.5 rounded-full shrink-0 h-8 w-8 flex items-center justify-center ${
                msg.sender === 'user'
                  ? 'bg-blue-100 text-[#0F6CBD] dark:bg-blue-900'
                  : 'bg-green-100 text-[#22A06B] dark:bg-green-900'
              }`}>
                {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>
              
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? accessibility.highContrast
                    ? 'bg-yellow-400 text-black font-semibold'
                    : 'bg-[#0F6CBD] text-white rounded-tr-none shadow-sm'
                  : accessibility.highContrast
                    ? 'bg-zinc-900 text-white border border-yellow-400 rounded-tl-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-xs'
              }`}>
                {msg.text}
                <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-2 items-center bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-xs text-gray-400 shadow-xs">
              <Bot className="w-4 h-4 text-[#22A06B] animate-bounce" />
              <span>Analyzing clinical database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips when chat length is small */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white space-y-1.5">
          <p className="text-[10px] text-gray-400 font-semibold uppercase flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Select a query to ask immediate advice:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-full hover:bg-[#F5FAFF] hover:text-[#0F6CBD] hover:border-[#0F6CBD] transition text-left"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className={`p-3 border-t flex space-x-2 items-center ${
        accessibility.highContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-100'
      }`}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder={t.chatPlaceholder}
          className="flex-1 bg-gray-50 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F6CBD]"
          disabled={loading}
          id="ai-assistant-input"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className={`p-2.5 rounded-xl text-white font-bold transition flex items-center justify-center ${
            accessibility.highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-500'
              : 'bg-[#0F6CBD] hover:bg-[#0c599c] disabled:opacity-40 shadow-sm'
          }`}
          id="ai-assistant-send-button"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
