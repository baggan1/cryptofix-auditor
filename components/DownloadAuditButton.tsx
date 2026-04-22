'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import EmailCaptureModal from './EmailCaptureModal';

interface DownloadAuditButtonProps {
  exchangeName: string;
  auditSlug: string;
}

export default function DownloadAuditButton({ exchangeName, auditSlug }: DownloadAuditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-6 h-12 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
      >
        <FileText className="w-4 h-4" />
        Download RoE document
      </button>

      <EmailCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exchangeName={exchangeName}
        auditSlug={auditSlug}
      />
    </>
  );
}
