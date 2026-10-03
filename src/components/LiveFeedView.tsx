import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  ChevronRight,
  ChevronLeft,
  Building,
  Calendar,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  BookmarkPlus,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';
import { MerkatoTender, TrackedBid } from '../types/tender';
import { formatETB, calculateDaysRemaining, formatDate, STAGE_META } from '../utils/formatters';

interface LiveFeedViewProps {
  tenders: MerkatoTender[];
  trackedBids: TrackedBid[];
  isLoading: boolean;
  onTrackTender: (tender: MerkatoTender) => void;
  onInspectTender: (tender: MerkatoTender) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  categoryId?: string;
  sourceUrl?: string;
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({
  tenders,
  trackedBids,
  isLoading,
  onTrackTender,
  onInspectTender,
  currentPage,
  onPageChange,
  categoryId,
  sourceUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProcType, setSelectedProcType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const categoriesList = [
    { id: 'all', label: 'All Categories' },
    { id: 'medical_health', label: 'Medical & Healthcare' },
    { id: 'it_telecom', label: 'IT & Software' },
    { id: 'construction_civil', label: 'Construction & Civil' },
    { id: 'electrical_energy', label: 'Energy & Power' },
    { id: 'hospitality', label: 'Hospitality & Services' },
    { id: 'consultancy_studies', label: 'Consultancy' },
    { id: 'general_procurement', label: 'General Goods' },
  ];

  // Filter tenders
  const filteredTenders = tenders.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.titleAmharic && t.titleAmharic.includes(searchTerm)) ||
      (t.organizationAmharic && t.organizationAmharic.includes(searchTerm)) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      t.categoryId === selectedCategory ||
      (t.category && t.category.toLowerCase().includes(selectedCategory.replace('_', ' ').toLowerCase()));

    const matchesRegion =
      selectedRegion === 'all' ||
      t.region.toLowerCase().includes(selectedRegion.toLowerCase());

    const matchesProcType =
      selectedProcType === 'all' || t.procurementType === selectedProcType;

    return matchesSearch && matchesCategory && matchesRegion && matchesProcType;
  });

  // Check if a tender is already in user's pipeline
  const getTrackedInfo = (tenderId: string) => {
    return trackedBids.find((b) => b.id === tenderId || b.sourceId === tenderId);
  };

  const regions = [
    { id: 'all', label: 'All Regions' },
    { id: 'Addis Ababa', label: 'Addis Ababa' },
    { id: 'Amhara', label: 'Amhara' },
    { id: 'Oromia', label: 'Oromia' },
    { id: 'Dire Dawa', label: 'Dire Dawa' },
    { id: 'Sidama', label: 'Sidama' },
  ];

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenders by keyword, entity, category, or Amharic title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>

          {/* Region and Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs">
              <span className="px-2 text-neutral-500 font-medium text-[11px]">Region:</span>
              {regions.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedRegion === reg.id
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-md border border-neutral-200 text-xs">
              <span className="px-2 text-neutral-500 font-medium text-[11px]">Type:</span>
              <button
                onClick={() => setSelectedProcType('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedProcType === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedProcType('NCB')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedProcType === 'NCB'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                NCB
              </button>
              <button
                onClick={() => setSelectedProcType('ICB')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  selectedProcType === 'ICB'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                ICB
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-neutral-100 rounded-md border border-neutral-200">
              <button
                onClick={() => setViewMode('table')}
                title="Dense Data Table View"
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Card Grid View"
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar border-t border-neutral-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Field:
          </span>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tender List / Table */}
      {isLoading ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <div className="inline-block w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-neutral-700 mt-3">Connecting to 2Merkato Tender Portal...</p>
          <p className="text-xs text-neutral-500 mt-1">Fetching live public and commercial tenders from 2Merkato portal...</p>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <Building className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900">No tenders match your filter criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Try resetting your region filter or searching for another term such as "Hospital", "University", or "Chemicals".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRegion('all');
              setSelectedProcType('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Data Grid View */
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Tender Opportunity & Entity</th>
                  <th className="py-3 px-3">Type / Region</th>
                  <th className="py-3 px-3">Published / Source</th>
                  <th className="py-3 px-3 text-right">Est. Value (ETB)</th>
                  <th className="py-3 px-3 text-right">Bid Bond (CPO)</th>
                  <th className="py-3 px-3">Closing Date</th>
                  <th className="py-3 px-4 text-right">Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredTenders.map((tender) => {
                  const tracked = getTrackedInfo(tender.id);
                  const deadline = calculateDaysRemaining(tender.closingDate);

                  return (
                    <tr
                      key={tender.id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => onInspectTender(tender)}
                    >
                      {/* Title & Organization */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          {tender.logo ? (
                            <img
                              src={tender.logo}
                              alt={tender.organization}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 object-contain rounded border border-neutral-200 bg-white p-0.5 shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-xs shrink-0">
                              {tender.organization.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-semibold text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                              {tender.title}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-neutral-700">{tender.organization}</span>
                              {tender.category && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 text-neutral-600 font-medium">
                                  {tender.category}
                                </span>
                              )}
                              {tender.organizationAmharic && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-neutral-500 font-amharic truncate max-w-[180px]">
                                    {tender.organizationAmharic}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Region */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-medium text-neutral-800">
                            {tender.procurementType}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {tender.region}
                          </span>
                        </div>
                      </td>

                      {/* Published & Source */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-neutral-800 font-mono text-[11px]">
                          {formatDate(tender.publishedAt)}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                          {tender.sourceMedia}
                        </div>
                      </td>

                      {/* Est Value */}
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className="font-medium text-neutral-900">
                          {formatETB(tender.estimatedContractValueETB)}
                        </span>
                      </td>

                      {/* Bid Bond */}
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="font-medium text-amber-700">
                          {formatETB(tender.bidBondAmountETB)}
                        </div>
                        <span className="text-[10px] text-neutral-400">Doc: ETB {tender.documentFeeETB}</span>
                      </td>

                      {/* Closing Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-neutral-800">
                          {formatDate(tender.closingDate)}
                        </div>
                        <div
                          className={`text-[10px] font-medium ${
                            deadline.urgent ? 'text-rose-600' : 'text-neutral-500'
                          }`}
                        >
                          {deadline.text}
                        </div>
                      </td>

                      {/* Action */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tracked ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{STAGE_META[tracked.stage].label}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onTrackTender(tender)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded transition-colors"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            Track Bid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenders.map((tender) => {
            const tracked = getTrackedInfo(tender.id);
            const deadline = calculateDaysRemaining(tender.closingDate);

            return (
              <div
                key={tender.id}
                onClick={() => onInspectTender(tender)}
                className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {tender.logo ? (
                        <img
                          src={tender.logo}
                          alt={tender.organization}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 object-contain rounded border border-neutral-200 bg-white p-0.5 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-xs shrink-0">
                          {tender.organization.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 truncate">
                          {tender.organization}
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <span>{tender.region} · {tender.procurementType}</span>
                          {tender.category && (
                            <span className="text-neutral-500 font-medium truncate max-w-[140px]">
                              · {tender.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {tracked && (
                      <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        In Pipeline
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-neutral-900 mt-2.5 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {tender.title}
                  </h3>

                  {tender.titleAmharic && tender.titleAmharic !== tender.title && (
                    <p className="text-xs text-neutral-500 font-amharic line-clamp-1 mt-1">
                      {tender.titleAmharic}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase">Est. Value</div>
                      <div className="font-mono font-medium text-neutral-900 tabular-nums">
                        {formatETB(tender.estimatedContractValueETB)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase">Bid Bond (CPO)</div>
                      <div className="font-mono font-medium text-amber-700 tabular-nums">
                        {formatETB(tender.bidBondAmountETB)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={`text-[11px] ${deadline.urgent ? 'text-rose-600 font-medium' : ''}`}>
                      {deadline.text}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    {tracked ? (
                      <button
                        onClick={() => onInspectTender(tender)}
                        className="text-xs text-neutral-700 hover:text-neutral-950 font-medium flex items-center gap-1"
                      >
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onTrackTender(tender)}
                        className="px-2.5 py-1 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors inline-flex items-center gap-1"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg p-3 text-xs">
        <div className="text-neutral-500">
          Showing <span className="font-mono font-medium text-neutral-800">{filteredTenders.length}</span> live tenders
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-2.5 py-1 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <span className="font-mono font-medium px-2 text-neutral-900">
            Page {currentPage}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLoading}
            className="px-2.5 py-1 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
