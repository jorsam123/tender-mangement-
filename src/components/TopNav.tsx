import React from 'react';
import { Plus, Download, RefreshCw, FileText, Clock, Building, ShieldCheck, Calculator } from 'lucide-react';

export type AppView = 'feed' | 'pipeline' | 'deadlines' | 'dossier' | 'cpo' | 'compliance' | 'calculator';

interface TopNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenNewBidModal: () => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  onExportCsv: () => void;
  trackedCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  onOpenNewBidModal,
  onRefreshFeed,
  isRefreshing,
  onExportCsv,
  trackedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange('feed');
          }}
          className="text-lg font-bold tracking-tight text-neutral-950 flex items-center gap-2 shrink-0 hover:text-neutral-800 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          TenderPulse
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onViewChange('feed')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'feed'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            2Merkato Feed
          </button>

          <button
            onClick={() => onViewChange('pipeline')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
              currentView === 'pipeline'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Bid Pipeline
            <span className="text-[10px] font-mono opacity-80">({trackedCount})</span>
          </button>

          <button
            onClick={() => onViewChange('deadlines')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'deadlines'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            Submission Deadlines
          </button>

          <button
            onClick={() => onViewChange('dossier')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'dossier'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-emerald-600" />
            Company Dossier & Uploads
          </button>

          <button
            onClick={() => onViewChange('cpo')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'cpo'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            CPO & Bonds
          </button>

          <button
            onClick={() => onViewChange('compliance')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'compliance'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Compliance
          </button>

          <button
            onClick={() => onViewChange('calculator')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              currentView === 'calculator'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Pricing Engine
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {currentView === 'feed' && (
            <button
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              title="Sync with tender.2merkato.com"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}

          <button
            onClick={onExportCsv}
            title="Export tracked pipeline to CSV"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={onOpenNewBidModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Track Tender
          </button>
        </div>
      </div>

      {/* Sub-nav / Mobile scrollbar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-neutral-100 overflow-x-auto scrollbar-none bg-neutral-50">
        <button
          onClick={() => onViewChange('feed')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentView === 'feed' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          2Merkato Feed
        </button>
        <button
          onClick={() => onViewChange('pipeline')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentView === 'pipeline' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          Pipeline ({trackedCount})
        </button>
        <button
          onClick={() => onViewChange('deadlines')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap flex items-center gap-1 ${
            currentView === 'deadlines' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          <Clock className="w-3 h-3 text-rose-500" />
          Deadlines
        </button>
        <button
          onClick={() => onViewChange('dossier')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap flex items-center gap-1 ${
            currentView === 'dossier' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          <Building className="w-3 h-3 text-emerald-600" />
          Company & Uploads
        </button>
        <button
          onClick={() => onViewChange('cpo')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentView === 'cpo' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          CPO Bonds
        </button>
        <button
          onClick={() => onViewChange('compliance')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentView === 'compliance' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          Compliance
        </button>
        <button
          onClick={() => onViewChange('calculator')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentView === 'calculator' ? 'bg-neutral-900 text-white' : 'text-neutral-600'
          }`}
        >
          Pricing
        </button>
      </div>
    </header>
  );
};
