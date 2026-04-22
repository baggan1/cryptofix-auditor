'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Calendar, ArrowRight } from 'lucide-react';
import { openPopupWidget } from 'react-calendly';

export default function ContactPage() {
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string}>({});

  useEffect(() => {
    const saved = localStorage.getItem('cryptofix_user_info');
    if (saved) {
      try {
        setUserInfo(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
  }, []);

  const handleSchedule = () => {
    openPopupWidget({
      url: 'https://calendly.com/navilla-bagga/30min',
      prefill: {
        email: userInfo.email,
        name: userInfo.name,
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-navy-dark tracking-tight">
          Institutional-Grade FIX Audits & Strategy
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Deep-dive technical reviews for venues, institutional desks, and digital asset infrastructure. Let’s discuss your custom audit requirements or fractional product leadership needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <a 
          href="mailto:navilla@opound.com"
          className="group block p-8 bg-navy-dark text-white rounded-3xl shadow-xl shadow-navy-dark/20 hover:scale-[1.02] transition-transform text-center"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Email Us</h3>
          <p className="text-slate-300 text-sm mb-6">Inquiries for custom exchange audits and consulting</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-dark rounded-xl font-bold text-sm">
            navilla@opound.com
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        <button 
          onClick={handleSchedule}
          className="group block p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all text-center"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-6 h-6 text-navy-dark" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule a Call</h3>
          <p className="text-slate-500 text-sm mb-6">Book a 30-minute discovery session for your project</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-xl font-bold text-sm hover:bg-brand-accent-hover transition-colors shadow-lg shadow-brand-accent/20">
            Schedule Consultation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
      
      <div className="mt-24 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Opound LLC — Strategic FIX Protocol Advisory
        </p>
      </div>
    </div>
  );
}
