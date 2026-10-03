import React, { useState } from 'react';
import { TrackedBid, ComplianceItem } from '../types/tender';
import { CheckCircle2, XCircle, FileText, AlertTriangle, ShieldCheck, Download, Paperclip } from 'lucide-react';
import { formatETB } from '../utils/formatters';

interface ComplianceMatrixViewProps {
  bids: TrackedBid[];
  onToggleComplianceItem: (bidId: string, itemId: string) => void;
  onOpenBidDetail: (bid: TrackedBid) => void;
}

export const ComplianceMatrixView: React.FC<ComplianceMatrixViewProps> = ({
  bids,
  onToggleComplianceItem,
  onOpenBidDetail,
}) => {
  const [selectedBidId, setSelectedBidId] = useState<string>(bids[0]?.id || '');

  const currentBid = bids.find((b) => b.id === selectedBidId) || bids[0];

  if (!currentBid) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <ShieldCheck className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-neutral-900">No active bids tracked</h3>
        <p className="text-xs text-neutral-500 mt-1">Track a tender from the 2Merkato feed first to audit compliance.</p>
      </div>
    );
  }

  const completedCount = currentBid.complianceChecklist.filter((c) => c.completed).length;
  const totalCount = currentBid.complianceChecklist.length;
  const requiredCount = currentBid.complianceChecklist.filter((c) => c.required).length;
  const requiredCompletedCount = currentBid.complianceChecklist.filter(
    (c) => c.required && c.completed
  ).length;
  const isFullyCompliant = requiredCompletedCount === requiredCount;

  return (
    <div className="space-y-4">
      {/* Bid Selector Strip */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-900 block">
              Audit Pipeline Bid Compliance:
            </label>
            <div className="text-xs text-neutral-500">
              Select any tracked bid to review required Ethiopian public procurement criteria.
            </div>
          </div>

          <select
            value={selectedBidId}
            onChange={(e) => setSelectedBidId(e.target.value)}
            className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
          >
            {bids.map((b) => (
              <option key={b.id} value={b.id}>
                {b.internalRefNo} — {b.organization} ({b.title.slice(0, 45)}...)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compliance Overview Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-mono font-semibold text-neutral-800">{currentBid.internalRefNo}</span>
              <span aria-hidden="true">·</span>
              <span>{currentBid.organization}</span>
              <span aria-hidden="true">·</span>
              <span>{currentBid.procurementType} Tender</span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 mt-1">
              {currentBid.title}
            </h2>
          </div>

          {/* Compliance Score Pill */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-neutral-500">Mandatory Criteria</div>
              <div className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
                {requiredCompletedCount} / {requiredCount} Verified
              </div>
            </div>

            <div
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                isFullyCompliant
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isFullyCompliant ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Preliminary Ready
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Documentation Incomplete
                </>
              )}
            </div>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Mandatory Preliminary Qualification Documents (FPPA Section IV)
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
            {currentBid.complianceChecklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleComplianceItem(currentBid.id, item.id)}
                className="p-3 sm:p-4 flex items-start justify-between gap-4 hover:bg-neutral-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}} // Handled by div click
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          item.completed
                            ? 'text-neutral-900 line-through opacity-70'
                            : 'text-neutral-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.required && (
                        <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>

                    {item.fileAttached && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-mono">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Attached: {item.fileAttached}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${
                      item.completed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {item.completed ? 'Attached & Verified' : 'Missing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Envelope Packaging Protocol */}
        <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <h4 className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Ethiopian Procurement Envelope Sealing Rule (Double-Envelope System)
          </h4>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            Ensure Technical and Financial documents are sealed into separate marked inner envelopes
            (marked "ORIGINAL TECHNICAL" and "ORIGINAL FINANCIAL"), plus 2 sealed copies. Place both into
            one master outer envelope sealed with wax or security stamp, addressed to {currentBid.organization} Tender Board.
          </p>
        </div>
      </div>
    </div>
  );
};
