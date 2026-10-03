import React, { useState } from 'react';
import { TrackedBid, CpoStatus } from '../types/tender';
import { formatETB, formatShortETB, formatDate, calculateDaysRemaining, CPO_STATUS_META } from '../utils/formatters';
import { ShieldCheck, AlertCircle, Building2, Landmark, CheckCircle2, Clock, ArrowUpRight, DollarSign } from 'lucide-react';

interface CpoManagerViewProps {
  bids: TrackedBid[];
  onUpdateCpoStatus: (bidId: string, status: CpoStatus, bank?: string, cpoNumber?: string) => void;
  onOpenBidDetail: (bid: TrackedBid) => void;
}

export const CpoManagerView: React.FC<CpoManagerViewProps> = ({
  bids,
  onUpdateCpoStatus,
  onOpenBidDetail,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBids = bids.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.cpoStatus === filterStatus;
  });

  const totalCollateralFrozen = bids
    .filter((b) => b.cpoStatus === 'Issued' || b.cpoStatus === 'Submitted')
    .reduce((sum, b) => sum + b.bidBondAmountETB, 0);

  const totalReleased = bids
    .filter((b) => b.cpoStatus === 'Released')
    .reduce((sum, b) => sum + b.bidBondAmountETB, 0);

  const banks = [
    'Commercial Bank of Ethiopia (CBE)',
    'Awash International Bank',
    'Dashen Bank',
    'Bank of Abyssinia',
    'Hibret Bank',
    'Nib International Bank',
    'Cooperative Bank of Oromia',
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Currently Frozen Collateral
            </span>
            <Landmark className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums mt-1">
            {formatETB(totalCollateralFrozen)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Active across {bids.filter((b) => b.cpoStatus === 'Issued' || b.cpoStatus === 'Submitted').length} commercial bank CPOs
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Reclaimed & Returned
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {formatETB(totalReleased)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Funds successfully unfrozen and returned to bank account
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Pending Bank Action
            </span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums mt-1">
            {bids.filter((b) => b.cpoStatus === 'Required' || b.cpoStatus === 'Drafted').length}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Bids needing CPO issuance or bank submission
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <span className="text-neutral-500 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">Status:</span>
          {(['all', 'Required', 'Drafted', 'Issued', 'Submitted', 'Released'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-950 active:bg-neutral-200'
              }`}
            >
              {st === 'all' ? 'All CPOs' : st}
            </button>
          ))}
        </div>

        <div className="text-xs text-neutral-500">
          Showing <span className="font-mono font-medium text-neutral-800">{filteredBids.length}</span> bid security instruments
        </div>
      </div>

      {/* Mobile CPO Cards List (Phone viewports) */}
      <div className="md:hidden space-y-3">
        {filteredBids.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-300 rounded-xl p-8 text-center text-xs text-neutral-500">
            No bid security instruments found matching filter.
          </div>
        ) : (
          filteredBids.map((bid) => {
            const meta = CPO_STATUS_META[bid.cpoStatus];

            return (
              <div
                key={`mob-cpo-${bid.id}`}
                className="bg-white border border-neutral-200/90 rounded-xl p-3.5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                      {bid.title}
                    </h4>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-neutral-700">{bid.internalRefNo}</span>
                      <span>·</span>
                      <span className="truncate">{bid.organization}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded border shrink-0 ${meta.bgClass} ${meta.textClass}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded-lg grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-medium">Bond Value</span>
                    <div className="font-mono font-bold text-neutral-900 tabular-nums">
                      {formatETB(bid.bidBondAmountETB)}
                    </div>
                    <span className="text-[10px] text-neutral-400">100% Cash Margin</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-medium">Bank & Ref</span>
                    <div className="text-[11px] font-medium text-neutral-800 truncate">
                      {bid.cpoBank || 'Unassigned'}
                    </div>
                    <div className="font-mono text-[10px] text-neutral-500 truncate">
                      {bid.cpoNumber || 'No CPO #'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenBidDetail(bid)}
                    className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
                  >
                    View Bid Info
                  </button>

                  <div className="flex items-center gap-1.5">
                    {bid.cpoStatus === 'Required' && (
                      <button
                        onClick={() =>
                          onUpdateCpoStatus(
                            bid.id,
                            'Drafted',
                            bid.cpoBank || 'Commercial Bank of Ethiopia (CBE)'
                          )
                        }
                        className="px-3 py-1.5 min-h-[36px] text-xs font-semibold bg-neutral-900 text-white rounded-lg active:bg-neutral-800 shadow-xs"
                      >
                        Draft CPO
                      </button>
                    )}

                    {bid.cpoStatus === 'Drafted' && (
                      <button
                        onClick={() =>
                          onUpdateCpoStatus(
                            bid.id,
                            'Issued',
                            bid.cpoBank,
                            `CBE-CPO-${Math.floor(100000 + Math.random() * 900000)}`
                          )
                        }
                        className="px-3 py-1.5 min-h-[36px] text-xs font-semibold bg-emerald-600 text-white rounded-lg active:bg-emerald-700 shadow-xs"
                      >
                        Confirm Issued
                      </button>
                    )}

                    {bid.cpoStatus === 'Issued' && (
                      <button
                        onClick={() => onUpdateCpoStatus(bid.id, 'Submitted')}
                        className="px-3 py-1.5 min-h-[36px] text-xs font-semibold bg-indigo-600 text-white rounded-lg active:bg-indigo-700 shadow-xs"
                      >
                        Mark Submitted
                      </button>
                    )}

                    {bid.cpoStatus === 'Submitted' && (
                      <button
                        onClick={() => onUpdateCpoStatus(bid.id, 'Released')}
                        className="px-3 py-1.5 min-h-[36px] text-xs font-semibold bg-neutral-100 active:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded-lg shadow-xs"
                      >
                        Reclaim Collateral
                      </button>
                    )}

                    {bid.cpoStatus === 'Released' && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop CPO Records Table */}
      <div className="hidden md:block bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3 px-4">Tender Opportunity & Entity</th>
                <th className="py-3 px-3">Issuing Bank</th>
                <th className="py-3 px-3">CPO Ref / Number</th>
                <th className="py-3 px-3 text-right">Bond Value (ETB)</th>
                <th className="py-3 px-3">Lifecycle Status</th>
                <th className="py-3 px-3">Validity / Expiry</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredBids.map((bid) => {
                const isFrozen = bid.cpoStatus === 'Issued' || bid.cpoStatus === 'Submitted';
                const meta = CPO_STATUS_META[bid.cpoStatus];

                return (
                  <tr
                    key={bid.id}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-neutral-900 line-clamp-1">
                        {bid.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-neutral-700">{bid.internalRefNo}</span>
                        <span aria-hidden="true">·</span>
                        <span>{bid.organization}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-800 font-medium">
                      {bid.cpoBank || (
                        <span className="text-neutral-400 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-neutral-700">
                      {bid.cpoNumber || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-neutral-900">
                        {formatETB(bid.bidBondAmountETB)}
                      </div>
                      <span className="text-[10px] text-neutral-400">100% Cash Margin</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${meta.bgClass} ${meta.textClass}`}
                      >
                        {meta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      {bid.cpoExpiryDate ? (
                        <div>
                          <div className="text-neutral-800">{formatDate(bid.cpoExpiryDate)}</div>
                          <div className="text-[10px] text-neutral-500">
                            Valid 90 days from opening
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400">Pending issuance</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {bid.cpoStatus === 'Required' && (
                          <button
                            onClick={() =>
                              onUpdateCpoStatus(
                                bid.id,
                                'Drafted',
                                bid.cpoBank || 'Commercial Bank of Ethiopia (CBE)'
                              )
                            }
                            className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                          >
                            Draft Bank Application
                          </button>
                        )}

                        {bid.cpoStatus === 'Drafted' && (
                          <button
                            onClick={() =>
                              onUpdateCpoStatus(
                                bid.id,
                                'Issued',
                                bid.cpoBank,
                                `CBE-CPO-${Math.floor(100000 + Math.random() * 900000)}`
                              )
                            }
                            className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                          >
                            Confirm Bank Issued
                          </button>
                        )}

                        {bid.cpoStatus === 'Issued' && (
                          <button
                            onClick={() => onUpdateCpoStatus(bid.id, 'Submitted')}
                            className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          >
                            Mark Submitted with Bid
                          </button>
                        )}

                        {bid.cpoStatus === 'Submitted' && (
                          <button
                            onClick={() => onUpdateCpoStatus(bid.id, 'Released')}
                            className="px-2.5 py-1 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 rounded transition-colors"
                          >
                            Reclaim Collateral
                          </button>
                        )}

                        {bid.cpoStatus === 'Released' && (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Collateral Unlocked ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
