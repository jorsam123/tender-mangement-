import React, { useState } from 'react';
import {
  TrackedBid,
  TenderStage,
} from '../types/tender';
import {
  STAGE_META,
  formatETB,
  formatShortETB,
  calculateDaysRemaining,
  formatDate,
  CPO_STATUS_META,
} from '../utils/formatters';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';

interface PipelineBoardProps {
  bids: TrackedBid[];
  onUpdateBidStage: (bidId: string, newStage: TenderStage) => void;
  onOpenBidDetail: (bid: TrackedBid) => void;
  onOpenCalculator: (bid: TrackedBid) => void;
}

const ORDERED_STAGES: TenderStage[] = [
  'lead',
  'doc_bought',
  'bid_prep',
  'approved',
  'submitted',
  'evaluation',
  'awarded',
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  bids,
  onUpdateBidStage,
  onOpenBidDetail,
  onOpenCalculator,
}) => {
  const [viewType, setViewType] = useState<'kanban' | 'table'>('kanban');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBids = bids.filter((b) => {
    const matchesAssignee = filterAssignee === 'all' || b.assignedTo === filterAssignee;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.internalRefNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAssignee && matchesSearch;
  });

  const assignees = Array.from(new Set(bids.map((b) => b.assignedTo).filter(Boolean)));

  const handleNextStage = (bid: TrackedBid) => {
    const currentIndex = ORDERED_STAGES.indexOf(bid.stage);
    if (currentIndex >= 0 && currentIndex < ORDERED_STAGES.length - 1) {
      onUpdateBidStage(bid.id, ORDERED_STAGES[currentIndex + 1]);
    }
  };

  const handlePrevStage = (bid: TrackedBid) => {
    const currentIndex = ORDERED_STAGES.indexOf(bid.stage);
    if (currentIndex > 0) {
      onUpdateBidStage(bid.id, ORDERED_STAGES[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter active bids by keyword, company, or ref number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs">
              <span className="px-2 text-neutral-500 font-medium text-[11px]">Owner:</span>
              <button
                onClick={() => setFilterAssignee('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterAssignee === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                All
              </button>
              {assignees.map((assignee) => (
                <button
                  key={assignee}
                  onClick={() => setFilterAssignee(assignee)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filterAssignee === assignee
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {assignee.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="flex items-center p-1 bg-neutral-100 rounded-md border border-neutral-200">
              <button
                onClick={() => setViewType('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  viewType === 'kanban' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewType === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Table Spreadsheet View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewType === 'kanban' ? (
        /* Kanban Pipeline Horizontal Scroll */
        <div className="overflow-x-auto pb-4 pt-1">
          <div className="flex items-start gap-4 min-w-[1300px]">
            {ORDERED_STAGES.map((stageKey) => {
              const stageBids = filteredBids.filter((b) => b.stage === stageKey);
              const stageTotalValue = stageBids.reduce(
                (sum, b) => sum + (b.ourBidAmountETB || b.estimatedContractValueETB),
                0
              );

              return (
                <div
                  key={stageKey}
                  className="w-80 shrink-0 bg-neutral-100/70 border border-neutral-200 rounded-lg flex flex-col max-h-[750px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-neutral-200 bg-neutral-50/90 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
                        <h4 className="text-xs font-semibold text-neutral-900">
                          {STAGE_META[stageKey].label}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-medium text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {stageBids.length}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Total Value:</span>
                      <span className="font-mono font-medium text-neutral-800 tabular-nums">
                        {formatShortETB(stageTotalValue)}
                      </span>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {stageBids.length === 0 ? (
                      <div className="p-6 text-center text-neutral-400 text-xs border border-dashed border-neutral-300 rounded-md my-2">
                        No bids in this stage
                      </div>
                    ) : (
                      stageBids.map((bid) => {
                        const deadline = calculateDaysRemaining(bid.closingDate);
                        const completedCompliance = bid.complianceChecklist.filter((c) => c.completed).length;
                        const totalCompliance = bid.complianceChecklist.length;

                        return (
                          <div
                            key={bid.id}
                            onClick={() => onOpenBidDetail(bid)}
                            className="bg-white border border-neutral-200 rounded-md p-3 hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer group"
                          >
                            {/* Ref & Org */}
                            <div className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span className="font-mono font-semibold text-neutral-800">
                                {bid.internalRefNo}
                              </span>
                              <span className="text-[10px] text-neutral-500 truncate max-w-[130px]">
                                {bid.organization}
                              </span>
                            </div>

                            {/* Title */}
                            <h5 className="text-xs font-semibold text-neutral-900 mt-1.5 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                              {bid.title}
                            </h5>

                            {/* Financial Details */}
                            <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] text-neutral-400 block">Our Bid</span>
                                <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                                  {formatETB(bid.ourBidAmountETB)}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-neutral-400 block">Margin</span>
                                <span className="font-mono text-emerald-700 font-medium tabular-nums">
                                  {bid.targetMarginPercent}%
                                </span>
                              </div>
                            </div>

                            {/* CPO Bond status */}
                            <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                              <span className="text-neutral-500">CPO:</span>
                              <span className="font-mono text-neutral-800">
                                {formatShortETB(bid.bidBondAmountETB)} · {bid.cpoStatus}
                              </span>
                            </div>

                            {/* Compliance Bar */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                                <span>Compliance</span>
                                <span className="font-mono">
                                  {completedCompliance}/{totalCompliance}
                                </span>
                              </div>
                              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    completedCompliance === totalCompliance
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{
                                    width: `${(completedCompliance / totalCompliance) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Bottom Strip: Deadline & Stage Advancement */}
                            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                              <div
                                className={`flex items-center gap-1 font-medium ${
                                  deadline.urgent ? 'text-rose-600' : 'text-neutral-500'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{deadline.text}</span>
                              </div>

                              {/* Stage shifter buttons */}
                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {stageKey !== 'lead' && (
                                  <button
                                    onClick={() => handlePrevStage(bid)}
                                    title="Move back a stage"
                                    className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 transition-colors"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {stageKey !== 'awarded' && (
                                  <button
                                    onClick={() => handleNextStage(bid)}
                                    title="Advance to next stage"
                                    className="p-1 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* High-Density Spreadsheet View */
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-3">Tender Title & Client</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3 text-right">Our Offer (ETB)</th>
                  <th className="py-3 px-3 text-right">Target Margin</th>
                  <th className="py-3 px-3">CPO Guarantee</th>
                  <th className="py-3 px-3">Compliance</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredBids.map((bid) => {
                  const deadline = calculateDaysRemaining(bid.closingDate);
                  const completedCompliance = bid.complianceChecklist.filter((c) => c.completed).length;

                  return (
                    <tr
                      key={bid.id}
                      onClick={() => onOpenBidDetail(bid)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-800 whitespace-nowrap">
                        {bid.internalRefNo}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {bid.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">{bid.organization}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          {STAGE_META[bid.stage].label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-neutral-900 tabular-nums whitespace-nowrap">
                        {formatETB(bid.ourBidAmountETB)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium tabular-nums whitespace-nowrap">
                        {bid.targetMarginPercent}%
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-neutral-700">
                        {formatShortETB(bid.bidBondAmountETB)} ({bid.cpoStatus})
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-neutral-800">
                          {completedCompliance}/{bid.complianceChecklist.length}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className={`font-mono text-[11px] ${deadline.urgent ? 'text-rose-600 font-medium' : 'text-neutral-700'}`}>
                          {formatDate(bid.closingDate)}
                        </div>
                        <div className="text-[10px] text-neutral-400">{deadline.text}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-neutral-700">
                        {bid.assignedTo}
                      </td>
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenCalculator(bid)}
                            title="Open Pricing Calculator"
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenBidDetail(bid)}
                            className="px-2 py-1 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
