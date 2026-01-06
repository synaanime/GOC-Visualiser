import React, { useState, useEffect } from 'react';
import { analyzeChemicalStructure } from './services/gemini';
import { EducationLevel, ChemicalData } from './types';
import DrawingCanvas from './components/DrawingCanvas';
import ResultCard from './components/ResultCard';
import { FlaskConical, Sparkles, AlertCircle, X, Moon, Sun } from 'lucide-react';

export default function App() {
  const [level, setLevel] = useState<EducationLevel>(EducationLevel.BOARD_LEVEL);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<ChemicalData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleAnalysis = async (imageData: string | null) => {
    // If explicit null is passed (from empty canvas) and no text, show error
    if (!imageData && !textInput.trim()) {
      setError("Please draw a structure or enter a name.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeChemicalStructure(imageData, textInput.trim() || null, level);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-12 print:bg-white print:pb-0 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 print:hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
                <FlaskConical size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">GOC Visualiser</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Master Organic Chemistry</p>
              </div>
            </div>
            {/* Mobile Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Desktop Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden md:block p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors mr-2"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg w-full md:w-auto transition-colors duration-300">
              <label htmlFor="level-select" className="text-sm font-medium text-slate-600 dark:text-slate-300 px-2 hidden sm:block whitespace-nowrap">
                Curriculum Level:
              </label>
              <select
                id="level-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
                className="bg-white dark:bg-slate-600 text-sm text-slate-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-indigo-500 rounded-md py-1.5 pl-3 pr-8 shadow-sm w-full md:w-auto cursor-pointer transition-colors"
              >
                {Object.values(EducationLevel).map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* Left Column: Input (Canvas + Text) */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            
            {/* Canvas Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col h-[500px] transition-colors duration-300">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                  Draw Structure
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  Touch enabled
                </span>
              </div>
              <DrawingCanvas 
                onCapture={handleAnalysis} 
                isProcessing={isProcessing}
              />
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 transition-colors"></div>
              <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">OR</span>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 transition-colors"></div>
            </div>

            {/* Text Input Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300">
               <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span>
                  Enter Name / Formula
               </h2>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={textInput}
                   onChange={(e) => {
                     setTextInput(e.target.value);
                     if (error) setError(null); // Clear error on typing
                   }}
                   placeholder="e.g. Benzene, C6H6, Aspirin..."
                   className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !isProcessing) {
                        handleAnalysis(null);
                     }
                   }}
                 />
                 <button
                   onClick={() => handleAnalysis(null)}
                   disabled={isProcessing || !textInput.trim()}
                   className="bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent dark:border-violet-800"
                 >
                   Go
                 </button>
               </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 print:w-full">
             {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 animate-fade-in mb-6 shadow-sm print:hidden">
                <AlertCircle className="mt-0.5 shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold">Analysis Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button 
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-700 dark:hover:text-red-200 transition-colors"
                    title="Dismiss"
                >
                    <X size={20} />
                </button>
              </div>
            )}

            {isProcessing && (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] print:hidden transition-colors duration-300">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-800 dark:text-slate-100">Analyzing Compound...</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                    Our AI is examining the structure and tailoring the explanation for {level}.
                  </p>
               </div>
            )}

            {!isProcessing && !result && !error && (
              <div className="bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] text-slate-400 dark:text-slate-500 print:hidden transition-colors duration-300">
                <FlaskConical size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Ready to Analyze</h3>
                <p className="max-w-sm mt-2">
                  Draw a chemical structure on the left or enter its name to get detailed insights tailored to your curriculum.
                </p>
              </div>
            )}

            {!isProcessing && result && (
              <ResultCard data={result} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}