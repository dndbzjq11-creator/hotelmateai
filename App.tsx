
import React, { useState, useRef, useEffect } from 'react';
import { Hotel, Message, Step, MenuTab, MessageOption } from './types';
import { HOTELS } from './constants';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('START');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const addMessage = (role: 'user' | 'assistant', content: string, options?: MessageOption[]) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role,
      content,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    addMessage('user', text);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }]
    }));

    const result = await getGeminiResponse(text, history);
    
    // Logic to detect state changes based on user text
    const lowerText = text.toLowerCase();
    let nextStep: Step = currentStep;
    let nextHotel = selectedHotel;

    if (lowerText.includes('앱 시작') || lowerText.includes('처음으로') || lowerText.includes('호텔 변경')) {
      nextStep = 'START';
      nextHotel = null;
    }

    const foundHotel = HOTELS.find(h => text.includes(h.name) || (text.length < 3 && text === h.id.toString()));
    if (foundHotel) {
      nextHotel = foundHotel;
      nextStep = 'HOTEL_SELECTED';
    }

    // Determine if the user asked for the menu again
    if ((lowerText.includes('메뉴') || lowerText === 'menu') && nextHotel) {
      nextStep = 'HOTEL_SELECTED';
    }

    // Determine if we should show options based on the content/step
    let options: MessageOption[] | undefined;
    if (nextStep === 'START') {
      options = HOTELS.map(h => ({
        label: `${h.id}. ${h.name}`,
        value: h.name,
        icon: 'fa-hotel'
      }));
    } else if (nextStep === 'HOTEL_SELECTED' || (nextHotel && (lowerText.includes('이용 안내') || lowerText.includes('맛집') || lowerText.includes('산책')))) {
      // Always provide the main menu options when a hotel is active and we are in menu mode or detail mode
      options = [
        { label: '🏨 호텔 이용 안내', value: `${nextHotel?.name} 이용 안내`, icon: 'fa-info-circle' },
        { label: '🍽️ 주변 맛집 탐방', value: `${nextHotel?.name} 주변 맛집 탐방`, icon: 'fa-utensils' },
        { label: '🌿 힐링 & 산책 코스', value: `${nextHotel?.name} 주변 힐링 및 산책 코스 추천`, icon: 'fa-leaf' }
      ];
    }

    setSelectedHotel(nextHotel);
    setCurrentStep(nextStep);
    addMessage('assistant', result.text || '답변을 가져오지 못했습니다.', options);
    setIsLoading(false);
  };

  // Helper to render markdown-like links [text](url)
  const renderContent = (content: string) => {
    const parts = content.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={i} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 transition"
          >
            {match[1]}
            <i className="fas fa-external-link-alt text-[10px]"></i>
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-2xl overflow-hidden font-sans border-x border-gray-200">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <i className="fas fa-concierge-bell text-xl"></i>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">제휴호텔메이트AI</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest">Active Assistant</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => handleSend("앱 시작")}
          className="text-[11px] font-bold bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full border border-white/30 transition-all flex items-center gap-2"
        >
          <i className="fas fa-redo-alt"></i> 초기화
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f8f9fd] scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in py-12">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3">
                <i className="fas fa-robot text-5xl"></i>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-sparkles text-indigo-500 text-lg"></i>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">반갑습니다!</h2>
              <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                당신의 투숙을 완벽하게 디자인하는<br/>
                <span className="text-indigo-600 font-bold italic">Smart Concierge AI</span> 입니다.
              </p>
            </div>
            <button 
              onClick={() => handleSend("앱 시작")}
              className="group relative bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition transform hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
              앱 시작하기
              <i className="fas fa-chevron-right ml-3 text-sm"></i>
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
            <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {renderContent(msg.content)}
              </div>
              <div className={`text-[9px] mt-2 font-medium opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Render Interactive Options if present in the message */}
            {msg.options && msg.options.length > 0 && msg.role === 'assistant' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[90%] mt-2 animate-slide-up">
                {msg.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(opt.value)}
                    className="flex items-center gap-3 bg-white hover:bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <i className={`fas ${opt.icon || 'fa-circle-dot'} text-xs`}></i>
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-700 truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-3">
             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
               <i className="fas fa-brain text-xs animate-pulse"></i>
             </div>
             <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation (Quick Actions) */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
          {selectedHotel && (
            <>
              <button 
                onClick={() => handleSend(`${selectedHotel.name} 메뉴 보여줘`)}
                className="whitespace-nowrap bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-[11px] font-black border border-indigo-100 hover:bg-indigo-100 transition shadow-sm"
              >
                <i className="fas fa-list-ul mr-1.5"></i> 메인 메뉴
              </button>
              <button 
                onClick={() => handleSend("호텔 변경 (처음으로)")}
                className="whitespace-nowrap bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-[11px] font-black border border-gray-200 hover:bg-gray-100 transition shadow-sm"
              >
                <i className="fas fa-home mr-1.5"></i> 호텔 변경
              </button>
            </>
          )}
        </div>

        {/* Input Box */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedHotel ? `${selectedHotel.name}에게 질문하기...` : "메시지를 입력하세요..."}
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isLoading 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95'
            }`}
          >
            <i className="fas fa-arrow-up text-lg"></i>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); scale: 0.98; }
          to { opacity: 1; transform: translateY(0); scale: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
