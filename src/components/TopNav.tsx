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
  ChevronDown,
  Layers,
  ExternalLink,
  Menu,
  X,
  LogIn,
  LogOut,
  Sparkles,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
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
  onSyncAllToFirebase?: () => void;
  isSyncingToFirebase?: boolean;
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
  urgentDeadlinesCount = 0,
  pendingCpoCount = 0,
  totalCategoryTenders = 10004,
}) => {
  const { user, isLoggingIn, signInWithGoogle, signOutUser } = useFirebase();
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

  const discoveryAndPipelineFeatures = [
    {
      view: 'feed' as AppView,
      title: '2Merkato Live Feed',
      subtitle: 'Real-time Ethiopian Tenders',
      description: 'Scraped tender notices from 2Merkato, regional bureaus & official government gazettes.',
      icon: FileText,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      badge: `${totalCategoryTenders.toLocaleString()}+ live`,
      badgeStyle: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono',
    },
    {
      view: 'pipeline' as AppView,
      title: 'Bid Pipeline Kanban',
      subtitle: 'Multi-Stage Proposal Flow',
      description: 'Track submissions from qualification and technical prep to opening and award.',
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      badge: trackedCount > 0 ? `${trackedCount} active` : '0 active',
      badgeStyle: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
    },
    {
      view: 'deadlines' as AppView,
      title: 'Submission Deadlines',
      subtitle: 'Closing Timers & Courier Buffer',
      description: 'Live countdowns, wax-sealed envelope checklist & Addis Ababa traffic transit buffers.',
      icon: Clock,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      badge: urgentDeadlinesCount > 0 ? `${urgentDeadlinesCount} urgent` : undefined,
      badgeStyle: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold animate-pulse',
    },
  ];

  const complianceAndFinanceFeatures = [
    {
      view: 'cpo' as AppView,
      title: 'CPO & Bank Guarantees',
      subtitle: 'Bid Bond & Security Tracking',
      description: 'Manage Commercial Bank of Ethiopia (CBE) & private bank CPOs with 90-day expiry tracking.',
      icon: Landmark,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      badge: pendingCpoCount > 0 ? `${pendingCpoCount} pending` : undefined,
      badgeStyle: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    },
    {
      view: 'dossier' as AppView,
      title: 'Company Dossier & Vault',
      subtitle: 'Licenses, TIN, VAT & Personnel',
      description: 'Store renewed commercial trade licenses, tax clearance, FPPA certificates & staff CVs.',
      icon: Building,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60',
      badge: 'Statutory',
      badgeStyle: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    },
    {
      view: 'compliance' as AppView,
      title: 'Compliance Matrix',
      subtitle: 'Statutory Eligibility Verification',
      description: 'Pre-flight check against mandatory tender requirements, tax clearance & valid certificates.',
      icon: ShieldCheck,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/60',
      badge: 'Audit Ready',
      badgeStyle: 'bg-teal-50 text-teal-700 border border-teal-200 font-medium',
    },
    {
      view: 'calculator' as AppView,
      title: 'Pricing Engine & VAT',
      subtitle: '15% VAT & 2% Withholding (WHT)',
      description: 'Simulate gross margins, Ethiopian statutory taxes, customs duties & final offer pricing.',
      icon: Calculator,
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/60',
      badge: 'Financial',
      badgeStyle: 'bg-sky-50 text-sky-700 border border-sky-200',
    },
  ];

  const allFeatures = [...discoveryAndPipelineFeatures, ...complianceAndFinanceFeatures];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Brand & Logo */}
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live System Online"></span>
                </div>
                <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-medium">
                  2Merkato Procurement
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Primary Navigation */}
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

            {/* 6. All Features Mega-Menu Trigger */}
            <div className="relative" ref={featuresMenuRef}>
              <button
                type="button"
                onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 border ${
                  showFeaturesMenu || currentView === 'compliance' || currentView === 'calculator'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200/90 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
                aria-expanded={showFeaturesMenu}
              >
                <Sparkles className={`w-3.5 h-3.5 ${showFeaturesMenu ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="font-semibold">All Features</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  showFeaturesMenu ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-200/70 text-neutral-600'
                }`}>
                  7
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFeaturesMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega-Dropdown Menu */}
              {showFeaturesMenu && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white border border-neutral-200 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in text-xs ring-1 ring-black/5">
                  {/* Mega Menu Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        TP
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-xs">
                          Ethiopian Procurement Intelligence Suite
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Complete modular tools for tracking, complying, and bidding on 2Merkato & government tenders
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Full Suite Active</span>
                    </div>
                  </div>

                  {/* 2-Column Module Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column: Discovery & Pipeline Execution */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        <Layers className="w-3 h-3 text-neutral-400" />
                        <span>Discovery & Pipeline Lifecycle</span>
                      </div>
                      {discoveryAndPipelineFeatures.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.view;
                        return (
                          <button
                            key={item.view}
                            onClick={() => handleNavClick(item.view)}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 border ${
                              isActive
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white hover:bg-neutral-50/90 border-transparent hover:border-neutral-200/80 text-neutral-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-neutral-800 text-emerald-400' : item.iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`font-semibold text-xs truncate ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                                    isActive ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : item.badgeStyle
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className={`text-[10px] font-medium mt-0.2 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                {item.subtitle}
                              </div>
                              <p className={`text-[10px] leading-tight line-clamp-2 mt-1 ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Column: Statutory Compliance & Financial Tools */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        <ShieldCheck className="w-3 h-3 text-neutral-400" />
                        <span>Compliance & Financial Risk</span>
                      </div>
                      {complianceAndFinanceFeatures.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.view;
                        return (
                          <button
                            key={item.view}
                            onClick={() => handleNavClick(item.view)}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 border ${
                              isActive
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white hover:bg-neutral-50/90 border-transparent hover:border-neutral-200/80 text-neutral-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-neutral-800 text-emerald-400' : item.iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`font-semibold text-xs truncate ${isActive ? 'text-white' : 'text-neutral-900'}`}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                                    isActive ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : item.badgeStyle
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className={`text-[10px] font-medium mt-0.2 ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                {item.subtitle}
                              </div>
                              <p className={`text-[10px] leading-tight line-clamp-2 mt-1 ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mega Menu Footer Utilities & Portal Links */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/80 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setShowFeaturesMenu(false);
                          onExportCsv();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-950 font-medium transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export Pipeline CSV</span>
                      </button>
                      <span className="text-neutral-300">•</span>
                      <button
                        onClick={() => {
                          setShowFeaturesMenu(false);
                          onOpenNewBidModal();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-950 font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Quick Track Tender</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <a
                        href="https://tender.2merkato.com/tenders"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-950 font-medium transition-colors"
                      >
                        <span>2merkato.com</span>
                        <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                      </a>
                      <a
                        href="https://egp.ppa.gov.et"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-950 font-medium transition-colors"
                      >
                        <span>FPPA e-GP</span>
                        <ArrowUpRight className="w-3 h-3 text-neutral-400" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Header Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Refresh Live Feed (only on feed view) */}
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
              <span>Export CSV</span>
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
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center">
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
                        <span>Connected User</span>
                      </div>
                    </div>

                    <div className="py-1">
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
                title="Sign in with Google"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 hover:text-neutral-950 transition-colors whitespace-nowrap shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Primary Action Button: Track Tender */}
            <button
              onClick={onOpenNewBidModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs active:scale-98"
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
              Procurement Features & Modules ({allFeatures.length})
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Ethiopian Suite
            </span>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allFeatures.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-start justify-between p-3 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50/80 border-neutral-200/70 text-neutral-800 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-neutral-800 text-emerald-400' : item.iconBg
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{item.title}</div>
                      <div className={`text-[10px] font-medium ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {item.subtitle}
                      </div>
                      <div className={`text-[10px] line-clamp-1 mt-0.5 ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ml-2 ${
                        isActive ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : item.badgeStyle
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
                  onOpenNewBidModal();
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium hover:bg-neutral-100"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-600" />
                <span>Track Tender</span>
              </button>

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
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
