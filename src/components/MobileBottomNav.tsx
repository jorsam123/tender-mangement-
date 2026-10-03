import React, { useState } from 'react';
import {
  FileText,
  Layers,
  Clock,
  Landmark,
  MoreHorizontal,
  Building,
  ShieldCheck,
  Calculator,
  Download,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Database,
  LogIn,
  LogOut,
} from 'lucide-react';
import { AppView } from './TopNav';
import { useFirebase } from '../firebase/FirebaseContext';

interface MobileBottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  trackedCount: number;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  onExportCsv: () => void;
  onSyncAllToFirebase: () => void;
  isSyncingToFirebase: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  trackedCount,
  onRefreshFeed,
  isRefreshing,
  onExportCsv,
  onSyncAllToFirebase,
  isSyncingToFirebase,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, dbConnected, isLoggingIn, signInWithGoogle, signOutUser } = useFirebase();

  const handleSelectTab = (view: AppView) => {
    onViewChange(view);
    setIsMoreOpen(false);
  };


  const isMoreActive =
    currentView === 'dossier' ||
    currentView === 'compliance' ||
    currentView === 'calculator';

  return (
    <>
      {/* Mobile Bottom Bar Dock */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe"
      >
        <div className="grid grid-cols-5 h-14 max-w-lg mx-auto">
          {/* Tab 1: Live Feed */}
          <button
            type="button"
            onClick={() => handleSelectTab('feed')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              currentView === 'feed'
                ? 'text-neutral-950 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className={`w-4 h-4 ${currentView === 'feed' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none">Feed</span>
            {currentView === 'feed' && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
            )}
          </button>

          {/* Tab 2: Pipeline */}
          <button
            type="button"
            onClick={() => handleSelectTab('pipeline')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              currentView === 'pipeline'
                ? 'text-neutral-950 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <div className="relative">
              <Layers className={`w-4 h-4 ${currentView === 'pipeline' ? 'stroke-[2.5]' : ''}`} />
              {trackedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-neutral-900 text-white font-mono text-[9px] px-1 py-0.2 rounded-full min-w-3 text-center font-bold">
                  {trackedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">Pipeline</span>
            {currentView === 'pipeline' && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
            )}
          </button>

          {/* Tab 3: Deadlines */}
          <button
            type="button"
            onClick={() => handleSelectTab('deadlines')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              currentView === 'deadlines'
                ? 'text-neutral-950 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Clock className={`w-4 h-4 ${currentView === 'deadlines' ? 'stroke-[2.5] text-rose-600' : 'text-neutral-500'}`} />
            <span className="text-[10px] leading-none">Deadlines</span>
            {currentView === 'deadlines' && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-rose-600" />
            )}
          </button>

          {/* Tab 4: CPO Bonds */}
          <button
            type="button"
            onClick={() => handleSelectTab('cpo')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              currentView === 'cpo'
                ? 'text-neutral-950 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Landmark className={`w-4 h-4 ${currentView === 'cpo' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none">CPO Bonds</span>
            {currentView === 'cpo' && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
            )}
          </button>

          {/* Tab 5: More Options */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              isMoreActive || isMoreOpen
                ? 'text-neutral-950 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <MoreHorizontal className={`w-4 h-4 ${(isMoreActive || isMoreOpen) ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-none">
              {currentView === 'dossier'
                ? 'Dossier'
                : currentView === 'compliance'
                ? 'Compliance'
                : currentView === 'calculator'
                ? 'Pricing'
                : 'More'}
            </span>
            {isMoreActive && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
            )}
          </button>
        </div>
      </nav>

      {/* "More" Drawer / Bottom Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto space-y-4 border-t border-neutral-200">
            {/* Handle & Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Workspace Modules & Actions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleSelectTab('dossier')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  currentView === 'dossier'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${currentView === 'dossier' ? 'bg-neutral-800 text-emerald-400' : 'bg-white border border-neutral-200 text-emerald-600'}`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Company Dossier & Uploads</div>
                    <div className={`text-[11px] ${currentView === 'dossier' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Trade license, TIN, tax clearance & key personnel
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('compliance')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  currentView === 'compliance'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${currentView === 'compliance' ? 'bg-neutral-800 text-emerald-400' : 'bg-white border border-neutral-200 text-emerald-600'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Compliance Checklist Matrix</div>
                    <div className={`text-[11px] ${currentView === 'compliance' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Mandatory statutory criteria across all active bids
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab('calculator')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  currentView === 'calculator'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${currentView === 'calculator' ? 'bg-neutral-800 text-emerald-400' : 'bg-white border border-neutral-200 text-emerald-600'}`}>
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Pricing Engine & VAT Simulator</div>
                    <div className={`text-[11px] ${currentView === 'calculator' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      15% VAT, 2% WHT & gross profit margin simulator
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <span>Firebase Database & Cloud</span>
                <span className="text-[10px] text-emerald-600 font-mono">
                  {user ? 'Connected' : dbConnected ? 'Ready' : 'Connecting'}
                </span>
              </div>

              {/* Sync All Records to Cloud Button */}
              <button
                type="button"
                onClick={() => {
                  onSyncAllToFirebase();
                }}
                disabled={isSyncingToFirebase}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingToFirebase ? 'animate-spin' : ''}`} />
                <span>{isSyncingToFirebase ? 'Syncing All Records...' : 'Sync All Records to Firebase'}</span>
              </button>

              {/* User Account / Google Sign In */}
              {user ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="truncate pr-2">
                    <div className="font-medium text-neutral-900 truncate">{user.displayName || user.email}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOutUser()}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 px-2 py-1 rounded"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-neutral-300 bg-white text-neutral-800 text-xs font-medium hover:bg-neutral-50 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Sign In with Google</span>
                </button>
              )}

              <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider pt-1">
                Tools & Export
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onExportCsv();
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium hover:bg-neutral-100"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onRefreshFeed();
                  }}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Sync Feed
                </button>
              </div>

              <a
                href="https://tender.2merkato.com/tenders"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <span>Browse live on 2merkato.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
