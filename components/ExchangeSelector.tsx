'use client';

import React from 'react';
import { ChevronDown, Globe, Search } from 'lucide-react';

interface Exchange {
  id: string;
  name: string;
}

const PRELOADED_EXCHANGES: Exchange[] = [
  { id: 'kraken', name: 'Kraken' },
  { id: 'coinbase-exchange', name: 'Coinbase Exchange' },
];

interface ExchangeSelectorProps {
  selectedExchange: string;
  onSelect: (id: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onRunAudit: () => void;
  loading: boolean;
}

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  selectedExchange,
  onSelect,
  url,
  onUrlChange,
  onRunAudit,
  loading
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Pre-loaded Audit
          </label>
          <div className="relative">
            <select
              value={selectedExchange}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full h-14 pl-12 pr-10 bg-white border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-navy-dark/10 focus:border-navy-dark font-medium text-slate-900 shadow-sm"
              disabled={loading}
            >
              <option value="">Select an exchange...</option>
              {PRELOADED_EXCHANGES.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </div>
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

      <div className="flex justify-center">
        <button
          onClick={onRunAudit}
          disabled={loading || (!selectedExchange && !url)}
          className="h-14 px-10 bg-navy-dark text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-navy-dark/20 flex items-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running Audit...
            </>
          ) : (
            selectedExchange ? 'View Scored Report' : 'Run New Audit'
          )}
        </button>
      </div>
    </div>
  );
};

export default ExchangeSelector;
