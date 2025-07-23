import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CodeEditorPanel from './components/CodeEditorPanel';
import AnalysisPanel from './components/AnalysisPanel';
import ChatAssistant from './components/ChatAssistant';
import { analyzeCode, createChat } from './services/geminiService';
import type { Theme, SupportedLanguage, AnalysisType, AnalysisResult, ChatInstance, ChatMessage } from './types';
import { LANGUAGES } from './types';

const defaultCode = `import React from 'react';

// A simple component that might have issues
function UserProfile({ user }) {
  // Inefficient data processing
  const processedData = user.data.map(item => {
    // This could be slow if data is large
    let processed = item;
    for (let i = 0; i < 1000; i++) {
      processed += i; // Unnecessary computation
    }
    return processed;
  });

  // Potential XSS vulnerability
  return (
    <div>
      <h1>{user.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
      <ul>
        {processedData.map((d, i) => <li key={i}>{d}</li>)}
      </ul>
    </div>
  );
}

export default UserProfile;
`;


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [code, setCode] = useState<string>(defaultCode);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('review');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatInstance, setChatInstance] = useState<ChatInstance | null>(null);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleAnalyze = useCallback(async (type: AnalysisType) => {
    if (!code) return;
    setIsLoading(true);
    setAnalysisResult(null);
    setAnalysisType(type);
    setActiveTab('analysis');
    setChatInstance(null); // Reset chat on new analysis

    try {
      const result = await analyzeCode(type, code, language);
      setAnalysisResult(result);
      const newChat = createChat(code, language);
      setChatInstance({ chat: newChat, history: [] });

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
      alert(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);
  
  const handleNewChatMessage = useCallback((role: 'user' | 'model', content: string) => {
    setChatInstance(prev => {
        if (!prev) return null;
        const newHistory = [...prev.history];
        const lastMessage = newHistory[newHistory.length - 1];
        
        // If streaming, update the last model message. Otherwise, add a new one.
        if (role === 'model' && lastMessage?.role === 'model') {
            lastMessage.content = content;
        } else {
            newHistory.push({ role, content });
        }
        return { ...prev, history: newHistory };
    });
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans bg-white dark:bg-slate-950">
      <Header theme={theme} onThemeChange={setTheme} />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 dark:bg-slate-800 overflow-hidden min-h-0">
        <CodeEditorPanel
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-slate-800 p-1">
            <nav className="flex space-x-1" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === 'analysis' ? 'bg-primary-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800'}`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === 'chat' ? 'bg-primary-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent'}`}
                disabled={!chatInstance}
              >
                Chat
              </button>
            </nav>
          </div>
          <div className="flex-grow min-h-0 relative">
            <div key={activeTab} className="w-full h-full absolute top-0 left-0 animate-fade-in">
              {activeTab === 'analysis' ? (
                <AnalysisPanel result={analysisResult} type={analysisType} isLoading={isLoading} theme={theme} language={language} />
              ) : (
                <ChatAssistant chatInstance={chatInstance} onNewMessage={handleNewChatMessage} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;