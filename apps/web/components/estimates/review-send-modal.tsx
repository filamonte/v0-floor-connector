"use client";

import { useState } from "react";
import { X, Mail, Globe, Download, FileText } from "lucide-react";

type ReviewSendModalProps = {
  open: boolean;
  onClose: () => void;
  estimateId: string;
  estimateTitle?: string;
  customerEmail?: string;
  onSendEmail?: (email: string, subject: string, message: string) => void;
  onSendPortal?: () => void;
  onDownloadPdf?: () => void;
};

export function ReviewSendModal({
  open,
  onClose,
  estimateId,
  estimateTitle = "Estimate",
  customerEmail = "",
  onSendEmail,
  onSendPortal,
  onDownloadPdf
}: ReviewSendModalProps) {
  const [email, setEmail] = useState(customerEmail);
  const [subject, setSubject] = useState(`Estimate: ${estimateTitle}`);
  const [message, setMessage] = useState(
    "Please find the attached estimate for your review. Let us know if you have any questions."
  );

  if (!open) return null;

  const handleSendEmail = () => {
    onSendEmail?.(email, subject, message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] overflow-hidden flex">
        {/* Left - PDF Preview */}
        <div className="w-[55%] border-r border-gray-200 bg-gray-100 flex flex-col">
          <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
            <span className="text-[14px] font-semibold text-gray-900">
              Preview
            </span>
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* PDF Preview Area */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="bg-white shadow-lg rounded-lg p-8 min-h-[600px]">
              {/* Placeholder for PDF */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {estimateTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Estimate #{estimateId}
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span>PDF preview would render here</span>
                </div>
                <p className="text-gray-400">
                  The full estimate document with all items, terms, scope, and pricing details will be shown in the final PDF.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Send Options */}
        <div className="w-[45%] flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-gray-900">
              Review and Send Estimate
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 p-6 space-y-4 overflow-auto">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Send To
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full h-10 px-3 text-[14px] border border-gray-300 rounded-md outline-none focus:border-[#ef7d32] focus:ring-2 focus:ring-[#ef7d32]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 px-3 text-[14px] border border-gray-300 rounded-md outline-none focus:border-[#ef7d32] focus:ring-2 focus:ring-[#ef7d32]/20 transition"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 text-[14px] border border-gray-300 rounded-md outline-none focus:border-[#ef7d32] focus:ring-2 focus:ring-[#ef7d32]/20 transition resize-none"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4" />

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#152c4a] text-white text-[14px] font-semibold rounded-md transition"
              >
                <Mail className="w-4 h-4" />
                Send via Email
              </button>

              <button
                type="button"
                onClick={onSendPortal}
                className="w-full h-11 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition"
              >
                <Globe className="w-4 h-4" />
                Send via Customer Portal
              </button>

              <button
                type="button"
                onClick={onDownloadPdf}
                className="w-full h-11 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-[14px] font-medium rounded-md hover:bg-gray-50 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
