import React, { useState } from 'react';
import { FileText, Music, Youtube, Sparkles, History, Loader2, ArrowLeft, Terminal, MessageSquare } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { SummaryConfig } from './components/SummaryConfig';
import { SummaryResult } from './components/SummaryResult';
import { Button } from './components/Button';
import { summarizeContent, SummaryStyle, SummaryLength } from './services/gemini';
import { cn } from './lib/utils';

type SourceType = 'pdf' | 'audio' | 'youtube' | 'text' | null;

export default function App() {
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [style, setStyle] = useState<SummaryStyle>('bullet points');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [history, setHistory] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('aura_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (type: string, source: string, result: string) => {
    const newEntry = { id: Date.now(), type, source, result, date: new Date().toISOString() };
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('aura_history', JSON.stringify(updated));
  };

  const handleProcess = async () => {
    if ((!selectedFile && !selectedUrl && !rawText) || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      let content: string | { mimeType: string; data: string };

      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        content = {
          mimeType: selectedFile.type,
          data: base64,
        };
      } else if (sourceType === 'text') {
        content = rawText;
      } else {
        content = `Summarize the YouTube video at this URL: ${selectedUrl}`;
      }

      const res = await summarizeContent(content, { style, length });
      setSummary(res || "Failed to generate summary.");
      saveToHistory(sourceType!, selectedFile ? selectedFile.name : (sourceType === 'text' ? rawText.slice(0, 30) + '...' : selectedUrl), res || "");
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please ensure your file size is under 20MB and your API key is active.");
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const reset = () => {
    setSummary(null);
    setSelectedFile(null);
    setSelectedUrl('');
    setRawText('');
    setSourceType(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-bg text-text-primary">
      {/* Sidebar */}
      <nav className="w-64 bg-sidebar-bg border-r border-border flex flex-col p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-text-primary">Synapse AI</h1>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Summarize</h2>
            {[
              { id: 'youtube', label: 'YouTube Video', icon: Youtube },
              { id: 'pdf', label: 'PDF Document', icon: FileText },
              { id: 'audio', label: 'Audio Recording', icon: Music },
              { id: 'text', label: 'Plain Text', icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSourceType(item.id as SourceType);
                  setSummary(null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  sourceType === item.id 
                    ? "bg-blue-50 text-accent" 
                    : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Recent</h2>
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSummary(entry.result);
                    setSourceType(entry.type);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-all text-left"
                >
                  <History className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{entry.source}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border mt-auto">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-slate-50 transition-all font-medium">
            <Terminal className="w-4 h-4" />
            System Ready
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[72px] px-10 border-b border-border bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">AI Engine Active</span>
          </div>
          
          {sourceType && (
            <div className="text-sm font-medium text-text-secondary">
              Mode: <span className="text-text-primary capitalize">{sourceType}</span>
            </div>
          )}
          
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {!summary ? (
              <>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                    Quantum Summarization
                  </h2>
                  <p className="text-text-secondary">
                    Select a source from the sidebar and upload your content to generate deep insights.
                  </p>
                </div>

                {sourceType ? (
                  <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-border card-shadow flex gap-4 items-center">
                      <div className="flex-1">
                        {sourceType === 'text' ? (
                          <textarea
                            placeholder="Paste your text here..."
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            className="w-full h-32 p-4 bg-slate-50 border border-border rounded-xl text-sm text-text-primary placeholder:text-slate-400 focus:bg-white focus:border-accent outline-none transition-all resize-none shadow-inner"
                          />
                        ) : (
                          <FileUploader 
                            type={sourceType as any}
                            selectedFile={selectedFile}
                            selectedUrl={selectedUrl}
                            onFileSelect={setSelectedFile}
                            onUrlSubmit={setSelectedUrl}
                            onClear={() => {
                              setSelectedFile(null);
                              setSelectedUrl('');
                            }}
                          />
                        )}
                      </div>
                      {(selectedFile || selectedUrl || rawText) && (
                        <Button 
                          onClick={handleProcess}
                          isLoading={isProcessing}
                          size="lg"
                        >
                          Generate Summary
                        </Button>
                      )}
                    </div>

                    <SummaryConfig 
                      style={style} setStyle={setStyle}
                      length={length} setLength={setLength}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    <div className="p-8 bg-white rounded-2xl border border-border card-shadow text-center space-y-4">
                      <div className="w-12 h-12 bg-blue-50 text-accent rounded-xl flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg">Instant Synthesis</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Convert long-form transcripts and documents into actionable bullet points or executive briefs.
                      </p>
                    </div>
                    <div className="p-8 bg-white rounded-2xl border border-border card-shadow text-center space-y-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg">Interactive Chat</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Query your data directly. Find specific citations, check sentiments, and extract key metrics.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={reset}
                      className="p-2 rounded-lg bg-white border border-border text-text-secondary hover:bg-slate-50 transition-all card-shadow"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-text-primary tracking-tight leading-none mb-1">Results Generated</h2>
                      <p className="text-xs text-text-secondary font-semibold uppercase tracking-widest">{sourceType} Analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm">Export Report</Button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <SummaryResult 
                    summary={summary} 
                    sourceType={sourceType || 'content'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
