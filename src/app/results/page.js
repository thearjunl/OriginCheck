'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavigationSidebar from '@/components/NavigationSidebar';
import DocumentPanel from '@/components/DocumentPanel';
import MatchOverview from '@/components/MatchOverview';
import { generateReport } from '@/lib/reportGenerator';

export default function ResultsPage() {
  const router = useRouter();
  const [scanResults, setScanResults] = useState(null);
  const [documentText, setDocumentText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [showHighlights, setShowHighlights] = useState(true);
  const [activeMatchIndex, setActiveMatchIndex] = useState(null);
  const [filters, setFilters] = useState({ excludeQuotes: false, excludeBibliography: false });
  const [isLoading, setIsLoading] = useState(true);

  // Load results from sessionStorage
  useEffect(() => {
    try {
      const storedResults = sessionStorage.getItem('origincheck_results');
      const storedText = sessionStorage.getItem('origincheck_text');
      const storedTitle = sessionStorage.getItem('origincheck_title');
      const storedFilters = sessionStorage.getItem('origincheck_filters');

      if (!storedResults || !storedText) {
        // If accessed directly without scanning, redirect to home
        router.push('/');
        return;
      }

      setScanResults(JSON.parse(storedResults));
      setDocumentText(storedText);
      setDocumentTitle(storedTitle || 'Untitled Document');

      if (storedFilters) {
        setFilters(JSON.parse(storedFilters));
      }
    } catch (error) {
      console.error('Failed to load scan results:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleDownloadReport = useCallback(() => {
    if (scanResults && documentText) {
      generateReport(scanResults, documentText, documentTitle);
    }
  }, [scanResults, documentText, documentTitle]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!scanResults) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 3-Column Layout */}
      <NavigationSidebar
        scanResults={scanResults}
        showHighlights={showHighlights}
        onToggleHighlights={() => setShowHighlights(!showHighlights)}
        excludeQuotes={filters.excludeQuotes}
        excludeBibliography={filters.excludeBibliography}
        onToggleExcludeQuotes={() => setFilters(f => ({ ...f, excludeQuotes: !f.excludeQuotes }))}
        onToggleExcludeBibliography={() => setFilters(f => ({ ...f, excludeBibliography: !f.excludeBibliography }))}
        onDownloadReport={handleDownloadReport}
      />

      {/* Document Viewer */}
      <DocumentPanel
        text={documentText}
        matches={scanResults.allMatches}
        activeMatchIndex={activeMatchIndex}
        showHighlights={showHighlights}
        onMatchClick={setActiveMatchIndex}
      />

      {/* Match Cards Sidebar */}
      <MatchOverview
        matches={scanResults.allMatches}
        activeMatchIndex={activeMatchIndex}
        onMatchClick={setActiveMatchIndex}
      />
    </div>
  );
}
