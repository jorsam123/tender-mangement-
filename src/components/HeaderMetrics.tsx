import React from 'react';
import { ExternalLink, Radio, Shield, TrendingUp, AlertTriangle, Building2 } from 'lucide-react';
import { formatETB, formatShortETB } from '../utils/formatters';
import { TrackedBid } from '../types/tender';

interface HeaderMetricsProps {
  totalCategoryTenders: number;
  trackedBids: TrackedBid[];
  isLiveFeed: boolean;
  activeCategoryId: string;
}

export const HeaderMetrics: React.FC<HeaderMetricsProps> = ({
  totalCategoryTenders,
  trackedBids,
  isLiveFeed,
  activeCategoryId,
}) => {
  const activeBids = trackedBids.filter(b => b.stage !== 'lost' && b.stage !== 'awarded');
  const pipelineValue = activeBids.reduce((sum, b) => sum + (b.ourBidAmountETB || b.estimatedContractValueETB), 0);
  const activeCpos = trackedBids.filter(b => b.cpoStatus === 'Issued' || b.cpoStatus === 'Submitted');
  const totalCpoHeld = activeCpos.reduce((sum, b) => sum + b.bidBondAmountETB, 0);

  const urgentCount = activeBids.filter(b => {
    const diffDays = (new Date(b.closingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  }).length;

  return (
    <div className="bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                2Merkato Tender Portal Sync
              </span>
              <span aria-hidden="true">/</span>
              <a
                href={activeCategoryId && activeCategoryId !== 'all' ? `https://tender.2merkato.com/tenders?categories=${activeCategoryId}&page=1&regions=&sources=` : 'https://tender.2merkato.com/tenders?page=1&regions=&sources='}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors underline decoration-neutral-700 underline-offset-2"
              >
                View on 2merkato.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Ethiopian Public Procurement & Bid Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Live tracking for all Ethiopian public tenders, government ministries, regional bureaus & commercial bids
            </p>
          </div>

          {/* Tabular Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
            <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Available Tenders
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {totalCategoryTenders.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span>Direct 2Merkato Feed</span>
              </div>
            </div>

            <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Tracked Pipeline
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {formatShortETB(pipelineValue)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {activeBids.length} Active Bids
              </div>
            </div>

            <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Active CPO Collateral
              </div>
              <div className="text-lg font-bold text-amber-300 font-mono tabular-nums mt-0.5">
                {formatShortETB(totalCpoHeld)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {activeCpos.length} Bank Guarantees
              </div>
            </div>

            <div className="bg-neutral-800/60 rounded-lg p-3 border border-neutral-700/50">
              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Urgent Deadlines
              </div>
              <div className="text-lg font-bold text-rose-400 font-mono tabular-nums mt-0.5">
                {urgentCount}
              </div>
              <div className="text-[10px] text-rose-300/80 mt-0.5">
                Due within 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
