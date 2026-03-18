'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Download, ShieldAlert, FileSearch, Zap, CheckCircle2, AlertTriangle, ChevronRight, UploadCloud } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

const SAMPLE_TEXT = `Artificial intelligence (AI) has become a transformative force across virtually every industry and academic discipline. Machine learning algorithms, a subset of AI, enable computers to learn from data without being explicitly programmed. Deep learning, which uses neural networks with multiple layers, has achieved remarkable breakthroughs in image recognition, natural language processing, and autonomous driving.

The history of artificial intelligence dates back to the 1950s when Alan Turing proposed the concept of a machine that could simulate any human intelligence. The term "artificial intelligence" was first coined at the Dartmouth Conference in 1956 by John McCarthy. Since then, the field has experienced several periods of rapid advancement and stagnation, often referred to as "AI winters."

In recent years, the development of transformer architectures has revolutionized natural language processing. Models like GPT, BERT, and T5 have demonstrated unprecedented capabilities in understanding and generating human language. These models are trained on vast amounts of text data and can perform a wide range of tasks, from translation to summarization to question answering.`;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('humanizer'); // 'humanizer' | 'scanner'
  const [inputText, setInputText] = useState('');
  
  // Humanizer State
  const [outputText, setOutputText] = useState('');
  const [humanizerStrength, setHumanizerStrength] = useState('Medium');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [humanizeProgress, setHumanizeProgress] = useState(null);
  const [finalWordCount, setFinalWordCount] = useState(0);

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [highlightedText, setHighlightedText] = useState(null); // Used to show highlights in viewer

  // UI
  const textInputRef = useRef(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Typewriter effect for humanized text
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (outputText && !isHumanizing) {
      // Trigger typewriter effect
      let i = 0;
      setDisplayedText('');
      const words = outputText.split(' ');
      const interval = setInterval(() => {
        if (i < words.length) {
          setDisplayedText(prev => prev + (prev ? ' ' : '') + words[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30); // 30ms per word
      return () => clearInterval(interval);
    }
  }, [outputText, isHumanizing]);

  // Handle Humanize
  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    setIsHumanizing(true);
    setOutputText('');
    setDisplayedText('');
    setHumanizeProgress({ progress: 0, message: 'Initializing humanizer...' });

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, strength: humanizerStrength })
      });
      const results = await response.json();
      
      // Since it's a mock we just simulate the progress bar smoothly before showing result
      for (let p = 10; p <= 100; p += 15) {
        setHumanizeProgress({ progress: p, message: p < 50 ? 'Increasing Perplexity...' : 'Varying Burstiness...' });
        await new Promise(r => setTimeout(r, 400));
      }
      
      setOutputText(results.humanizedText);
      setFinalWordCount(results.finalWordCount);
    } catch (error) {
      console.error('Humanize failed:', error);
    } finally {
      setIsHumanizing(false);
      setHumanizeProgress(null);
    }
  };

  // Handle Scan
  const handleScan = async () => {
    if (!inputText.trim() && !documentFile) return;
    setIsScanning(true);
    setScanResults(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText || 'Document text' })
      });
      const data = await response.json();
      setScanResults(data);
      
      // Simulate applying highlights over original text using mock data
      let highlighted = inputText || SAMPLE_TEXT;
      data.matches.forEach(m => {
        const color = m.type === 'plagiarism' ? 'bg-red-200 text-red-900' : 'bg-purple-200 text-purple-900';
        // Simple string replace for demonstration
        highlighted = highlighted.replace(m.text, `<mark id="${m.id}" class="rounded px-1 ${color} transition-all duration-300 ease-in-out cursor-pointer hover:ring-2 ring-indigo-400">${m.text}</mark>`);
      });
      setHighlightedText(highlighted);

    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const scrollToHighlight = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-indigo-500', 'scale-[1.02]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-indigo-500', 'scale-[1.02]'), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 shadow-md shadow-indigo-200">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Origin<span className="text-indigo-600">Check</span>
            </span>
          </div>
          
          <div className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-semibold text-slate-500">
            <button 
              onClick={() => setActiveTab('scanner')}
              className={cn("flex items-center gap-2 transition-all border-b-2 py-5 translate-y-[1px]", 
                activeTab === 'scanner' ? "text-indigo-600 border-indigo-600" : "border-transparent hover:text-slate-800")}
            >
              <FileSearch size={16} /> Integrity Scanner
            </button>
            <button 
              onClick={() => setActiveTab('humanizer')}
              className={cn("flex items-center gap-2 transition-all border-b-2 py-5 translate-y-[1px]", 
                activeTab === 'humanizer' ? "text-emerald-500 border-emerald-500" : "border-transparent hover:text-slate-800")}
            >
              <Zap size={16} /> AI Humanizer
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 border border-slate-300">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* --- HUMANIZER TAB --- */}
        {activeTab === 'humanizer' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col h-full flex-1 gap-4"
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600">Humanization Strength:</span>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {['Low', 'Medium', 'High'].map(level => (
                    <button
                      key={level}
                      onClick={() => setHumanizerStrength(level)}
                      className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", 
                        humanizerStrength === level ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleHumanize}
                disabled={!inputText.trim() || isHumanizing}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isHumanizing ? <Zap className="animate-pulse" size={16} /> : <Zap size={16} />}
                {isHumanizing ? 'Transforming...' : 'Humanize Text'}
              </button>
            </div>

            {/* Split Panels */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
              {/* Input Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300 transition-all overflow-hidden">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500">
                  <span>Input Text</span>
                  <span className="text-slate-400">{wordCount} words</span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste AI-generated text here, or try a sample..."
                  className="flex-1 w-full bg-transparent resize-none p-5 focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-400 text-base"
                />
                {!inputText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button 
                      onClick={() => setInputText(SAMPLE_TEXT)}
                      className="pointer-events-auto px-5 py-2 rounded-lg border border-slate-200 bg-white text-emerald-600 text-sm font-medium hover:bg-slate-50 shadow-sm transition-all"
                    >
                      Load Sample Text
                    </button>
                  </div>
                )}
              </div>

              {/* Output Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Humanized Output</span>
                  <span className="text-slate-400">{displayedText ? finalWordCount : 0} words</span>
                </div>
                
                <div className="flex-1 relative p-5 bg-emerald-50/10">
                  <AnimatePresence mode="wait">
                    {isHumanizing ? (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10"
                      >
                        <div className="w-16 h-16 relative mb-6">
                          <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing Perplexity & Burstiness</h3>
                        <p className="text-sm text-slate-500 mb-4">{humanizeProgress?.message || 'Processing...'}</p>
                        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-emerald-500" animate={{ width: `${humanizeProgress?.progress || 0}%` }} transition={{ ease: 'easeOut' }} />
                        </div>
                      </motion.div>
                    ) : displayedText ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto pr-2 pb-12">
                        <div className="whitespace-pre-wrap leading-relaxed text-base text-slate-700 font-medium">
                          {displayedText}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic text-sm">
                        Transformed text will appear here...
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Actions */}
                <div className="absolute bottom-4 right-5 flex gap-2">
                   <button className="p-2.5 bg-white text-slate-500 hover:text-emerald-600 rounded-lg shadow-sm border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-center">
                     <Copy size={16} />
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SCANNER TAB --- */}
        {activeTab === 'scanner' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px]"
          >
            {/* Document Viewer (Left) */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex justify-between items-center text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-500" /> Document Viewer
                </div>
                <button 
                  onClick={handleScan}
                  disabled={(!inputText.trim() && !documentFile) || isScanning}
                  className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 text-xs font-bold shadow-sm"
                >
                  {isScanning ? 'Scanning...' : 'Scan for Plagiarism / AI'}
                </button>
              </div>

              <div className="flex-1 relative">
                {isScanning ? (
                  <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-600 font-medium text-sm animate-pulse">Running Deep Integrity Scan...</p>
                  </div>
                ) : scanResults && highlightedText ? (
                  <div className="absolute inset-0 p-6 overflow-y-auto">
                    <div 
                      className="whitespace-pre-wrap leading-relaxed text-base text-slate-800 font-serif"
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste text here to scan, or upload a .pdf / .docx..."
                      className="w-full h-full bg-transparent resize-none p-2 focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-400 border border-dashed border-slate-300 rounded-xl hover:border-indigo-300 transition-colors focus:border-indigo-400"
                    />
                    {!inputText && (
                       <div className="absolute pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-3">
                         <UploadCloud size={32} className="text-slate-300" />
                         <span className="text-sm font-medium">Drag & Drop or Paste Text</span>
                         <button className="pointer-events-auto text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 font-semibold" onClick={() => setInputText(SAMPLE_TEXT)}>Use Sample text</button>
                       </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Match Overview Sidebar (Right) */}
            <div className="w-full lg:w-[400px] flex gap-4 flex-col">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Similarity Index</h3>
                
                <div className="relative w-48 h-48 mx-auto mb-6">
                  {scanResults ? (
                    <>
                      <Doughnut 
                        data={{
                          labels: ['Plagiarism', 'AI Probability', 'Original'],
                          datasets: [{
                            data: [scanResults.similarityScore, scanResults.aiProbability, 100 - (scanResults.similarityScore + scanResults.aiProbability)],
                            backgroundColor: ['#ef4444', '#a855f7', '#f1f5f9'],
                            borderWidth: 0,
                            cutout: '75%',
                            hoverOffset: 4
                          }]
                        }}
                        options={{ plugins: { legend: { display: false } } }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-3xl font-black text-slate-800">{scanResults.similarityScore + scanResults.aiProbability}%</span>
                         <span className="text-xs font-semibold text-slate-500">Non-Original</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                       <span className="text-slate-300 font-bold text-2xl">--%</span>
                    </div>
                  )}
                </div>

                {scanResults && (
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1 bg-red-50 p-3 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" /> 
                        <span className="text-xs font-bold text-red-800">Plagiarism</span>
                      </div>
                      <span className="text-xl font-bold text-red-600">{scanResults.similarityScore}%</span>
                    </div>
                    <div className="flex-1 bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500" /> 
                        <span className="text-xs font-bold text-purple-800">AI Logic</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">{scanResults.aiProbability}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Match Cards */}
              {scanResults?.matches && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                   <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="text-sm font-bold text-slate-800">Matched Sources</h3>
                   </div>
                   <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                     {scanResults.matches.map((match, idx) => (
                       <button 
                         key={match.id}
                         onClick={() => scrollToHighlight(match.id)}
                         className="text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col group bg-white"
                       >
                         <div className="flex justify-between items-start mb-2">
                           <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider", 
                             match.type === 'plagiarism' ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700")}>
                             {match.type === 'plagiarism' ? 'Internet Source' : 'AI Generation'}
                           </span>
                           <span className="text-xs font-bold text-slate-500">{match.matchPercentage}% match</span>
                         </div>
                         <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">"{match.text}"</p>
                         <div className="flex items-center text-xs text-indigo-600 font-semibold group-hover:text-indigo-700 mt-auto">
                           {match.source} <ChevronRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
