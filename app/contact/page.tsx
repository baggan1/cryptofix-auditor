'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Calendar, ArrowRight, Lock } from 'lucide-react';
import { PopupModal } from 'react-calendly';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import ContactFormModal from '@/components/ContactFormModal';

export default function ContactPage() {
  const [userInfo, setUserInfo] = useState<{name?: string, email?: string}>({});
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || '';

  useEffect(() => {
    // Set root element for Calendly portal
    if (typeof window !== 'undefined') {
      setRootElement(document.body);
    }

    const saved = localStorage.getItem('cryptofix_user_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserInfo(parsed);
        setHasSubmittedLead(true);
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
  }, []);

  const handleSchedule = () => {
    if (hasSubmittedLead) {
      setIsCalendlyOpen(true);
    } else {
      setIsCaptureModalOpen(true);
    }
  };

  const handleLeadCaptureSuccess = (info: { name: string, email: string }) => {
    setUserInfo(info);
    setHasSubmittedLead(true);
    // Optionally open the calendar immediately
    setTimeout(() => {
      setIsCalendlyOpen(true);
    }, 500);
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
        <button 
          onClick={() => setIsContactModalOpen(true)}
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
        </button>

        <button 
          onClick={handleSchedule}
          className="group block p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-brand-accent/30 hover:shadow-md transition-all text-center"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {hasSubmittedLead ? (
              <Calendar className="w-6 h-6 text-brand-accent" />
            ) : (
              <Lock className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {hasSubmittedLead ? 'Schedule a Call' : 'Book Consultation'}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {hasSubmittedLead 
              ? 'Book a 30-minute discovery session for your project'
              : 'Unlock the calendar by verifying your professional email'
            }
          </p>
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
            hasSubmittedLead 
              ? 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-brand-accent/20' 
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10'
          }`}>
            {hasSubmittedLead ? 'Schedule Consultation' : 'Verify Email to Book'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
      
      <div className="mt-24 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Opound LLC — Strategic FIX Protocol Advisory
        </p>
      </div>

      <EmailCaptureModal 
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        title="Verify Email to Book"
        description="Submit your details to unlock scheduling for custom audits and strategy calls."
        onSuccess={handleLeadCaptureSuccess}
      />

      <ContactFormModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {rootElement && hasSubmittedLead && CALENDLY_URL && (
        <PopupModal
          url={CALENDLY_URL}
          onModalClose={() => setIsCalendlyOpen(false)}
          open={isCalendlyOpen}
          rootElement={rootElement}
          prefill={{
            email: userInfo.email,
            name: userInfo.name,
          }}
        />
      )}
    </div>
  );
}
