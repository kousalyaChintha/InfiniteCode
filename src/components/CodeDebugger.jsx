import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { GoogleGenAI } from '@google/genai';
import toast from 'react-hot-toast';

const LANGUAGE_OPTIONS = ['javascript', 'typescript', 'python', 'java', 'c++'];

const DEFAULT_AI_SETTINGS = {
  provider: localStorage.getItem('ai_provider') || 'openai',
  model: localStorage.getItem('ai_model') || 'gpt-4',
  apiKey:
    localStorage.getItem('openai_api_key') ||
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('anthropic_api_key') ||
    '',
};

export const CodeDebugger = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [issues, setIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiClient, setAiClient] = useState(null);

  // Initialize Google GenAI client if provider is gemini
  useEffect(() => {
    if (DEFAULT_AI_SETTINGS.provider === 'gemini' && DEFAULT_AI_SETTINGS.apiKey) {
      setAiClient(new GoogleGenAI({ apiKey: DEFAULT_AI_SETTINGS.apiKey }));
    }
  }, []);

  // Parses AI response text to extract errors/warnings/suggestions as objects
  const parseIssues = (text) => {
    // We'll assume AI returns plain text with lines like: "Error at line 3: variable not defined"
    const lines = text.split('\n').filter(Boolean);
    return lines.map((line) => {
      const lineMatch = line.match(/line\s*(\d+)/i);
      const typeMatch = line.match(/(error|warning|suggestion)/i);
      const severity = typeMatch
        ? typeMatch[1].toLowerCase() === 'error'
          ? 'high'
          : typeMatch[1].toLowerCase() === 'warning'
          ? 'medium'
          : 'low'
        : 'low';

      return {
        type: typeMatch ? typeMatch[1].toLowerCase() : 'suggestion',
        line: lineMatch ? parseInt(lineMatch[1], 10) : '-',
        message: line,
        severity,
      };
    });
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to analyze');
      return;
    }
    if (!DEFAULT_AI_SETTINGS.apiKey) {
      toast.error('Missing API key for AI provider');
      return;
    }

    setIsAnalyzing(true);
    setIssues([]);

    const prompt = `
You are a code reviewer. Please review the following ${language} code and provide the following:

1. Identify any errors or warnings with line numbers if possible.
2. Explain what algorithms or techniques are being used.
3. Provide the time complexity of the code.
4. Provide the space complexity of the code.
5. Suggest any possible optimizations or improvements.
Here is the code:

\`\`\`${language}
${code}
\`\`\`

Please format the response clearly with headings for each section.
`;

   try {
  let aiResponseText = '';

  if (DEFAULT_AI_SETTINGS.provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEFAULT_AI_SETTINGS.apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_AI_SETTINGS.model,
        messages: [
          { role: 'system', content: 'You are a helpful code assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
    aiResponseText = data.choices[0].message.content.trim();

  } else if (DEFAULT_AI_SETTINGS.provider === 'gemini') {
    if (!aiClient) {
      throw new Error('Google GenAI client not initialized');
    }
    const result = await aiClient.models.generateContent({
      model: DEFAULT_AI_SETTINGS.model || 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    aiResponseText = result.text.trim();

  } else if (DEFAULT_AI_SETTINGS.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DEFAULT_AI_SETTINGS.apiKey,
      },
      body: JSON.stringify({
        model: DEFAULT_AI_SETTINGS.model,
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.2,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Anthropic API error');
    aiResponseText = data.completion.trim();

  } else {
    throw new Error(`Unsupported AI provider: ${DEFAULT_AI_SETTINGS.provider}`);
  }

  // Helper function to parse AI text into issues array
  const parsedIssues = parseIssues(aiResponseText);
  setIssues(parsedIssues);

  if (parsedIssues.length === 0) {
    toast.success('No issues found in your code!');
  } else {
    toast.success('Analysis complete!');
  }

} catch (err) {
  toast.error(err.message || 'Analysis failed');
} finally {
  setIsAnalyzing(false);
}
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'suggestion':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <Bug className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Bug className="mr-2 h-5 w-5 text-red-400" />
            Code Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div>
            <label className="text-sm text-gray-300">Select Language</label>
            <Select value={language} onValueChange={(val) => setLanguage(val)}>
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-white dark:text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-100 border-purple-500/30">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code Input */}
          <div>
            <label className="text-sm text-gray-300">Paste Code</label>
            <Textarea
              className="w-full h-40 text-white bg-slate-900 border border-slate-700"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
            />
          </div>

          {/* Analyze Button */}
          <Button
            onClick={analyzeCode}
            disabled={isAnalyzing || code.trim().length === 0}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Analyzing...
              </>
            ) : (
              'Analyze Code'
            )}
          </Button>

          {/* Issues Output */}
          {issues.length > 0 ? (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getIssueIcon(issue.type)}
                      <span className="text-gray-300">
                        {issue.line !== '-' ? `Line ${issue.line}` : 'Unknown line'}
                      </span>
                    </div>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{issue.message}</p>
                </div>
              ))}
            </div>
          ) : !isAnalyzing && code.trim() !== '' ? (
            <div className="text-center py-4">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">No issues found in your code!</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white text-sm">Debugging Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Use console.log() statements to trace execution flow</p>
            <p>• Check for typos in variable and function names</p>
            <p>• Ensure all brackets and parentheses are properly closed</p>
            <p>• Verify data types match expected values</p>
            <p>• Test edge cases and boundary conditions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

