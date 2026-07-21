import React from 'react';
import { Mic, MicOff, Volume2, HelpCircle, X, Check } from 'lucide-react';
import { translations, Language } from '../translations';

interface VoiceSearchProps {
  currentLang: Language;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
  onSpeechResult: (text: string) => void;
}

export default function VoiceSearch({ currentLang, accessibility, onSpeechResult }: VoiceSearchProps) {
  const t = translations[currentLang];
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [showSimModal, setShowSimModal] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  // Initialize browser speech recognition if supported
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Map current language selection to standard locale code
      if (currentLang === 'ta') rec.lang = 'ta-LK'; // Tamil Sri Lanka
      else if (currentLang === 'si') rec.lang = 'si-LK'; // Sinhala Sri Lanka
      else rec.lang = 'en-LK'; // English Sri Lanka

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('Listening for drug name...');
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        onSpeechResult(resultText);
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        // Fall back to showing high-fidelity simulator for user ease in sandboxed iframe
        setShowSimModal(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLang, onSpeechResult]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          setShowSimModal(true);
        }
      } else {
        // Speech API not found in this browser, show high fidelity simulator
        setShowSimModal(true);
      }
    }
  };

  const selectSimulationKeyword = (word: string) => {
    setTranscript(word);
    onSpeechResult(word);
    setShowSimModal(false);
  };

  const localizedPrompts = {
    en: [
      { label: "Search 'Panadol'", word: "Paracetamol (Panadol)" },
      { label: "Search 'Amoxicillin'", word: "Amoxil" },
      { label: "Search 'Ensure'", word: "Ensure Gold" },
      { label: "Filter 'Baby Care'", word: "Baby Care" }
    ],
    ta: [
      { label: "பாராசிட்டமால் என்று தேடு", word: "Paracetamol (Panadol)" },
      { label: "அமோக்சிலின் என்று தேடு", word: "Amoxil" },
      { label: "முதியோர் பராமரிப்பு", word: "Elderly Care" }
    ],
    si: [
      { label: "පැරසිටමෝල් සොයන්න", word: "Paracetamol (Panadol)" },
      { label: "ළදරු නිෂ්පාදන", word: "Baby Care" }
    ]
  };

  const chips = localizedPrompts[currentLang] || localizedPrompts.en;

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleListening}
        className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : accessibility.highContrast
              ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
              : 'bg-[#0F6CBD]/10 text-[#0F6CBD] hover:bg-[#0F6CBD]/20'
        }`}
        title={t.btnVoice}
        id="voice-search-mic-button"
      >
        {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
        <span>{isListening ? 'Listening...' : t.btnVoice}</span>
      </button>

      {/* Display real-time transcript toast if active */}
      {transcript && isListening && (
        <span className="absolute left-0 top-full mt-2 bg-[#1F2937] text-white text-[10px] px-2.5 py-1 rounded-md shadow-md min-w-[150px] z-50 font-mono">
          "{transcript}"
        </span>
      )}

      {/* Multilingual Voice Simulation Dialogue for sandboxed frames */}
      {showSimModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className={`w-full max-w-sm rounded-2xl p-5 shadow-xl border ${
            accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-[#0F6CBD]" />
                <h4 className="font-bold text-sm">Vocal Command Assistant</h4>
              </div>
              <button 
                onClick={() => setShowSimModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Browser microphone access is blocked or unconfigured. Please simulate your vocal request by tapping one of the Sinhalese, Tamil or English phrases:
            </p>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Available commands:</span>
              <div className="grid grid-cols-1 gap-2">
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSimulationKeyword(chip.word)}
                    className="flex justify-between items-center text-left text-xs bg-gray-50 hover:bg-[#F5FAFF] border border-gray-200 hover:border-[#0F6CBD] p-2.5 rounded-xl transition dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{chip.label}</span>
                    <Check className="w-3.5 h-3.5 text-[#22A06B]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowSimModal(false)}
                className="text-xs font-semibold text-gray-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
