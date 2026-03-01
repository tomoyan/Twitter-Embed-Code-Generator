/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Twitter, Copy, Check, ExternalLink, Loader2, AlertCircle, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmbedData {
  html: string;
  author_name: string;
  author_url: string;
  provider_name: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedData, setEmbedData] = useState<EmbedData | null>(null);
  const [copied, setCopied] = useState(false);

  const clearForm = () => {
    setUrl('');
    setError(null);
    setEmbedData(null);
    setCopied(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Basic validation
    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      setError('Please enter a valid X (Twitter) URL');
      return;
    }

    setLoading(true);
    setError(null);
    setEmbedData(null);

    try {
      const response = await fetch(`/api/embed?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate embed code');
      }

      setEmbedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (embedData?.html) {
      navigator.clipboard.writeText(embedData.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Inject Twitter widgets script when embedData changes to render the preview
  useEffect(() => {
    if (embedData) {
      const script = document.createElement('script');
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Optional: cleanup script if needed, though widgets.js is usually fine to stay
      };
    }
  }, [embedData]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black text-white shadow-sm shrink-0"
            >
              <Twitter size={24} />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold tracking-tight"
            >
              Embed Code Generator
            </motion.h1>
          </div>
        </header>

        {/* Main Input Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 mb-8"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label htmlFor="tweet-url" className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Post URL
              </label>
              <div className="relative group">
                <input
                  id="tweet-url"
                  type="text"
                  placeholder="https://x.com/username/status/123456789"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={clearForm}
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-lg placeholder:text-zinc-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Code size={20} />
                  Generate Embed Code
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-start gap-3"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {embedData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            >
              {/* Code Output */}
              <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-700/50 flex items-center justify-between">
                  <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Embed HTML</span>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    {copied ? (
                      <><Check size={16} className="text-emerald-400" /> Copied!</>
                    ) : (
                      <><Copy size={16} /> Copy Code</>
                    )}
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
                    {embedData.html}
                  </pre>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Live Preview</h2>
                  <a 
                    href={embedData.author_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-black transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                <div className="flex justify-center overflow-hidden rounded-xl bg-zinc-50 p-4 min-h-[200px]">
                  <div 
                    dangerouslySetInnerHTML={{ __html: embedData.html }} 
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-24 pt-8 border-t border-zinc-200 text-center">
          <p className="text-zinc-400 text-sm">
            Powered by X oEmbed API. Built for speed and simplicity.
          </p>
        </footer>
      </div>
    </div>
  );
}
