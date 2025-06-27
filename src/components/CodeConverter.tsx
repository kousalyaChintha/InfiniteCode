import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleGenAI } from "@google/genai";

interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
}

interface CodeConverterProps {
  aiSettings: AISettings;
  onCodeGenerated?: (codeBlocks: Record<string, string>) => void;
}

export const CodeConverter: React.FC<CodeConverterProps> = ({ onCodeGenerated }) => {
  const [aiSettings, setAISettings] = useState({
    provider: localStorage.getItem('ai_provider') || 'openai',
    model: localStorage.getItem('ai_model') || 'gpt-4',
    apiKey: localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key') || localStorage.getItem('anthropic_api_key') || '',
  });
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
  const [sourceCode, setSourceCode] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [allCodeBlocks, setAllCodeBlocks] = useState<Record<string, string>>({});
  const [sourceLanguage, setSourceLanguage] = useState('python');
  const [targetLanguage, setTargetLanguage] = useState('javascript');
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (aiSettings.provider === 'gemini' && aiSettings.apiKey) {
      setAiClient(new GoogleGenAI({ apiKey: aiSettings.apiKey }));
    }
  }, [aiSettings.provider, aiSettings.apiKey]);

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  const parseCodeBlocks = (text: string): Record<string, string> => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: Record<string, string> = {};
    let match;
    while ((match = codeRegex.exec(text)) !== null) {
      const langRaw = match[1]?.toLowerCase() || '';
      const code = match[2].trim();

      let lang = '';
      switch (langRaw) {
        case 'python':
        case 'py':
          lang = 'python';
          break;
        case 'java':
          lang = 'java';
          break;
        case 'cpp':
        case 'c++':
          lang = 'cpp';
          break;
        case 'javascript':
        case 'js':
          lang = 'javascript';
          break;
        default:
          lang = '';
      }

      if (lang) {
        codeBlocks[lang] = code;
      }
    }
    return codeBlocks;
  };

  const convertCode = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter source code to convert');
      return;
    }

    if (!aiSettings || !aiSettings.apiKey) {
      toast.error(`Missing API key for ${aiSettings?.provider || 'AI provider'}`);
      return;
    }

    setIsConverting(true);

    const prompt = `
You're a helpful code assistant.
Convert the following code from ${sourceLanguage} to ${targetLanguage}:

\`\`\`${sourceLanguage}
${sourceCode}
\`\`\`

Please return only the converted code inside a single code block in ${targetLanguage}.
`;

    try {
      let responseText = '';

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
              { role: 'system', content: 'You are a helpful code assistant.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
        responseText = data.choices[0].message.content;
      } else if (aiSettings.provider === 'gemini') {
        if (!aiClient) {
          throw new Error('Google GenAI client not initialized');
        }

        const result = await aiClient.models.generateContent({
          model: aiSettings.model || 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const text = result.text;
        const blocks = parseCodeBlocks(text);
        const converted = blocks[targetLanguage] || text;

        setConvertedCode(converted);
        setAllCodeBlocks(blocks);
        onCodeGenerated?.(blocks);
        toast.success('Code converted successfully!');
        return;
      } else if (aiSettings.provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiSettings.apiKey,
          },
          body: JSON.stringify({
            model: aiSettings.model,
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            max_tokens_to_sample: 1000,
            temperature: 0.3,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
        responseText = data.completion || '';
      } else {
        throw new Error(`Unsupported provider: ${aiSettings.provider}`);
      }

      const blocks = parseCodeBlocks(responseText);
      const converted = blocks[targetLanguage] || responseText;
      setConvertedCode(converted);
      setAllCodeBlocks(blocks);
      onCodeGenerated?.(blocks);
      toast.success('Code converted successfully!');
    } catch (err) {
      toast.error(err.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <RefreshCw className="mr-2 h-5 w-5 text-green-400" />
            Language Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-2 block">From</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 border-purple-500/30">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-6 w-6 text-purple-400 mt-6" />
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-2 block">To</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-100` border-purple-500/30">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Source Code</label>
            <Textarea
              placeholder="Paste your code here..."
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="h-32 bg-slate-800/50 border-purple-500/30 text-white placeholder-gray-400 font-mono"
            />
          </div>

          <Button
            onClick={convertCode}
            disabled={isConverting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Converting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Convert Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {convertedCode && (
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Converted Code</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(convertedCode)} className="text-gray-400 hover:text-white">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <pre className="text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                <code>{convertedCode}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
