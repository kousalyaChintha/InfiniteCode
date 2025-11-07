import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { LeftPanel } from '@/components/LeftPanel';
import { RightPanel } from '@/components/RightPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { Toaster } from 'react-hot-toast';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState({
    pseudoCode: '',
    python: '',
    java: '',
    cpp: '',
    javascript: '',
  });

  const [editorCode, setEditorCode] = useState('// Write your code here...');
  const [editorLanguage, setEditorLanguage] = useState('javascript');

  // 🧠 AI settings state
  const [aiSettings, setAiSettings] = useState({
    provider: localStorage.getItem('ai_provider') || 'openai',
    model: localStorage.getItem('ai_model') || 'gpt-4',
    apiKey: localStorage.getItem('openai_api_key') || '',
  });

  const handleCodeGenerated = (code) => {
    setGeneratedCode(code);
  };

  const handleCopyToEditor = (code, language) => {
    setEditorCode(code);
    setEditorLanguage(language);
  };

  const loadSettingsFromLocalStorage = () => {
    const provider = localStorage.getItem('ai_provider') || 'openai';
    const model = localStorage.getItem('ai_model') || 'gpt-4';
    const apiKey =
      provider === 'openai'
        ? localStorage.getItem('openai_api_key') || ''
        : provider === 'anthropic'
        ? localStorage.getItem('anthropic_api_key') || ''
        : localStorage.getItem('gemini_api_key') || '';

    setAiSettings({ provider, model, apiKey });
  };

  useEffect(() => {
    // Load initial settings
    loadSettingsFromLocalStorage();

    // Listen for settings update from Settings page
    window.addEventListener('ai-settings-updated', loadSettingsFromLocalStorage);
    return () => {
      window.removeEventListener('ai-settings-updated', loadSettingsFromLocalStorage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      <Toaster position="top-right" />
      <Header />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        <div className="flex-1 lg:flex-[0_0_30%] border-r border-purple-500/20 overflow-hidden">
          <LeftPanel
            generatedCode={generatedCode}
            onCodeGenerated={handleCodeGenerated}
            onCopyToEditor={handleCopyToEditor}
            aiSettings={aiSettings} 
          />
        </div>
        <div className="flex-1 lg:flex-[0_0_40%] border-r border-purple-500/20 overflow-hidden">
          <RightPanel
            code={editorCode}
            language={editorLanguage}
            onCodeChange={setEditorCode}
            onLanguageChange={setEditorLanguage}
          />
        </div>
        <div className="flex-1 lg:flex-[0_0_30%] overflow-hidden">
          <ChatPanel
            editorCode={editorCode}
            editorLanguage={editorLanguage}
            onCodeUpdate={setEditorCode}
            generatedCode={generatedCode}
            onGeneratedCodeUpdate={setGeneratedCode}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
