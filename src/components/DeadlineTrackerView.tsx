import React, { useState, useEffect } from 'react';
import { TrackedBid, CompanyProfile, UploadedDocument, KeyPersonnel, PastExperience, AuditReport, TechnicalOfferItem } from '../types/tender';
import { formatETB, formatDate, formatDateTime, formatShortETB } from '../utils/formatters';
import { generateTenderDossierPdf } from '../utils/tenderPdfGenerator';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Truck,
  FileCheck,
  Download,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Edit2,
  Save,
  X,
  Timer,
  CheckSquare,
  Square,
} from 'lucide-react';

interface DeadlineTrackerViewProps {
  bids: TrackedBid[];
  company: CompanyProfile;
  documents: UploadedDocument[];
  personnel: KeyPersonnel[];
  experiences: PastExperience[];
  auditReports: AuditReport[];
  technicalOffers: TechnicalOfferItem[];
  onUpdateBid: (updatedBid: TrackedBid) => void;
  onShowToast: (msg: string) => void;
}

export const DeadlineTrackerView: React.FC<DeadlineTrackerViewProps> = ({
  bids,
  company,
  documents,
  personnel,
  experiences,
  auditReports,
  technicalOffers,
  onUpdateBid,
  onShowToast,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'urgent' | 'pending' | 'submitted'>('pending');
  const [editingBidId, setEditingBidId] = useState<string | null>(null);
  const [editSubmissionDate, setEditSubmissionDate] = useState<string>('');
  const [editSubmissionLocation, setEditSubmissionLocation] = useState<string>('');
  const [editBufferHours, setEditBufferHours] = useState<number>(2);

  // Modal to log physical submission
  const [isLogSubmitModalOpen, setIsLogSubmitModalOpen] = useState<boolean>(false);
  const [selectedBidForLog, setSelectedBidForLog] = useState<TrackedBid | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [actualDateStr, setActualDateStr] = useState<string>(new Date().toISOString().slice(0, 16));

  // Ticking state for real-time countdown
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateSubmissionCountdown = (targetDateStr: string, closingDateStr: string) => {
    const target = new Date(targetDateStr || closingDateStr).getTime();
    const diff = target - now.getTime();

    if (diff <= 0) {
      return {
        isPassed: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        label: 'Submission Target Passed',
        urgent: false,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const isUrgent = days === 0 && hours < 48;

    return {
      isPassed: false,
      days,
      hours,
      minutes,
      seconds,
      label: `${days}d ${hours}h ${minutes}m ${seconds}s left`,
      urgent: isUrgent || days <= 2,
    };
  };

  const handleStartEdit = (bid: TrackedBid) => {
    setEditingBidId(bid.id);
    const dateFormatted = bid.submissionTargetDate
      ? new Date(bid.submissionTargetDate).toISOString().slice(0, 16)
      : new Date(bid.closingDate).toISOString().slice(0, 16);
    setEditSubmissionDate(dateFormatted);
    setEditSubmissionLocation(bid.submissionLocation || '');
    setEditBufferHours(bid.dispatchBufferHours || 2);
  };

  const handleSaveEdit = (bid: TrackedBid) => {
    const updated: TrackedBid = {
      ...bid,
      submissionTargetDate: new Date(editSubmissionDate).toISOString(),
      submissionLocation: editSubmissionLocation,
      dispatchBufferHours: Number(editBufferHours) || 2,
    };
    onUpdateBid(updated);
    setEditingBidId(null);
    onShowToast(`Updated submission schedule for ${bid.internalRefNo}`);
  };

  const handleToggleMilestone = (
    bid: TrackedBid,
    milestone: keyof TrackedBid['submissionMilestones']
  ) => {
    const currentMilestones = bid.submissionMilestones || {
      cpoReady: false,
      technicalReady: false,
      financialReady: false,
      sealedWax: false,
      deliveredToBox: false,
    };

    const updated: TrackedBid = {
      ...bid,
      submissionMilestones: {
        ...currentMilestones,
        [milestone]: !currentMilestones[milestone],
      },
    };
    onUpdateBid(updated);
  };

  const handleOpenLogSubmission = (bid: TrackedBid) => {
    setSelectedBidForLog(bid);
    setReceiptNumber(bid.submissionProofReceipt || `PROC-ACK-${Math.floor(1000 + Math.random() * 9000)}`);
    setActualDateStr(new Date().toISOString().slice(0, 16));
    setIsLogSubmitModalOpen(true);
  };

  const handleConfirmSubmission = () => {
    if (!selectedBidForLog) return;
    const updated: TrackedBid = {
      ...selectedBidForLog,
      actualSubmissionDate: new Date(actualDateStr).toISOString(),
      submissionProofReceipt: receiptNumber.trim(),
      stage: 'submitted',
      submissionMilestones: {
        ...(selectedBidForLog.submissionMilestones || {
          cpoReady: true,
          technicalReady: true,
          financialReady: true,
          sealedWax: true,
          deliveredToBox: true,
        }),
        deliveredToBox: true,
      },
    };
    onUpdateBid(updated);
    setIsLogSubmitModalOpen(false);
    onShowToast(`Official submission logged for ${selectedBidForLog.internalRefNo}!`);
  };

  const handleDownloadPdf = (bid: TrackedBid) => {
    try {
      const doc = generateTenderDossierPdf({
        bid,
        company,
        documents,
        personnel,
        experiences,
        auditReports,
        technicalOffers,
      });
      const safeTitle = bid.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`TENDER_SUBMISSION_${bid.internalRefNo}_${safeTitle}.pdf`);
      onShowToast(`Generated Dossier PDF for ${bid.internalRefNo}`);
    } catch (err: any) {
      onShowToast(`Error generating PDF: ${err.message}`);
    }
  };

  // Filter bids based on submission status
  const filteredBids = bids.filter((b) => {
    const isSubmitted = !!b.actualSubmissionDate || b.stage === 'submitted' || b.stage === 'evaluation' || b.stage === 'awarded';
    if (filterMode === 'submitted') return isSubmitted;
    if (filterMode === 'pending') return !isSubmitted;
    if (filterMode === 'urgent') {
      if (isSubmitted) return false;
      const target = new Date(b.submissionTargetDate || b.closingDate).getTime();
      const diffHours = (target - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 96; // Less than 4 days
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-neutral-900">
                Tender Submission Deadline & Milestone Tracker
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live countdown based on planned submission date, physical transit buffer, and statutory tender closing hours
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterMode === 'pending'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Pending Submission ({bids.filter((b) => !b.actualSubmissionDate && b.stage !== 'submitted' && b.stage !== 'evaluation' && b.stage !== 'awarded').length})
            </button>
            <button
              onClick={() => setFilterMode('urgent')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterMode === 'urgent'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Urgent (&lt; 96h)
            </button>
            <button
              onClick={() => setFilterMode('submitted')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterMode === 'submitted'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              Submitted Bids
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              All ({bids.length})
            </button>
          </div>
        </div>
      </div>

      {/* Deadline Cards List */}
      <div className="space-y-3">
        {filteredBids.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <Clock className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-900">
              No bids in this deadline filter
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Switch to "All" or track new tenders from the 2Merkato live feed.
            </p>
          </div>
        ) : (
          filteredBids.map((bid) => {
            const isEditing = editingBidId === bid.id;
            const isSubmitted = !!bid.actualSubmissionDate || bid.stage === 'submitted' || bid.stage === 'evaluation' || bid.stage === 'awarded';
            const countdown = calculateSubmissionCountdown(
              bid.submissionTargetDate || bid.closingDate,
              bid.closingDate
            );

            const milestones = bid.submissionMilestones || {
              cpoReady: false,
              technicalReady: false,
              financialReady: false,
              sealedWax: false,
              deliveredToBox: isSubmitted,
            };

            const completedMilestones = Object.values(milestones).filter(Boolean).length;

            return (
              <div
                key={bid.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${
                  isSubmitted
                    ? 'border-neutral-200 bg-neutral-50/40'
                    : countdown.urgent
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Top Strip: Ref, Urgency Badge, Countdown Timer */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        {bid.internalRefNo}
                      </span>
                      <span className="font-medium text-neutral-700">{bid.organization}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">{bid.region}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-mono text-neutral-500">{bid.procurementType}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-neutral-950 mt-1 line-clamp-1">
                      {bid.title}
                    </h3>
                  </div>

                  {/* Countdown Timer Display */}
                  <div className="flex items-center gap-3 shrink-0">
                    {isSubmitted ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div>Submitted On-Time ✓</div>
                          <div className="text-[10px] font-mono text-emerald-700 font-normal">
                            Receipt: {bid.submissionProofReceipt || 'Official Acknowledgment'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs ${
                          countdown.urgent
                            ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
                            : 'bg-neutral-900 border-neutral-800 text-white'
                        }`}
                      >
                        <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                            Planned Submission Countdown
                          </div>
                          <div className="font-mono font-bold text-sm tabular-nums">
                            {countdown.isPassed ? 'Target Passed' : countdown.label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Content: Dates, Location, Buffer, Milestones */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                  {/* Column 1: Dates & Milestones */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Key Timestamps</span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(bid)}
                          className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Adjust Target
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                        <div>
                          <label className="text-neutral-600 block mb-1 font-medium">
                            Planned Target Submission Date/Time:
                          </label>
                          <input
                            type="datetime-local"
                            value={editSubmissionDate}
                            onChange={(e) => setEditSubmissionDate(e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-neutral-600 block mb-1 font-medium">
                            Tender Box Venue / Location:
                          </label>
                          <input
                            type="text"
                            value={editSubmissionLocation}
                            onChange={(e) => setEditSubmissionLocation(e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded p-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-neutral-600 block mb-1 font-medium">
                            Transit / Delivery Buffer (Hours):
                          </label>
                          <input
                            type="number"
                            value={editBufferHours}
                            onChange={(e) => setEditBufferHours(Number(e.target.value))}
                            className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono text-xs"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingBidId(null)}
                            className="px-2.5 py-1 text-neutral-500 hover:text-neutral-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(bid)}
                            className="px-3 py-1 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save Schedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 font-mono">
                        <div className="flex justify-between items-center p-2 rounded bg-neutral-50 border border-neutral-100">
                          <span className="text-neutral-500">Planned Submission Target:</span>
                          <span className="font-bold text-neutral-900">
                            {formatDateTime(bid.submissionTargetDate || bid.closingDate)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-neutral-50 border border-neutral-100">
                          <span className="text-neutral-500">Statutory Tender Closing:</span>
                          <span className="font-bold text-rose-700">
                            {formatDateTime(bid.closingDate)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-neutral-50 border border-neutral-100">
                          <span className="text-neutral-500">Public Opening Session:</span>
                          <span className="text-neutral-800">
                            {formatDateTime(bid.openingDate)}
                          </span>
                        </div>

                        {bid.actualSubmissionDate && (
                          <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900">
                            <span className="font-medium">Actual Logged Drop-off:</span>
                            <span className="font-bold">
                              {formatDateTime(bid.actualSubmissionDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Venue, Transit Buffer & CPO Bond */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Submission Logistics & Delivery
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-neutral-900">Tender Box Venue:</div>
                          <div className="text-neutral-600 leading-snug mt-0.5">
                            {bid.submissionLocation || `${bid.organization} Head Office, Procurement Department`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/70">
                        <Truck className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div>
                          <span className="text-neutral-500">Dispatch Lead Time: </span>
                          <span className="font-mono font-bold text-neutral-800">
                            {bid.dispatchBufferHours || 2} hours ahead of closing
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-200/70 flex justify-between items-center">
                        <span className="text-neutral-500">Required Bid Security (CPO):</span>
                        <span className="font-mono font-bold text-amber-700">
                          {formatETB(bid.bidBondAmountETB)} ({bid.cpoStatus})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Readiness Milestones Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Submission Readiness Milestones
                      </div>
                      <span className="font-mono text-[11px] text-neutral-500">
                        {completedMilestones}/5 Ready
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg p-1 bg-white">
                      <div
                        onClick={() => handleToggleMilestone(bid, 'cpoReady')}
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {milestones.cpoReady ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className={milestones.cpoReady ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                            Original CPO Issued by Bank
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">T-72h</span>
                      </div>

                      <div
                        onClick={() => handleToggleMilestone(bid, 'technicalReady')}
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {milestones.technicalReady ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className={milestones.technicalReady ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                            Technical Proposal & License Printed
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">T-24h</span>
                      </div>

                      <div
                        onClick={() => handleToggleMilestone(bid, 'financialReady')}
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {milestones.financialReady ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className={milestones.financialReady ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                            Financial Offer & VAT Signed
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">T-24h</span>
                      </div>

                      <div
                        onClick={() => handleToggleMilestone(bid, 'sealedWax')}
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {milestones.sealedWax ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className={milestones.sealedWax ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                            Double Envelopes Wax-Sealed & Stamped
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">T-12h</span>
                      </div>

                      <div
                        onClick={() => handleToggleMilestone(bid, 'deliveredToBox')}
                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {milestones.deliveredToBox ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400" />
                          )}
                          <span className={milestones.deliveredToBox ? 'text-neutral-900 font-medium' : 'text-neutral-600'}>
                            Dropped in Tender Box & Receipt Filed
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">T-0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
                    <span>Our Submitted Sum: <strong className="text-neutral-900 font-bold">{formatETB(bid.ourBidAmountETB)}</strong></span>
                    <span>·</span>
                    <span>Assigned: <strong className="text-neutral-800">{bid.assignedTo}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(bid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Tender Dossier (PDF)
                    </button>

                    {!isSubmitted ? (
                      <button
                        onClick={() => handleOpenLogSubmission(bid)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Log Actual Box Submission
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenLogSubmission(bid)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit Submission Log
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Log Box Submission */}
      {isLogSubmitModalOpen && selectedBidForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Log Tender Box Drop-Off Confirmation
                </h3>
              </div>
              <button
                onClick={() => setIsLogSubmitModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Opportunity</span>
                <div className="font-bold text-neutral-900">{selectedBidForLog.title}</div>
                <div className="text-neutral-500 mt-0.5">{selectedBidForLog.organization} · {selectedBidForLog.internalRefNo}</div>
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 font-medium">
                  Actual Timestamp of Physical Submission: *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={actualDateStr}
                  onChange={(e) => setActualDateStr(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 font-medium">
                  Client Submission Voucher / Acknowledgment Receipt Number: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOD-PROC-ACK-2026-091"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 font-mono text-xs font-bold"
                />
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  Official stamped receipt or tender box register serial number
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-900">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  On-Time Submission Verification
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Once logged, this tender will be marked as officially submitted on-time, locking the preliminary compliance requirement for the public opening session.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsLogSubmitModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmission}
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800 shadow-xs"
                >
                  Confirm & Archive Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
