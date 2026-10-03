import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Download,
  RefreshCw,
  FileText,
  Clock,
  Building,
  ShieldCheck,
  Calculator,
  Database,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  ChevronDown,
  Layers,
  ExternalLink,
  Menu,
  X,
  FileCheck,
  TrendingUp,
  Sparkles,
  Shield,
  Briefcase,
  AlertTriangle,
  Landmark,
} from 'lucide-react';
import { useFirebase } from '../firebase/FirebaseContext';

export type AppView = 'feed' | 'pipeline' | 'deadlines' | 'dossier' | 'cpo' | 'compliance' | 'calculator';

interface TopNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenNewBidModal: () => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  onExportCsv: () => void;
  trackedCount: number;
  onSyncAllToFirebase: () => void;
  isSyncingToFirebase: boolean;
  recordsInDbCount?: number;
  urgentDeadlinesCount?: number;
  pendingCpoCount?: number;
  totalCategoryTenders?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  onOpenNewBidModal,
  onRefreshFeed,
  isRefreshing,
  onExportCsv,
  trackedCount,
  onSyncAllToFirebase,
  isSyncingToFirebase,
  urgentDeadlinesCount = 0,
  pendingCpoCount = 0,
  totalCategoryTenders = 10004,
}) => {
  const { user, dbConnected, isLoggingIn, signInWithGoogle, signOutUser } = useFirebase();
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileHeaderMenu, setShowMobileHeaderMenu] = useState(false);

  const featuresMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(event.target as Node)) {
        setShowFeaturesMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    setShowFeaturesMenu(false);
    setShowMobileHeaderMenu(false);
  };

  const featureItems: Array<{
    view: AppView;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    category: 'Discovery' | 'Pipeline' | 'Compliance' | 'Finance';
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      view: 'feed',
      title: '2Merkato Live Feed',
      description: 'Real-time Ethiopian procurement tenders from 2Merkato & government gazettes',
      icon: FileText,
      category: 'Discovery',
      badge: `${totalCategoryTenders.toLocaleString()}+`,
      badgeColor: 'text-neutral-600 bg-neutral-100',
    },
    {
      view: 'pipeline',
      title: 'Bid Pipeline Board',
      description: 'Multi-stage Kanban from initial qualification to final contract award',
      icon: Layers,
      category: 'Pipeline',
      badge: `${trackedCount} active`,
      badgeColor: 'text-neutral-900 bg-neutral-100 font-semibold',
    },
    {
      view: 'deadlines',
      title: 'Submission Deadlines',
      description: 'Real-time countdowns, transit buffers, and sealed wax tender box delivery checklist',
      icon: Clock,
      category: 'Pipeline',
      badge: urgentDeadlinesCount > 0 ? `${urgentDeadlinesCount} urgent` : undefined,
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      view: 'cpo',
      title: 'CPO & Bank Guarantees',
      description: 'Bid bond issuing, CBE / private bank tracking, 90-day expiry and release manager',
      icon: Landmark,
      category: 'Finance',
      badge: pendingCpoCount > 0 ? `${pendingCpoCount} pending` : undefined,
      badgeColor: 'text-amber-800 bg-amber-50 border border-amber-200',
    },
    {
      view: 'dossier',
      title: 'Company Dossier & Credentials',
      description: 'Verified trade licenses, TIN, VAT, FPPA certificates, key personnel & audits',
      icon: Building,
      category: 'Compliance',
    },
    {
      view: 'compliance',
      title: 'Compliance Matrix',
      description: 'Mandatory statutory readiness checklist across all active tender submissions',
      icon: ShieldCheck,
      category: 'Compliance',
    },
    {
      view: 'calculator',
      title: 'Pricing Engine & VAT',
      description: '15% VAT, 2% withholding tax (WHT) simulator, and gross margin calculator',
      icon: Calculator,
      category: 'Finance',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Section 1: Logo & Brand + Database Sync Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('feed')}
              className="text-left group flex items-center gap-2.5 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-neutral-800 transition-colors">
                <span className="text-emerald-400 font-mono">T</span>P
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-bold tracking-tight text-neutral-950 group-hover:text-neutral-800">
                    TenderPulse
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-medium">
                  2Merkato Procurement
                </span>
              </div>
            </button>

            {/* Cloud Database Status Pill */}
            <div
              title={
                user
                  ? `Firebase Firestore active for ${user.email}. Database: ai-studio-tenderpulse2merk`
                  : 'Firestore provisioned. Sign in with Google to sync all pipeline records.'
              }
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-neutral-200/80 bg-neutral-50 text-neutral-600"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user ? 'bg-emerald-500' : dbConnected ? 'bg-amber-400' : 'bg-neutral-300'
                }`}
              ></span>
              <span className="font-medium text-neutral-700">Firestore:</span>
              <span className="font-mono text-[10px] text-neutral-600">
                {user ? 'Synced' : dbConnected ? 'Ready' : 'Connecting'}
              </span>
            </div>
          </div>

          {/* Section 2: Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {/* 1. Feed */}
            <button
              onClick={() => handleNavClick('feed')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'feed'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2Merkato Feed</span>
            </button>

            {/* 2. Pipeline */}
            <button
              onClick={() => handleNavClick('pipeline')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'pipeline'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bid Pipeline</span>
              {trackedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    currentView === 'pipeline' ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-200/80 text-neutral-800'
                  }`}
                >
                  {trackedCount}
                </span>
              )}
            </button>

            {/* 3. Deadlines */}
            <button
              onClick={() => handleNavClick('deadlines')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'deadlines'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${urgentDeadlinesCount > 0 ? 'text-rose-500' : ''}`} />
              <span>Deadlines</span>
              {urgentDeadlinesCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            {/* 4. CPO & Bonds */}
            <button
              onClick={() => handleNavClick('cpo')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'cpo'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>CPO & Bonds</span>
              {pendingCpoCount > 0 && (
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-mono">
                  {pendingCpoCount}
                </span>
              )}
            </button>

            {/* 5. Company Dossier */}
            <button
              onClick={() => handleNavClick('dossier')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'dossier'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Company Dossier</span>
            </button>

            {/* 6. "All Features" Mega-Menu Trigger */}
            <div className="relative" ref={featuresMenuRef}>
              <button
                type="button"
                onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                  showFeaturesMenu || currentView === 'compliance' || currentView === 'calculator'
                    ? 'bg-neutral-100 text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
                aria-expanded={showFeaturesMenu}
              >
                <span>All Features</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFeaturesMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-Dropdown Panel */}
              {showFeaturesMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[460px] bg-white border border-neutral-200 rounded-xl shadow-xl p-3 z-50 animate-fade-in text-xs">
                  <div className="px-2 py-1.5 mb-2 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Procurement Modules & Tooling
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Enterprise Suite
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {featureItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.view;
                      return (
                        <button
                          key={item.view}
                          onClick={() => handleNavClick(item.view)}
                          className={`p-2 rounded-lg text-left transition-colors flex items-start gap-2.5 ${
                            isActive
                              ? 'bg-neutral-900 text-white'
                              : 'hover:bg-neutral-50 text-neutral-800'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                              isActive
                                ? 'bg-neutral-800 text-emerald-400'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className="font-semibold text-xs truncate">{item.title}</span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded shrink-0 ${
                                    isActive ? 'bg-neutral-800 text-neutral-200' : item.badgeColor
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] leading-tight line-clamp-1 mt-0.5 ${
                                isActive ? 'text-neutral-300' : 'text-neutral-500'
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Utilities Strip inside Dropdown */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600 px-1">
                    <button
                      onClick={() => {
                        setShowFeaturesMenu(false);
                        onExportCsv();
                      }}
                      className="inline-flex items-center gap-1 hover:text-neutral-900 font-medium"
                    >
                      <Download className="w-3 h-3 text-neutral-500" />
                      Export Pipeline CSV
                    </button>
                    <a
                      href="https://tender.2merkato.com/tenders"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:text-neutral-900 font-medium text-neutral-500"
                    >
                      <span>2merkato.com Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Section 3: Header Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Refresh Live Feed */}
            {currentView === 'feed' && (
              <button
                onClick={onRefreshFeed}
                disabled={isRefreshing}
                title="Sync live tenders with tender.2merkato.com"
                className="p-1.5 sm:p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
                />
              </button>
            )}


            {/* Quick Export CSV Button */}
            <button
              onClick={onExportCsv}
              title="Export tracked pipeline to CSV spreadsheet"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-950 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export</span>
            </button>

            {/* User Profile & Auth Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
                  title={`Signed in as ${user.email}`}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center">
                      {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in text-xs">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">
                        {user.displayName || 'Authorized User'}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Cloud Database Linked</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onSyncAllToFirebase();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700 flex items-center gap-2 font-medium"
                      >
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Push All Records to Cloud</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onExportCsv();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-neutral-700 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Export CSV Pipeline</span>
                      </button>
                    </div>

                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOutUser();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={isLoggingIn}
                title="Sign in with Google to enable real-time Firebase sync"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-950 transition-colors whitespace-nowrap shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Primary Action Button: Track Tender */}
            <button
              onClick={onOpenNewBidModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 min-h-[38px] text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span>Track Tender</span>
            </button>

            {/* Mobile / Tablet Menu Button Toggle */}
            <button
              onClick={() => setShowMobileHeaderMenu(!showMobileHeaderMenu)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Toggle navigation menu"
            >
              {showMobileHeaderMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Full Header Menu Overlay */}
      {showMobileHeaderMenu && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Header context */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Procurement Features & Modules
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Firestore Active</span>
            </div>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featureItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50/80 border-neutral-200/70 text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-md ${
                        isActive ? 'bg-neutral-800 text-emerald-400' : 'bg-white border border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.title}</div>
                      <div className={`text-[10px] ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isActive ? 'bg-neutral-800 text-neutral-200' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions in Mobile Menu */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Quick Operations & Tools
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowMobileHeaderMenu(false);
                  onExportCsv();
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium hover:bg-neutral-100"
              >
                <Download className="w-3.5 h-3.5 text-neutral-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setShowMobileHeaderMenu(false);
                  onRefreshFeed();
                }}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Feed</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </header>
  );
};
