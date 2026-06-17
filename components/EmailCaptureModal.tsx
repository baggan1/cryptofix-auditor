'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Loader2 } from 'lucide-react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeName?: string;
  auditSlug?: string;
  title?: string;
  description?: string;
  onSuccess?: (info: { name: string; email: string }) => void;
}

const roles = [
  'Institutional investor',
  'Exchange/venue',
  'Consultant/advisor',
  'Developer',
  'Other'
];

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  exchangeName, 
  auditSlug,
  title = "Get the full RoE report",
  description = "Free — takes 10 seconds",
  onSuccess
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          company,
          role,
          exchange_name: exchangeName,
          audit_slug: auditSlug,
          opt_in: optIn,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      // Save to localStorage for pre-filling Calendly (and gating)
      localStorage.setItem('cryptofix_user_info', JSON.stringify({
        email,
        name: fullName
      }));

      if (onSuccess) {
        onSuccess({ name: fullName, email });
      }

      // Only open report if auditSlug is present
      if (auditSlug) {
        window.open(`/audit/${auditSlug}/report`, '_blank');
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-navy-dark tracking-tight mb-1">
              {title}
            </h2>
            <p className="text-slate-500 text-sm font-medium">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-slate-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-slate-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Company name <span className="text-slate-300 font-normal">(Optional)</span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Trading"
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-slate-900 font-medium"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                I am a...
              </label>
              <select
                id="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-slate-900 font-medium appearance-none"
              >
                <option value="" disabled>Select your role</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                id="opt_in"
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
              />
              <label htmlFor="opt_in" className="text-xs text-slate-500 leading-relaxed font-medium">
                Send me updates on new exchange audits and institutional FIX standards
              </label>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#C8963E] hover:bg-[#B08332] disabled:bg-[#C8963E]/40 text-[#0D1B3E] rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#C8963E]/20 transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Get Report
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
