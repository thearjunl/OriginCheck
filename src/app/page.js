'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { humanizeText } from '@/lib/humanizer';

const SAMPLE_TEXT = `Artificial intelligence (AI) has become a transformative force across virtually every industry and academic discipline. Machine learning algorithms, a subset of AI, enable computers to learn from data without being explicitly programmed. Deep learning, which uses neural networks with multiple layers, has achieved remarkable breakthroughs in image recognition, natural language processing, and autonomous driving.

The history of artificial intelligence dates back to the 1950s when Alan Turing proposed the concept of a machine that could simulate any human intelligence. The term "artificial intelligence" was first coined at the Dartmouth Conference in 1956 by John McCarthy. Since then, the field has experienced several periods of rapid advancement and stagnation, often referred to as "AI winters."

In recent years, the development of transformer architectures has revolutionized natural language processing. Models like GPT, BERT, and T5 have demonstrated unprecedented capabilities in understanding and generating human language. These models are trained on vast amounts of text data and can perform a wide range of tasks, from translation to summarization to question answering.`;

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [finalWordCount, setFinalWordCount] = useState(0);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleScan = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsScanning(true);
    setOutputText('');
    setScanProgress({ progress: 0, message: 'Initializing humanizer...' });

    try {
      const results = await humanizeText(
        inputText,
        {},
        (progress) => setScanProgress(progress)
      );

      setOutputText(results.humanizedText);
      setOriginalWordCount(results.originalWordCount);
      setFinalWordCount(results.finalWordCount);
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  }, [inputText]);

  const loadSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      // Optional: Add a temporary "Copied!" toast here
    }
  };

  return (
    <div className="min-h-screen flex flex-col dot-grid" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top Navigation Bar */}
      <nav className="border-b bg-white relative z-10" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Origin<span className="text-teal-500">Check</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <button className="text-teal-600 font-semibold border-b-2 border-teal-500 pb-5 translate-y-[10px]">Humanizer</button>
            <button className="hover:text-slate-800 transition-colors">AI detector</button>
            <button className="hover:text-slate-800 transition-colors">Plagiarism checker</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Log in
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 text-white hover:bg-teal-600 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        
        {/* Modes Bar */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['Standard', 'Academic', 'Simple', 'Flowing', 'Informal', 'Formal', 'Expand'].map((mode, i) => (
            <button 
              key={mode}
              className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${i === 0 ? 'bg-white border border-slate-200 text-slate-800 font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {mode}
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-3 pl-4 border-l border-slate-200">
            <span className="text-sm text-slate-600 font-medium mr-2">Ultra run</span>
            <label className="flex items-center cursor-pointer">
              <button className="toggle-switch" disabled />
            </label>
          </div>
        </div>

        {/* Side-by-Side Editor Panels */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[550px]">
          
          {/* Left Panel: Input */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-300 transition-all">
            <div className="p-5 flex-1 relative flex flex-col">
              {inputText && (
                <button 
                  onClick={handleClear}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors z-10"
                  title="Clear text"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Insert (English) text here..."
                className="flex-1 w-full bg-transparent resize-none focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-400 z-0 text-[15px]"
              />
              
              {!inputText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button 
                    onClick={loadSample}
                    className="pointer-events-auto px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2 group"
                  >
                    Try a sample
                    <svg className="text-teal-500 group-hover:rotate-12 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-500 w-full sm:w-auto">
                {wordCount} words
              </span>
              <button
                onClick={handleScan}
                disabled={!inputText.trim() || isScanning}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:brightness-105 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {isScanning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing text...
                  </>
                ) : (
                  'Humanize AI'
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 processing-overlay flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing your text</h3>
                  <p className="text-sm text-slate-500 mb-4">{scanProgress?.message || 'Transforming vocabulary...'}</p>
                  
                  <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-teal-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${scanProgress?.progress || 0}%` }}
                      transition={{ ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ) : outputText ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px] text-slate-700 font-medium">
                      {outputText}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 p-5 text-slate-400 leading-relaxed text-[15px]"
                >
                  Paraphrased text will appear here...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Status Bar for output panel */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between mt-auto z-20">
              <span className="text-sm font-medium text-slate-500">
                {outputText ? finalWordCount : 0} words
              </span>
              
              {outputText && (
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100" 
                    title="Copy text"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100" title="Download (.txt)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OriginCheck. We use cookies to ensure that we give you the best experience on our website.
      </footer>
    </div>
  );
}
