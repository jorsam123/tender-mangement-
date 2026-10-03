import React, { useState } from 'react';
import { ExternalLink, Radio, Shield, TrendingUp, AlertTriangle, Building2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [mobileExpanded, setMobileExpanded] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                2Merkato Portal Sync
              </span>
              <span aria-hidden="true" className="hidden sm:inline">/</span>
              <a
                href={activeCategoryId && activeCategoryId !== 'all' ? `https://tender.2merkato.com/tenders?categories=${activeCategoryId}&page=1&regions=&sources=` : 'https://tender.2merkato.com/tenders?page=1&regions=&sources='}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors underline decoration-neutral-700 underline-offset-2 text-[11px] sm:text-xs"
              >
                <span>2merkato.com</span>
                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </a>

              {/* Mobile toggle button */}
              <button
                type="button"
                onClick={() => setMobileExpanded(!mobileExpanded)}
                className="lg:hidden ml-auto inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 text-[11px] text-neutral-300 active:bg-neutral-700"
              >
                <span>{mobileExpanded ? 'Hide KPIs' : 'View KPIs'}</span>
                {mobileExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1">
              Ethiopian Public Procurement Pipeline
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Live tracking for Ethiopian public tenders, government ministries & commercial bids
            </p>
          </div>

          {/* Tabular Metrics Strip (Always on Desktop, collapsible on Mobile) */}
          <div className={`${mobileExpanded ? 'grid' : 'hidden lg:grid'} grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800`}>
            <div className="bg-neutral-800/70 rounded-lg p-2.5 sm:p-3 border border-neutral-700/50">
              <div className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Available Tenders
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {totalCategoryTenders.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span>Live 2Merkato</span>
              </div>
            </div>

            <div className="bg-neutral-800/70 rounded-lg p-2.5 sm:p-3 border border-neutral-700/50">
              <div className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Tracked Pipeline
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                {formatShortETB(pipelineValue)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {activeBids.length} Active Bids
              </div>
            </div>

            <div className="bg-neutral-800/70 rounded-lg p-2.5 sm:p-3 border border-neutral-700/50">
              <div className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                CPO Collateral
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-300 font-mono tabular-nums mt-0.5">
                {formatShortETB(totalCpoHeld)}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {activeCpos.length} Guarantees
              </div>
            </div>

            <div className="bg-neutral-800/70 rounded-lg p-2.5 sm:p-3 border border-neutral-700/50">
              <div className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Urgent Deadlines
              </div>
              <div className="text-base sm:text-lg font-bold text-rose-400 font-mono tabular-nums mt-0.5">
                {urgentCount}
              </div>
              <div className="text-[10px] text-rose-300/80 mt-0.5">
                Due &le; 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
