import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

export const ChatPanel = ({ editorCode, editorLanguage, onCodeUpdate, generatedCode, onGeneratedCodeUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const aiSettings = {
    provider: localStorage.getItem('ai_provider') || 'openai',
    model: localStorage.getItem('ai_model') || 'gpt-4',
    apiKey: localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key') || localStorage.getItem('anthropic_api_key') || '',
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const parseCodeFromResponse = (text) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codes = {};
    let match;

    while ((match = codeRegex.exec(text)) !== null) {
      const lang = match[1]?.toLowerCase() || '';
      const code = match[2].trim();
      
      if (lang === 'python' || lang === 'py') codes.python = code;
      else if (lang === 'java') codes.java = code;
      else if (lang === 'cpp' || lang === 'c++' || lang === 'c') codes.cpp = code;
      else if (lang === 'javascript' || lang === 'js') codes.javascript = code;
      else if (lang === 'pseudo' || lang === 'pseudocode' || lang === 'text') codes.pseudoCode = code;
      else if (lang === editorLanguage) codes.editor = code;
    }

    return codes;
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!aiSettings.apiKey) {
      toast.error('Please configure your API key in Settings');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = `
Current Editor Code (${editorLanguage}):
\`\`\`${editorLanguage}
${editorCode}
\`\`\`

Generated Code Solutions:
${generatedCode.pseudoCode ? `Pseudocode:\n\`\`\`pseudo\n${generatedCode.pseudoCode}\n\`\`\`\n` : ''}
${generatedCode.python ? `Python:\n\`\`\`python\n${generatedCode.python}\n\`\`\`\n` : ''}
${generatedCode.java ? `Java:\n\`\`\`java\n${generatedCode.java}\n\`\`\`\n` : ''}
${generatedCode.cpp ? `C++:\n\`\`\`cpp\n${generatedCode.cpp}\n\`\`\`\n` : ''}
${generatedCode.javascript ? `JavaScript:\n\`\`\`javascript\n${generatedCode.javascript}\n\`\`\`\n` : ''}

User Query: ${input}

Please help the user with their query. If you're providing code improvements or fixes, return the updated code in code blocks for each language. Always include all languages (pseudocode, python, java, cpp, javascript) even if only one needs updating.`;

      let aiResponse = '';

      if (aiSettings.provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiSettings.apiKey}`,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a helpful coding assistant. When providing code updates, always include code blocks for all languages (pseudocode, python, java, cpp, javascript).' },
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: context },
            ],
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
        aiResponse = data.choices[0].message.content;
      } else if (aiSettings.provider === 'gemini') {
        const client = new GoogleGenAI({ apiKey: aiSettings.apiKey });
        const result = await client.models.generateContent({
          model: aiSettings.model || 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: context }] }],
        });
        aiResponse = result.text;
      } else if (aiSettings.provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiSettings.apiKey,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'claude-v1',
            prompt: `\n\nHuman: ${context}\n\nAssistant:`,
            max_tokens_to_sample: 2000,
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
        aiResponse = data.completion;
      }

      const assistantMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);

      // Parse and update code if present
      const codes = parseCodeFromResponse(aiResponse);
      
      if (Object.keys(codes).length > 0) {
        // Update editor if code for current language is found
        if (codes.editor) {
          onCodeUpdate(codes.editor);
          toast.success('Editor code updated!');
        } else if (codes[editorLanguage]) {
          onCodeUpdate(codes[editorLanguage]);
          toast.success('Editor code updated!');
        }

        // Update all generated code sections
        const updatedGeneratedCode = { ...generatedCode };
        if (codes.pseudoCode) updatedGeneratedCode.pseudoCode = codes.pseudoCode;
        if (codes.python) updatedGeneratedCode.python = codes.python;
        if (codes.java) updatedGeneratedCode.java = codes.java;
        if (codes.cpp) updatedGeneratedCode.cpp = codes.cpp;
        if (codes.javascript) updatedGeneratedCode.javascript = codes.javascript;
        
        onGeneratedCodeUpdate(updatedGeneratedCode);
        toast.success('All code sections updated!');
      }

    } catch (error) {
      toast.error(error.message || 'Failed to send message');
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full bg-black/40 dark:bg-black/60 border-purple-500/30 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-white dark:text-gray-100">
          <MessageSquare className="mr-2 h-5 w-5 text-cyan-400" />
          AI Chat Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask me anything about your code!</p>
                <p className="text-sm mt-2">I can help with errors, explanations, optimizations, and code improvements.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/20 ml-8'
                    : 'bg-purple-500/20 mr-8'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-gray-200 text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                <span className="ml-2 text-gray-400">AI is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about errors, request explanations, or suggest improvements..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-slate-800/50 dark:bg-slate-900/70 border-purple-500/30 text-white dark:text-gray-100 min-h-[60px]"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
