import React from 'react';
import { Mail, Calendar, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-navy-dark tracking-tight">
          Request a custom audit
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          For a full institutional FIX implementation review or fractional AI product leadership, reach out directly.
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

        <a 
          href="https://calendly.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all text-center"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-6 h-6 text-navy-dark" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Schedule a Call</h3>
          <p className="text-slate-500 text-sm mb-6">Book a 30-minute discovery session for your project</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm group-hover:bg-slate-200 transition-colors">
            View Calendar
          </div>
        </a>
      </div>
      
      <div className="mt-24 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Opound LLC — Strategic FIX Protocol Advisory
        </p>
      </div>
    </div>
  );
}
