import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wand2, Copy, Send, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleGenAI } from "@google/genai";

interface LeftPanelProps {
  generatedCode;
  onCodeGenerated: (code) => void;
  onCopyToEditor: (code: string, language: string) => void;
  aiSettings: {
    provider: string;
    model: string;
    apiKey: string;
  };
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  generatedCode,
  onCodeGenerated,
  onCopyToEditor,
  aiSettings,
}) => {
  const [problem, setProblem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize GoogleGenAI client only if provider is gemini and apiKey is present
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
  useEffect(() => {
    if (aiSettings.provider === 'gemini' && aiSettings.apiKey) {
      setAiClient(new GoogleGenAI({ apiKey: aiSettings.apiKey }));
    }
  }, [aiSettings.provider, aiSettings.apiKey]);

  const generateCode = async () => {
    if (!problem.trim()) {
      toast.error('Please enter a problem statement');
      return;
    }

    if (!aiSettings.apiKey) {
      toast.error(`Missing API key for ${aiSettings.provider}`);
      return;
    }

    setIsGenerating(true);

    // Helper to normalize and parse code blocks from any response
    const parseCodeBlocks = (text: string) => {
      const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const codeBlocks: Record<string, string> = {
        pseudoCode: '',
        python: '',
        java: '',
        cpp: '',
        javascript: '',
      };

      let match;
      while ((match = codeRegex.exec(text)) !== null) {
        const langRaw = match[1]?.toLowerCase() || '';
        const code = match[2].trim();
        let lang = '';

        switch (langRaw) {
          case 'pseudo':
          case 'pseudocode':
            lang = 'pseudoCode';
            break;
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

        if (lang && codeBlocks[lang] === '') {
          codeBlocks[lang] = code;
        }
      }

      return codeBlocks;
    };

    try {
      let codeBlocks: Record<string, string> = {
        pseudoCode: '',
        python: '',
        java: '',
        cpp: '',
        javascript: '',
      };

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
              {
                role: 'system',
                content: `You're a helpful code assistant. Given a problem statement, return pseudocode and solutions in Python, Java, C++, and JavaScript.`,
              },
              {
                role: 'user',
                content: `Problem: ${problem}\nPlease provide the following:\n1. Pseudocode\n2. Python\n3. Java\n4. C++\n5. JavaScript`,
              },
            ],
            temperature: 0.3,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Error from OpenAI API');
        }

        const text = data.choices[0].message.content;
        codeBlocks = parseCodeBlocks(text);
      }

      else if (aiSettings.provider === 'gemini') {
        if (!aiClient) {
          throw new Error('Google GenAI client not initialized');
        }

        const prompt = `You're a helpful code assistant. Given this problem statement, provide pseudocode and code solutions in Python, Java, C++, and JavaScript, each in a separate code block:\nProblem: ${problem}`;

        const result = await aiClient.models.generateContent({
          model: aiSettings.model || 'gemini-2.0-flash',
          contents: prompt,
        });

        const text = result.text;
        codeBlocks = parseCodeBlocks(text);
      }

      else if (aiSettings.provider === 'claude') {
        const claudeUrl = 'https://api.anthropic.com/v1/complete';
        const prompt = `\n\nHuman: You're a helpful code assistant. Given a problem statement, return pseudocode and solutions in Python, Java, C++, and JavaScript.\n\nProblem: ${problem}\nPlease provide the following:\n1. Pseudocode\n2. Python\n3. Java\n4. C++\n5. JavaScript\n\nAssistant:`;

        const response = await fetch(claudeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': aiSettings.apiKey,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'claude-v1',
            prompt,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Error from Claude API');
        }

        const text = data.completion || '';
        codeBlocks = parseCodeBlocks(text);
      }

      else {
        throw new Error(`Unsupported AI provider: ${aiSettings.provider}`);
      }

      onCodeGenerated(codeBlocks);
      toast.success('Code generated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };


  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard!');
  };

  const handleCopyToEditor = (code: string, language: string) => {
    onCopyToEditor(code, language);
    toast.success(`Code copied to editor (${language})`);
  };

  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-6 border-r border-purple-500/20 overflow-y-auto">
      <div className="space-y-6">
        <Card className="bg-black/40 dark:bg-black/60 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-white dark:text-gray-100">
              <Wand2 className="mr-2 h-5 w-5 text-cyan-400" />
              Problem Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the problem..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[100px] bg-slate-800/50 dark:bg-slate-900/70 border-purple-500/30 text-white dark:text-gray-100"
            />
            <Button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedCode.pseudoCode && (
          <Card className="bg-black/40 dark:bg-black/60 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white dark:text-gray-100">
                <FileCode className="mr-2 h-5 w-5 text-green-400" />
                Generated Solutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pseudo" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 dark:bg-slate-900/70">
                  {['pseudo', 'python', 'java', 'cpp', 'javascript'].map((lang) => (
                    <TabsTrigger key={lang} value={lang} className="text-xs text-gray-300 dark:text-gray-400 capitalize">
                      {lang}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(generatedCode).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="mt-4">
                    <div className="bg-slate-800/50 dark:bg-slate-900/70 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400 capitalize">
                          {lang}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code)}
                            className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-100"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {lang !== 'pseudoCode' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyToEditor(code, lang)}
                              className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-100"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <pre className="text-gray-300 dark:text-gray-200 text-sm overflow-x-auto whitespace-pre-wrap">
                        {code}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
