import React, { useState } from 'react';
import { MerkatoTender, TrackedBid, TenderStage } from '../types/tender';
import {
  formatETB,
  formatDate,
  formatDateTime,
  calculateDaysRemaining,
  STAGE_META,
  CPO_STATUS_META,
} from '../utils/formatters';
import {
  X,
  ExternalLink,
  Building,
  Calendar,
  Clock,
  Shield,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  BookmarkPlus,
  Send,
  Plus,
  Trash2,
  Landmark,
} from 'lucide-react';

interface TenderDetailModalProps {
  tender: MerkatoTender | TrackedBid | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackTender: (tender: MerkatoTender) => void;
  onUpdateTrackedBid?: (updatedBid: TrackedBid) => void;
  isTracked: boolean;
  onDownloadPdf?: (bid: TrackedBid) => void;
}

export const TenderDetailModal: React.FC<TenderDetailModalProps> = ({
  tender,
  isOpen,
  onClose,
  onTrackTender,
  onUpdateTrackedBid,
  isTracked,
  onDownloadPdf,
}) => {
  if (!isOpen || !tender) return null;

  const trackedBid = isTracked ? (tender as TrackedBid) : null;
  const deadline = calculateDaysRemaining(tender.closingDate);

  // Local state for editing tracked bid fields
  const [stage, setStage] = useState<TenderStage>(trackedBid?.stage || 'lead');
  const [assignedTo, setAssignedTo] = useState<string>(trackedBid?.assignedTo || 'Jordan Zewdu');
  const [ourBidAmount, setOurBidAmount] = useState<number>(
    trackedBid?.ourBidAmountETB || tender.estimatedContractValueETB * 0.95
  );
  const [targetMargin, setTargetMargin] = useState<number>(trackedBid?.targetMarginPercent || 18.0);
  const [notes, setNotes] = useState<string>(trackedBid?.notes || '');
  const [submissionMethod, setSubmissionMethod] = useState(
    trackedBid?.submissionMethod || 'Physical Sealed Box'
  );

  const handleSaveTrackedChanges = () => {
    if (trackedBid && onUpdateTrackedBid) {
      onUpdateTrackedBid({
        ...trackedBid,
        stage,
        assignedTo,
        ourBidAmountETB: Number(ourBidAmount),
        targetMarginPercent: Number(targetMargin),
        notes,
        submissionMethod,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {tender.logo ? (
              <img
                src={tender.logo}
                alt={tender.organization}
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain rounded border border-neutral-200 bg-white p-0.5 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-neutral-200 border border-neutral-300 flex items-center justify-center font-bold text-xs shrink-0">
                {tender.organization.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                <span>{tender.organization}</span>
                <span className="font-mono text-neutral-400">·</span>
                <span className="font-mono text-[11px] text-neutral-500">{tender.procurementType}</span>
                <span className="font-mono text-neutral-400">·</span>
                <span className="text-[11px] text-neutral-500">{tender.region}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-950 truncate mt-0.5">
                {tender.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Amharic Title & Entity Translation */}
          {(tender.titleAmharic || tender.organizationAmharic) && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider block mb-1">
                Amharic Notice Details (የጨረታ ማስታወቂያ ዝርዝር)
              </span>
              {tender.titleAmharic && (
                <div className="text-xs font-amharic text-neutral-800 leading-relaxed">
                  {tender.titleAmharic}
                </div>
              )}
              {tender.organizationAmharic && (
                <div className="text-[11px] font-amharic text-neutral-600 mt-1">
                  አዘጋጅ መስሪያ ቤት፡ {tender.organizationAmharic}
                </div>
              )}
            </div>
          )}

          {/* Key Specifications Grid */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Procurement & Tender Fields
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-neutral-200 rounded-lg p-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Sector / Field</span>
                <span className="font-medium text-neutral-800 truncate block mt-0.5" title={tender.category}>
                  {tender.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Source Newspaper</span>
                <span className="font-medium text-neutral-800 block mt-0.5 truncate">
                  {tender.sourceMedia}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Est. Contract Budget</span>
                <span className="font-mono font-bold text-neutral-900 block mt-0.5 tabular-nums">
                  {formatETB(tender.estimatedContractValueETB)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Bid Bond (CPO)</span>
                <span className="font-mono font-bold text-amber-700 block mt-0.5 tabular-nums">
                  {formatETB(tender.bidBondAmountETB)}
                </span>
              </div>
            </div>
          </div>

          {/* Critical Deadlines Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Statutory Milestones & Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Publication Date</span>
                </div>
                <div className="font-mono font-semibold text-xs text-neutral-900">
                  {formatDate(tender.publishedAt)}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Official notice release</div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Bid Closing Deadline</span>
                </div>
                <div className="font-mono font-semibold text-xs text-neutral-900">
                  {formatDate(tender.closingDate)}
                </div>
                <div className={`text-[10px] font-medium mt-0.5 ${deadline.urgent ? 'text-rose-600' : 'text-neutral-500'}`}>
                  {deadline.text}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50">
                <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mb-1">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Bid Opening Session</span>
                </div>
                <div className="font-mono font-semibold text-xs text-neutral-900">
                  {formatDateTime(tender.openingDate)}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Public opening room</div>
              </div>
            </div>
          </div>

          {/* If already tracked in Pipeline: interactive bid management controls */}
          {trackedBid ? (
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Internal Pipeline Management & Pricing
                </h3>
                <span className="font-mono text-xs text-neutral-500">
                  Ref: <span className="font-bold text-neutral-800">{trackedBid.internalRefNo}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as TenderStage)}
                    className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    {Object.entries(STAGE_META).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.stepNumber}. {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Assigned Bid Manager
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Submission Method
                  </label>
                  <select
                    value={submissionMethod}
                    onChange={(e) => setSubmissionMethod(e.target.value as any)}
                    className="w-full text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="Physical Sealed Box">Physical Sealed Box (Onsite)</option>
                    <option value="Electronic FPPA e-GP Portal">Electronic FPPA e-GP Portal</option>
                    <option value="Courier">Express Courier with Delivery Proof</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Our Final Bid Offer (ETB)
                  </label>
                  <input
                    type="number"
                    value={ourBidAmount}
                    onChange={(e) => setOurBidAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Target Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Internal Proposal Notes & Qualification Strategy
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about OEM authorization, tender document queries, or technical qualifications..."
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                ></textarea>
              </div>
            </div>
          ) : (
            /* Prompt to Track in Pipeline */
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-emerald-950">
                  Ready to bid on this opportunity?
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Track this tender to unlock CPO bond management, compliance matrix, and stage workflows.
                </p>
              </div>

              <button
                onClick={() => {
                  onTrackTender(tender);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs shrink-0 ml-3"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                Track in Pipeline
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-neutral-50/70 shrink-0">
          <a
            href={tender.sourceUrl || 'https://tender.2merkato.com/tenders'}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1 font-medium transition-colors"
          >
            <span>View notice on 2merkato.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            {trackedBid && onDownloadPdf && (
              <button
                onClick={() => onDownloadPdf(trackedBid)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Full Dossier (PDF)
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Close
            </button>
            {trackedBid && (
              <button
                onClick={handleSaveTrackedChanges}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
