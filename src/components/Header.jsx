import { Code2, Sparkles, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <Code2 className="h-8 w-8 text-cyan-400" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Infinite Code IDE
            </h1>
            <p className="text-sm text-cyan-400">
              Generate, Edit, Run & Analyze Code
            </p>
          </div>
        </Link>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-300">
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Generator</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Editor</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Analyzer</span>
            </span>
          </div>
          
          <Link to="/settings">
            <Button 
              variant={location.pathname === '/settings' ? 'default' : 'ghost'} 
              size="sm"
              className={`${
                location.pathname === '/settings' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-400/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
