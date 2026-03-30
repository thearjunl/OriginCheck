'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Download, ShieldAlert, FileSearch, Zap, CheckCircle2, AlertTriangle, ChevronRight, UploadCloud, ImageIcon } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

// Sanitize HTML to prevent XSS when using dangerouslySetInnerHTML
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [detectedImages, setDetectedImages] = useState(null); // { count, pages }

  // UI
  const textInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  // Typewriter effect for humanized text
  const [displayedText, setDisplayedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (outputText && !isHumanizing) {
      // Trigger typewriter effect
      let i = 0;
      setDisplayedText('');
      const words = outputText.split(' ');
      const interval = setInterval(() => {
        if (i < words.length) {
          const currentWord = words[i]; // capture before increment to avoid closure bug
          i++;
          setDisplayedText(prev => prev + (prev ? ' ' : '') + (currentWord || ''));
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
      // Run progress animation concurrently with the API call
      const progressMessages = [
        'Analyzing text patterns...', 'Increasing Perplexity...', 
        'Varying Burstiness...', 'Restructuring sentences...', 'Finalizing...'
      ];
      let progressCancelled = false;
      const progressAnimation = (async () => {
        for (let p = 10; p <= 85; p += 12) {
          if (progressCancelled) break;
          const msgIdx = Math.min(Math.floor(p / 20), progressMessages.length - 1);
          setHumanizeProgress({ progress: p, message: progressMessages[msgIdx] });
          await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
        }
      })();

      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, strength: humanizerStrength })
      });
      const results = await response.json();
      progressCancelled = true;

      setHumanizeProgress({ progress: 100, message: 'Done!' });
      await new Promise(r => setTimeout(r, 300));
      
      const safeText = (results.humanizedText || '').replace(/\s*undefined$/i, '').trim();
      setOutputText(safeText);
      setFinalWordCount(results.finalWordCount);
    } catch (error) {
      console.error('Humanize failed:', error);
      setErrorMessage('Failed to humanize text. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
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
      
      // Sanitize text before injecting as HTML to prevent XSS
      let highlighted = escapeHtml(inputText || SAMPLE_TEXT);
      data.matches.forEach(m => {
        const color = m.type === 'plagiarism' ? 'bg-red-200 text-red-900' : 'bg-purple-200 text-purple-900';
        const safeText = escapeHtml(m.text);
        highlighted = highlighted.replace(safeText, `<mark id="${escapeHtml(m.id)}" class="rounded px-1 ${color} transition-all duration-300 ease-in-out cursor-pointer hover:ring-2 ring-indigo-400">${safeText}</mark>`);
      });
      setHighlightedText(highlighted);

    } catch (error) {
      console.error('Scan failed:', error);
      setErrorMessage('Failed to scan document. Please try again.');
      setTimeout(() => setErrorMessage(null), 5000);
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

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const parsePDFClientSide = async (file) => {
    try {
      // Use minified build to avoid Turbopack optional module errors (e.g. canvas)
      const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        verbosity: 0,
      });
      const pdf = await loadingTask.promise;
      let fullText = '';
      let imageCount = 0;
      const imagePages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';

        // Detect images using the operator list
        try {
          const ops = await page.getOperatorList();
          let pageImageCount = 0;
          for (let j = 0; j < ops.fnArray.length; j++) {
            // OPS.paintImageXObject = 85, OPS.paintJpegXObject = 82, OPS.paintImageMaskXObject = 83
            if (ops.fnArray[j] === 85 || ops.fnArray[j] === 82 || ops.fnArray[j] === 83) {
              pageImageCount++;
            }
          }
          if (pageImageCount > 0) {
            imageCount += pageImageCount;
            imagePages.push({ page: i, count: pageImageCount });
          }
        } catch (imgErr) {
          console.warn(`Image detection failed on page ${i}:`, imgErr);
        }
      }

      if (imageCount > 0) {
        setDetectedImages({ count: imageCount, pages: imagePages });
      } else {
        setDetectedImages(null);
      }

      if (!fullText.trim()) {
        throw new Error('No text content found in PDF');
      }
      return fullText.trim();
    } catch (error) {
      console.error('PDF parse error:', error);
      throw new Error('Failed to parse PDF: ' + (error.message || 'Unknown error'));
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsParsing(true);
    setDocumentFile(file);
    try {
      const fileName = file.name.toLowerCase();
      let text = '';

      if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
        text = await parsePDFClientSide(file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/parse', {
          method: 'POST',
          body: formData,
        });
        
        const data = await res.json();
        if (res.ok) {
          text = data.text;
        } else {
          throw new Error(data.error || 'Failed to parse file');
        }
      }

      setInputText(text);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error parsing file');
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Generate PDF Report using jsPDF
  const generatePDFReport = async () => {
    if (!scanResults) return;
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const addPageIfNeeded = (neededSpace = 30) => {
      if (y + neededSpace > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('OriginCheck', margin, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Integrity Scan Report', margin, 28);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 36);

    y = 55;
    doc.setTextColor(30, 41, 59);

    // Summary Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Scan Summary', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'FD');

    const col1 = margin + 8;
    const col2 = margin + contentWidth / 3 + 4;
    const col3 = margin + (contentWidth / 3) * 2 + 4;

    y += 14;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text('SIMILARITY SCORE', col1, y);
    doc.text('AI PROBABILITY', col2, y);
    doc.text('WORD COUNT', col3, y);
    y += 10;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text(`${scanResults.similarityScore}%`, col1, y);
    doc.setTextColor(168, 85, 247);
    doc.text(`${scanResults.aiProbability}%`, col2, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`${scanResults.wordCount}`, col3, y);
    y += 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Source: ${scanResults.sources?.plagiarismSearch || 'N/A'}`, col1, y);
    doc.text(`Source: ${scanResults.sources?.aiDetection || 'N/A'}`, col2, y);

    y += 20;

    // Image Detection Section
    if (detectedImages && detectedImages.count > 0) {
      addPageIfNeeded(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Image Detection', margin, y);
      y += 8;

      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(253, 224, 71);
      doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(146, 64, 14);
      doc.text(`${detectedImages.count} image(s) detected across ${detectedImages.pages.length} page(s)`, margin + 8, y + 9);
      doc.setFontSize(8);
      const pageList = detectedImages.pages.map(p => `Page ${p.page} (${p.count})`).join(', ');
      doc.text(`Pages: ${pageList}`, margin + 8, y + 17);
      y += 32;
    }

    // Matched Sources
    if (scanResults.matches && scanResults.matches.length > 0) {
      addPageIfNeeded(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Matched Sources', margin, y);
      y += 10;

      scanResults.matches.forEach((match, idx) => {
        addPageIfNeeded(45);
        
        const isPlagiarism = match.type === 'plagiarism';
        doc.setFillColor(isPlagiarism ? 254 : 250, isPlagiarism ? 242 : 245, isPlagiarism ? 242 : 255);
        doc.setDrawColor(isPlagiarism ? 252 : 233, isPlagiarism ? 165 : 213, isPlagiarism ? 165 : 255);
        doc.roundedRect(margin, y, contentWidth, 35, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isPlagiarism ? 185 : 126, isPlagiarism ? 28 : 34, isPlagiarism ? 28 : 206);
        doc.text(`${isPlagiarism ? 'INTERNET SOURCE' : 'AI GENERATION'}  |  ${match.matchPercentage}% match`, margin + 6, y + 8);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const snippetLines = doc.splitTextToSize(`"${match.text}"`, contentWidth - 16);
        doc.text(snippetLines.slice(0, 2), margin + 6, y + 16);

        doc.setTextColor(79, 70, 229);
        doc.setFontSize(7);
        const sourceText = String(match.source || '').substring(0, 80);
        doc.text(sourceText, margin + 6, y + 30);

        y += 40;
      });
    } else {
      addPageIfNeeded(20);
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('No matched sources found.', margin, y);
      y += 15;
    }

    // Footer on last page
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by OriginCheck — Integrity Scanner', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`OriginCheck_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="OriginCheck Logo" width={160} height={40} className="h-10 w-auto object-contain drop-shadow-sm" />
            <span className="font-bold text-xl text-slate-800">OriginCheck</span>
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
              </div>

              {/* Output Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Humanized Output</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{displayedText ? finalWordCount : 0} words</span>
                    <button 
                      onClick={handleCopy}
                      disabled={!displayedText}
                      className="p-1.5 bg-white text-slate-500 hover:text-emerald-600 rounded-md shadow-sm border border-slate-200 hover:border-emerald-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
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
                ) : isParsing ? (
                  <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-600 font-medium text-sm animate-pulse">Extracting Document Text...</p>
                  </div>
                ) : (
                  <div 
                    className={`absolute inset-0 p-6 flex flex-col items-center justify-center transition-all ${isDragging ? 'bg-indigo-50/50' : ''}`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                  >
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder=""
                      className={`w-full h-full bg-transparent resize-none p-2 focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-400 border border-dashed rounded-xl transition-colors ${isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-300 hover:border-indigo-300 focus:border-indigo-400'}`}
                    />
                    {!inputText && (
                       <div className="absolute pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-3">
                         <UploadCloud size={32} className={`transition-colors ${isDragging ? 'text-indigo-500' : 'text-slate-300'}`} />
                         <span className="text-sm font-medium">{isDragging ? 'Drop file here!' : 'Drag & Drop or Paste Text'}</span>
                         <label className="pointer-events-auto cursor-pointer text-xs px-4 py-1.5 bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 rounded-full text-slate-600 font-semibold transition-all">
                           Select File
                           <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileSelect} />
                         </label>
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

                {/* Image Detection Indicator */}
                {detectedImages && detectedImages.count > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon size={14} className="text-amber-600" />
                      <span className="text-xs font-bold text-amber-800">Images Detected</span>
                    </div>
                    <span className="text-sm font-semibold text-amber-700">{detectedImages.count} image{detectedImages.count !== 1 ? 's' : ''}</span>
                    <span className="text-xs text-amber-600 ml-1">across {detectedImages.pages.length} page{detectedImages.pages.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Download Report Button */}
                {scanResults && (
                  <button
                    onClick={generatePDFReport}
                    className="w-full mt-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Report (PDF)
                  </button>
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
                         <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">&quot;{match.text}&quot;</p>
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

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500">
          Crafted with <span className="text-pink-500 animate-pulse">❤️</span> by <span className="text-slate-700 font-bold">Arjun L</span>
        </div>
      </footer>
    </div>
  );
}
