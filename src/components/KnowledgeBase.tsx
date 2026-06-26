import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KnowledgeArticle } from '../types';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  Send, 
  HelpCircle, 
  FileText, 
  Plus, 
  X,
  History,
  ArrowRight
} from 'lucide-react';

interface KnowledgeBaseProps {
  articles: KnowledgeArticle[];
  onAddArticle: (article: KnowledgeArticle) => void;
}

export default function KnowledgeBase({ articles, onAddArticle }: KnowledgeBaseProps) {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(articles[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // AI Q&A states
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New article state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'policy' | 'procedure' | 'onboarding' | 'faq'>('policy');
  const [newContent, setNewContent] = useState('');

  // Filtering articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Q&A Submit
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiAnswer('');

    try {
      const res = await fetch('/api/gemini/policy-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          articles: articles
        })
      });

      if (!res.ok) throw new Error('Query failed');
      const data = await res.json();
      setAiAnswer(data.text);
    } catch (err) {
      console.error(err);
      setAiAnswer('Sorry, the Corporate Policy Intelligence engine encountered an issue. Please verify server connectivity or your API key settings.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newArt: KnowledgeArticle = {
      id: `article_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'Effer Operational Lead'
    };

    onAddArticle(newArt);
    setSelectedArticle(newArt);
    setIsAdding(false);
    
    // Reset
    setNewTitle('');
    setNewCategory('policy');
    setNewContent('');
  };

  // Simple, bulletproof markdown parser
  const renderSimpleMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-2xl font-semibold text-zinc-950 mt-6 mb-3 border-b border-zinc-100 pb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-medium text-zinc-900 mt-5 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-medium text-zinc-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} className="ml-5 list-disc text-zinc-600 my-1 leading-relaxed">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold text-zinc-800 my-2">{line.replaceAll('**', '')}</p>;
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-6 border-zinc-200" />;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={idx} className="italic text-zinc-500 text-xs my-2">{line.replaceAll('*', '')}</p>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-zinc-600 text-sm my-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar - Policy list & Search */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Knowledge & Policies</h3>
            <button
              onClick={() => setIsAdding(true)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              title="Add article"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Category Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-gray-100">
            {['all', 'policy', 'procedure', 'onboarding', 'faq'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold rounded-full border transition-all ${
                  categoryFilter === cat
                    ? 'bg-black border-black text-white'
                    : 'bg-gray-100 border-gray-200/50 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Article items list */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredArticles.map(art => (
              <button
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedArticle?.id === art.id
                    ? 'bg-[#F5F5F7] border-black shadow-xs'
                    : 'bg-white border-gray-100 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded tracking-wide font-bold border ${
                    art.category === 'policy' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                    art.category === 'procedure' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
                    art.category === 'onboarding' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
                    'bg-gray-100 text-gray-500 border-gray-200/30'
                  }`}>
                    {art.category}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 font-bold">{art.lastUpdated}</span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-1.5 line-clamp-1">{art.title}</h4>
                <p className="text-[10px] text-gray-400 mt-1">By {art.author}</p>
              </button>
            ))}
            {filteredArticles.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6 italic font-light">No articles found matching filters</p>
            )}
          </div>
        </div>

        {/* AI Policy Assistant Widget */}
        <div className="bg-[#1D1D1F] p-6 rounded-2xl text-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg text-amber-300">
              <Sparkles size={14} className="fill-amber-300 animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Corporate AI Auditor</h3>
              <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold">Policy Consultation Engine</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Ask any questions regarding work models, per diems, budgets, travel reimbursements, or tech configurations.
          </p>

          <form onSubmit={handleAISubmit} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask e.g. What is the flight upgrade policy?"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-white/10 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuery.trim()}
                className="absolute right-1 top-1 p-1.5 bg-white text-black rounded-lg hover:bg-gray-150 transition-colors disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </div>
          </form>

          {/* AI Response Output */}
          {(isAiLoading || aiAnswer) && (
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs space-y-2 mt-4 max-h-[220px] overflow-y-auto">
              <div className="flex justify-between items-center text-amber-300 font-mono text-[9px] tracking-wider uppercase font-bold">
                <span>AI Auditor Response</span>
                {isAiLoading && <span className="animate-pulse">Analyzing System...</span>}
              </div>
              {isAiLoading ? (
                <p className="text-gray-400 animate-pulse">Scanning policy documents & guidelines... synthesizing response...</p>
              ) : (
                <p className="text-gray-200 leading-relaxed whitespace-pre-line font-light">{aiAnswer}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Panel - Article viewer or draft form */}
      <div className="lg:col-span-8">
        {selectedArticle ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-xs min-h-[500px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Document Header Metadata */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-gray-50 text-gray-500 rounded border border-gray-200/50">
                      <BookOpen size={14} />
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded tracking-wider">{selectedArticle.category}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedArticle.title}</h1>
                </div>

                <div className="text-right text-xs text-gray-400 font-mono shrink-0">
                  <p className="flex items-center gap-1 justify-end font-bold"><History size={11} /> Updated {selectedArticle.lastUpdated}</p>
                  <p className="mt-0.5 font-bold">Author: {selectedArticle.author}</p>
                </div>
              </div>

              {/* Parsed Content */}
              <div className="prose prose-zinc max-w-none text-gray-700">
                {renderSimpleMarkdown(selectedArticle.content)}
              </div>
            </div>

            {/* Bottom Citation */}
            <div className="border-t border-gray-100 pt-6 mt-8 text-xs text-gray-400 flex items-center gap-2">
              <FileText size={14} className="text-gray-300" />
              <span className="font-light">This document serves as an official operating guideline of Effer Corp. All staff are bound by policy conditions.</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400 min-h-[500px] flex flex-col justify-center items-center">
            <BookOpen size={36} className="text-gray-300 mb-2" />
            <p className="text-sm font-light">Select an article from the index or create a new policy entry.</p>
          </div>
        )}
      </div>

      {/* Add Article Modal overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white shadow-2xl p-6 rounded-3xl border border-zinc-200"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-base font-sans font-medium text-zinc-950">Draft Corporate Policy / Doc</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Article Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Work Laptop Security Protocols"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="policy">Policy (Rules)</option>
                    <option value="procedure">Procedure (Steps)</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="faq">FAQ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-600">Content (Markdown supported)</label>
                  <span className="text-[10px] text-zinc-400 font-mono">Use # for Title, ## for headers, - for bullets</span>
                </div>
                <textarea
                  rows={10}
                  required
                  placeholder={`# Title\n\n## Section 1\nProvide details here...\n\n- Point one\n- Point two`}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-600 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs transition-colors"
                >
                  Publish to Suite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
