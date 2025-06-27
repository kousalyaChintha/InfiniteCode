import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Bug, ArrowLeftRight } from 'lucide-react';
import { CodeDebugger } from './CodeDebugger';
import { CodeConverter } from './CodeConverter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';

interface RightPanelProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
}

const languageIdMap: Record<string, number> = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

export const RightPanel: React.FC<RightPanelProps> = ({
  code,
  language,
  onCodeChange,
  onLanguageChange
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('editor');

  const runCode = async () => {
    setIsRunning(true);
    setErrors([]);
    setOutput('');
    const judge0api = 'a113292f9fmsh370dd7eee0ae80bp140bbdjsn7c2e9a1bb54c';

    try {
      const languageId = languageIdMap[language];
      if (!languageId) throw new Error(`Unsupported language: ${language}`);

      const encodedCode = btoa(code);
      const encodedInput = btoa(input);

      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': judge0api,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: encodedCode,
          stdin: encodedInput,
        }),
      });

      const result = await response.json();

      if (result.stderr) {
        const stderr = atob(result.stderr);
        setOutput(stderr);
        setErrors([stderr]);
        toast.error('Runtime Error');
      } else if (result.compile_output) {
        const compileError = atob(result.compile_output);
        setOutput(compileError);
        setErrors([compileError]);
        toast.error('Compilation Error');
      } else {
        const stdout = atob(result.stdout || '') || 'No Output';
        setOutput(stdout);
        toast.success('Execution Success');
      }
    } catch (error) {
      const errMsg = error.message || 'Unexpected Error';
      setOutput(errMsg);
      setErrors([errMsg]);
      toast.error('Execution Failed');
    }

    setIsRunning(false);
  };

  const DEFAULT_AI_SETTINGS = {
  provider: localStorage.getItem('ai_provider') || 'openai',
  model: localStorage.getItem('ai_model') || 'gpt-4',
  apiKey:
    localStorage.getItem('openai_api_key') ||
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('anthropic_api_key') ||
    '',
};


  const analyzeWithAI = async (
    aiProvider: string,
    aiModel: string,
    apiKey: string,
    language: string,
    code: string,
    setErrors: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
  toast.loading('Analyzing code with AI...');

  const prompt = `
You are a code reviewer. Please review the following ${language} code and identify errors, warnings, or suggestions with line numbers if possible.

\`\`\`${language}
${code}
\`\`\`
Return each issue on a new line.`;

  try {
    let aiResponseText = '';

    if (aiProvider === 'openai') {
      if (!apiKey) throw new Error('Missing OpenAI API key');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: aiModel || 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful AI code reviewer.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
      aiResponseText = data.choices?.[0]?.message?.content || '';
    } else if (aiProvider === 'gemini') {
      if (!apiKey) throw new Error('Missing Gemini API key');

      const client = new GoogleGenAI({ apiKey });

      const result = await client.models.generateContent({
        model: aiModel || 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      aiResponseText = result.text || '';
    } else if (aiProvider === 'anthropic') {
      if (!apiKey) throw new Error('Missing Anthropic API key');

      const res = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: aiModel || 'claude-v1',
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 1000,
          temperature: 0.2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Anthropic API error');
      aiResponseText = data.completion || '';
    } else {
      throw new Error('Unsupported AI provider or missing API key');
    }

    const aiErrors = aiResponseText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setErrors(aiErrors);

    toast.dismiss();
    toast.success('AI Debugging Complete');
  } catch (error) {
    toast.dismiss();
    toast.error(`AI Analysis Failed: ${error.message || error}`);
    console.error(error);
  }
};


  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'debugger') {
      analyzeWithAI(DEFAULT_AI_SETTINGS.provider,
      DEFAULT_AI_SETTINGS.model,
      DEFAULT_AI_SETTINGS.apiKey,
      language,
      code,
      setErrors);
    }
  };

  const resetEditor = () => {
    onCodeChange('// Write your code here...');
    setInput('');
    setOutput('');
    setErrors([]);
    toast.success('Editor reset');
  };

  const monacoLangMap: Record<string, string> = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    javascript: 'javascript'
  };

  return (
    <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 dark:bg-slate-900/70">
          <TabsTrigger value="editor" className="flex items-center text-gray-300 dark:text-gray-400">
            <Play className="mr-2 h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="debugger" className="flex items-center text-gray-300 dark:text-gray-400">
            <Bug className="mr-2 h-4 w-4" />
            Debugger
          </TabsTrigger>
          <TabsTrigger value="converter" className="flex items-center text-gray-300 dark:text-gray-400">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Converter
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor" className="h-full space-y-4">
          <Card className="bg-black/40 dark:bg-black/60 border-purple-500/30">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-white dark:text-gray-100 flex items-center">
                  <Play className="mr-2 h-5 w-5 text-blue-400" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-32 bg-slate-800/50 dark:bg-slate-900/70 border-purple-500/30 text-white dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-purple-500/30">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" onClick={resetEditor} className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-100">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 lg:h-80 border border-purple-500/30 rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  language={monacoLangMap[language]}
                  value={code}
                  onChange={(value) => onCodeChange(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-black/40 dark:bg-black/60 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Input</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your input here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-24 bg-slate-800/50 border-purple-500/30 text-white placeholder-gray-400"
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 dark:bg-black/60 border-purple-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Output</CardTitle>
                  {errors.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errors.length} error{errors.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-slate-800/50 border border-purple-500/30 rounded-md p-3 overflow-auto">
                  <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                    {output || 'Output will appear here...'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={runCode}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
        </TabsContent>

        {/* Debugger Tab */}
        <TabsContent value="debugger" className="h-full">
          <CodeDebugger code={code} language={language} errors={errors} />
        </TabsContent>

        {/* Converter Tab */}
        <TabsContent value="converter" className="h-full">
          <CodeConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};
