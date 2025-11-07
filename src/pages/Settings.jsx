import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Key, Brain, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [anthropicKey, setAnthropicKey] = useState(localStorage.getItem('anthropic_api_key') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [selectedProvider, setSelectedProvider] = useState(localStorage.getItem('ai_provider') || 'openai');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('ai_model') || 'gpt-4');

  const aiProviders = {
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ],
    },
    anthropic: {
      name: 'Anthropic',
      models: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
      ],
    },
    gemini: {
      name: 'Google Gemini',
      models: [
        { id: 'gemini-2.5-flash', name: 'Gemini Flash 2.5' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        { id: 'gemini-pro', name: 'Gemini Pro' },
      ],
    },
  };

  const handleSave = () => {
    localStorage.setItem('openai_api_key', openaiKey);
    localStorage.setItem('anthropic_api_key', anthropicKey);
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('ai_provider', selectedProvider);
    localStorage.setItem('ai_model', selectedModel);

    toast.success('Settings saved successfully!');
    // Notify other parts of the app
    window.dispatchEvent(new Event('ai-settings-updated'));

  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    const firstModel = aiProviders[provider].models[0].id;
    setSelectedModel(firstModel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      <Header />
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white dark:text-gray-100">Settings</h1>
          <p className="text-cyan-400 dark:text-cyan-300">Configure your AI Code Generator preferences</p>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 dark:bg-black/40 border border-purple-500/20">
            <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400 text-gray-300 dark:text-gray-400">
              <Brain className="w-4 h-4 mr-2" />
              AI Configuration
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400 text-gray-300 dark:text-gray-400">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-black/20 dark:bg-black/40 border border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  API Keys
                </CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-500">
                  Configure your AI provider API keys for code generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key" className="text-cyan-400 dark:text-cyan-300">OpenAI API Key</Label>
                  <Input id="openai-key" type="password" placeholder="sk-..." value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anthropic-key" className="text-cyan-400 dark:text-cyan-300">Anthropic API Key</Label>
                  <Input id="anthropic-key" type="password" placeholder="sk-ant-..." value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gemini-key" className="text-cyan-400 dark:text-cyan-300">Google Gemini API Key</Label>
                  <Input id="gemini-key" type="password" placeholder="AIza..." value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 dark:bg-black/40 border border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white dark:text-gray-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Model Selection
                </CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-500">
                  Choose your preferred AI provider and model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-cyan-400 dark:text-cyan-300">AI Provider</Label>
                  <Select value={selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(aiProviders).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>{provider.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-cyan-400 dark:text-cyan-300">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders[selectedProvider].models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="bg-black/20 dark:bg-black/40 border border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white dark:text-gray-100">Theme Settings</CardTitle>
                <CardDescription className="text-gray-400 dark:text-gray-500">
                  Customize the appearance of your code generator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 dark:text-gray-500">Theme customization options coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="bg-purple-500/20" />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
