'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, Globe, Search } from 'lucide-react';

interface Exchange {
  name: string;
  slug: string;
  fixVersion: string;
  badges: string[];
}

const PRELOADED_EXCHANGES: Exchange[] = [
  { name: 'Kraken', slug: 'kraken', fixVersion: 'FIX 4.4', badges: ['Spot', 'Futures'] },
  { name: 'Coinbase Exchange', slug: 'coinbase-exchange', fixVersion: 'FIX 5.0', badges: ['Spot'] },
  { name: 'Coinbase Derivatives Exchange', slug: 'coinbase-derivatives', fixVersion: 'FIX 4.4', badges: ['Futures', 'CFTC'] },
];

interface ExchangeSelectorProps {
  selectedExchange: string;
  onSelect: (id: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onRunAudit: () => void;
  loading: boolean;
  pastedReady?: boolean;
  exchangeName?: string;
  onExchangeNameChange?: (name: string) => void;
}

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  selectedExchange,
  onSelect,
  url,
  onUrlChange,
  onRunAudit,
  loading,
  pastedReady = false,
  exchangeName,
  onExchangeNameChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setIsOpen(false);
  };

  const currentExchange = PRELOADED_EXCHANGES.find(e => e.slug === selectedExchange);

  const getBadgeColor = (fixVersion: string) => {
    switch (fixVersion) {
      case 'FIX 4.4': return 'bg-purple-100 text-purple-700';
      case 'FIX 5.0': return 'bg-blue-100 text-blue-700';
      case 'FIX 4.2': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (loading) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev < PRELOADED_EXCHANGES.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && focusedIndex < PRELOADED_EXCHANGES.length) {
        handleSelect(PRELOADED_EXCHANGES[focusedIndex].slug);
      } else if (!isOpen) {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Pre-loaded Audit
          </label>
          
          <div 
            className={`relative w-full h-14 bg-white border ${isOpen ? 'border-navy-dark ring-2 ring-navy-dark/10' : 'border-slate-200'} rounded-xl shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center outline-none`}
            tabIndex={loading ? -1 : 0}
            onClick={() => !loading && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="flex-1 px-12 truncate font-medium text-slate-900 select-none">
              {currentExchange ? (
                 <div className="flex items-center gap-2">
                   <span className="truncate">{currentExchange.name}</span>
                   <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold ${getBadgeColor(currentExchange.fixVersion)}`}>
                     {currentExchange.fixVersion}
                   </span>
                 </div>
              ) : (
                <span className="text-slate-400">Select an exchange...</span>
              )}
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {isOpen && (
            <ul 
              className="absolute z-10 w-full mt-2 py-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
              role="listbox"
            >
              <li 
                className="px-4 py-2 cursor-pointer hover:bg-slate-50 text-slate-500 font-medium"
                role="option"
                aria-selected={!selectedExchange}
                onClick={() => handleSelect('')}
              >
                Clear selection...
              </li>
              {PRELOADED_EXCHANGES.map((ex, idx) => (
                <li
                  key={ex.slug}
                  role="option"
                  aria-selected={selectedExchange === ex.slug}
                  className={`px-4 py-3 cursor-pointer select-none flex flex-col gap-1 transition-colors ${
                    focusedIndex === idx ? 'bg-slate-100' : 'hover:bg-slate-50'
                  } ${selectedExchange === ex.slug ? 'bg-navy-dark/5' : ''}`}
                  onClick={() => handleSelect(ex.slug)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{ex.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${getBadgeColor(ex.fixVersion)}`}>
                      {ex.fixVersion}
                    </span>
                    {ex.badges.map(b => (
                      <span key={b} className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-slate-200 text-slate-500 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Manual Audit
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter FIX spec URL..."
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-dark/10 focus:border-navy-dark font-medium text-slate-900 shadow-sm"
              disabled={loading}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Globe className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {url.trim().length > 0 && !selectedExchange && onExchangeNameChange && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Exchange Name
          </label>
          <input
            type="text"
            placeholder="e.g. Coinbase INTX"
            value={exchangeName || ''}
            onChange={(e) => onExchangeNameChange(e.target.value)}
            className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-dark/10 focus:border-navy-dark"
            disabled={loading}
          />
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onRunAudit}
          disabled={loading || (!selectedExchange && !url && !pastedReady)}
          className="bg-[#10B981] hover:bg-[#059669] text-white font-medium px-10 h-14 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/20 flex items-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Audit...
            </>
          ) : (
            selectedExchange ? 'View Scored Report' : 
            pastedReady ? 'Analyze Pasted Spec' : 'Run New Audit'
          )}
        </button>
      </div>
    </div>
  );
};

export default ExchangeSelector;
