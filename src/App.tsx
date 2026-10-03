import React, { useState, useEffect } from 'react';
import {
  MerkatoTender,
  TrackedBid,
  TenderStage,
  CpoStatus,
  CompanyProfile,
  UploadedDocument,
  KeyPersonnel,
  PastExperience,
  AuditReport,
  TechnicalOfferItem,
} from './types/tender';
import { INITIAL_TRACKED_BIDS, DEFAULT_CATEGORY_2MERKATO, STANDARD_COMPLIANCE_ITEMS } from './data/mockTenders';
import {
  DEFAULT_COMPANY_PROFILE,
  DEFAULT_COMPANY_DOCUMENTS,
  DEFAULT_KEY_PERSONNEL,
  DEFAULT_PAST_EXPERIENCES,
  DEFAULT_AUDIT_REPORTS,
  DEFAULT_TECHNICAL_OFFER_ITEMS,
} from './data/companyDossierDefaults';
import { TopNav, AppView } from './components/TopNav';
import { HeaderMetrics } from './components/HeaderMetrics';
import { LiveFeedView } from './components/LiveFeedView';
import { PipelineBoard } from './components/PipelineBoard';
import { DeadlineTrackerView } from './components/DeadlineTrackerView';
import { CompanyDossierView } from './components/CompanyDossierView';
import { CpoManagerView } from './components/CpoManagerView';
import { ComplianceMatrixView } from './components/ComplianceMatrixView';
import { PricingEngineView } from './components/PricingEngineView';
import { TenderDetailModal } from './components/TenderDetailModal';
import { BidCalculatorModal } from './components/BidCalculatorModal';
import { NewBidModal } from './components/NewBidModal';
import { generateTenderDossierPdf } from './utils/tenderPdfGenerator';

const STORAGE_KEYS = {
  BIDS: 'tenderpulse_tracked_bids_v2',
  COMPANY: 'tenderpulse_company_profile_v2',
  DOCUMENTS: 'tenderpulse_documents_v2',
  PERSONNEL: 'tenderpulse_personnel_v2',
  EXPERIENCES: 'tenderpulse_experiences_v2',
  AUDIT: 'tenderpulse_audits_v2',
  TECHNICAL: 'tenderpulse_technical_offers_v2',
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [tenders, setTenders] = useState<MerkatoTender[]>([]);

  // Tracked Bids
  const [trackedBids, setTrackedBids] = useState<TrackedBid[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load bids from storage', e);
    }
    return INITIAL_TRACKED_BIDS;
  });

  // Company Profile & Credentials
  const [company, setCompany] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load company profile from storage', e);
    }
    return DEFAULT_COMPANY_PROFILE;
  });

  // Uploaded Documents & Licenses
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load documents from storage', e);
    }
    return DEFAULT_COMPANY_DOCUMENTS;
  });

  // Key Personnel
  const [personnel, setPersonnel] = useState<KeyPersonnel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERSONNEL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load personnel from storage', e);
    }
    return DEFAULT_KEY_PERSONNEL;
  });

  // Past Experiences
  const [experiences, setExperiences] = useState<PastExperience[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load experiences from storage', e);
    }
    return DEFAULT_PAST_EXPERIENCES;
  });

  // Audit Reports
  const [auditReports, setAuditReports] = useState<AuditReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load audits from storage', e);
    }
    return DEFAULT_AUDIT_REPORTS;
  });

  // Technical Offer Specifications
  const [technicalOffers, setTechnicalOffers] = useState<TechnicalOfferItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TECHNICAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load technical offers from storage', e);
    }
    return DEFAULT_TECHNICAL_OFFER_ITEMS;
  });

  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCategoryTenders, setTotalCategoryTenders] = useState<number>(10004);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedTenderForInspect, setSelectedTenderForInspect] = useState<MerkatoTender | TrackedBid | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState<boolean>(false);
  const [selectedBidForCalc, setSelectedBidForCalc] = useState<TrackedBid | null>(null);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);
  const [isNewBidModalOpen, setIsNewBidModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(trackedBids));
    } catch (e) {
      console.error(e);
    }
  }, [trackedBids]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
    } catch (e) {
      console.error(e);
    }
  }, [company]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONNEL, JSON.stringify(personnel));
    } catch (e) {
      console.error(e);
    }
  }, [personnel]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiences));
    } catch (e) {
      console.error(e);
    }
  }, [experiences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditReports));
    } catch (e) {
      console.error(e);
    }
  }, [auditReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TECHNICAL, JSON.stringify(technicalOffers));
    } catch (e) {
      console.error(e);
    }
  }, [technicalOffers]);

  // Fetch live tenders from 2Merkato server proxy
  const fetchTenders = async (page: number) => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch(`/api/2merkato/tenders?page=${page}`);
      const data = await res.json();
      if (data && data.tenders) {
        setTenders(data.tenders);
        if (data.total) setTotalCategoryTenders(data.total);
      }
    } catch (err) {
      console.error('Error fetching 2merkato tenders:', err);
    } finally {
      setIsLoadingFeed(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenders(currentPage);
  }, [currentPage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Track tender from feed
  const handleTrackTender = (tender: MerkatoTender) => {
    const existing = trackedBids.find((b) => b.id === tender.id || b.sourceId === tender.id);
    if (existing) {
      showToast(`Already tracked in pipeline (${existing.internalRefNo})`);
      return;
    }

    const refNo = `TP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const closeDate = new Date(tender.closingDate);
    const targetDate = new Date(closeDate.getTime() - 2.5 * 60 * 60 * 1000); // 2.5 hrs before closing

    const newBid: TrackedBid = {
      ...tender,
      internalRefNo: refNo,
      stage: 'lead',
      assignedTo: 'Jordan Zewdu',
      ourBidAmountETB: Math.round(tender.estimatedContractValueETB * 0.94),
      targetMarginPercent: 18.0,
      cpoStatus: 'Required',
      urgent: false,
      importedAt: new Date().toISOString(),
      submissionTargetDate: targetDate.toISOString(),
      submissionLocation: `${tender.organization} Procurement Directorate Tender Box`,
      submissionMethod: 'Physical Sealed Box',
      dispatchBufferHours: 2,
      submissionMilestones: {
        cpoReady: false,
        technicalReady: false,
        financialReady: false,
        sealedWax: false,
        deliveredToBox: false,
      },
      notes: `Imported from 2Merkato portal on ${new Date().toLocaleDateString()}. Initial qualification required.`,
      complianceChecklist: [...STANDARD_COMPLIANCE_ITEMS],
    };

    setTrackedBids((prev) => [newBid, ...prev]);
    showToast(`Tracked tender ${refNo} added to Bid Pipeline!`);
  };

  // Update bid stage
  const handleUpdateBidStage = (bidId: string, newStage: TenderStage) => {
    setTrackedBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, stage: newStage } : b))
    );
    showToast(`Stage updated to ${newStage}`);
  };

  // Update whole bid
  const handleUpdateBid = (updatedBid: TrackedBid) => {
    setTrackedBids((prev) =>
      prev.map((b) => (b.id === updatedBid.id ? updatedBid : b))
    );
  };

  // Update CPO status
  const handleUpdateCpoStatus = (bidId: string, status: CpoStatus, bank?: string, cpoNumber?: string) => {
    setTrackedBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          const updated = { ...b, cpoStatus: status };
          if (bank) updated.cpoBank = bank;
          if (cpoNumber) updated.cpoNumber = cpoNumber;
          if (status === 'Issued') {
            updated.cpoIssueDate = new Date().toISOString().split('T')[0];
            updated.cpoExpiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (updated.submissionMilestones) updated.submissionMilestones.cpoReady = true;
          }
          if (status === 'Released') {
            updated.cpoReturnedDate = new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return b;
      })
    );
    showToast(`CPO guarantee status updated: ${status}`);
  };

  // Toggle compliance item
  const handleToggleComplianceItem = (bidId: string, itemId: string) => {
    setTrackedBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          return {
            ...b,
            complianceChecklist: b.complianceChecklist.map((c) =>
              c.id === itemId ? { ...c, completed: !c.completed } : c
            ),
          };
        }
        return b;
      })
    );
  };

  // Save calculated price
  const handleSavePrice = (bidId: string, ourBidAmountETB: number, targetMarginPercent: number) => {
    setTrackedBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? { ...b, ourBidAmountETB, targetMarginPercent }
          : b
      )
    );
    showToast('Updated tender quotation saved!');
  };

  // Open inspection modal
  const handleInspectTender = (tender: MerkatoTender) => {
    const trackedMatch = trackedBids.find((b) => b.id === tender.id || b.sourceId === tender.id);
    setSelectedTenderForInspect(trackedMatch || tender);
    setIsInspectModalOpen(true);
  };

  // Open calculator modal for a specific bid
  const handleOpenCalculator = (bid: TrackedBid) => {
    setSelectedBidForCalc(bid);
    setIsCalcModalOpen(true);
  };

  // Generate full PDF directly
  const handleDownloadPdf = (bid: TrackedBid) => {
    try {
      const doc = generateTenderDossierPdf({
        bid,
        company,
        documents,
        personnel,
        experiences,
        auditReports,
        technicalOffers,
      });
      const safeTitle = bid.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`TENDER_SUBMISSION_${bid.internalRefNo}_${safeTitle}.pdf`);
      showToast(`Generated & downloaded full tender dossier PDF!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Error generating PDF: ${err.message}`);
    }
  };

  // Export pipeline to CSV
  const handleExportCsv = () => {
    const headers = [
      'Internal Ref',
      'Tender Title',
      'Procuring Entity',
      'Category',
      'Region',
      'Procurement Type',
      'Stage',
      'Submission Target',
      'Closing Deadline',
      'Submission Location',
      'Est Budget (ETB)',
      'Our Bid (ETB)',
      'Target Margin %',
      'Bid Bond / CPO (ETB)',
      'CPO Status',
      'Assigned Manager',
    ];

    const rows = trackedBids.map((b) => [
      `"${b.internalRefNo}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.organization.replace(/"/g, '""')}"`,
      `"${(b.category || b.categoryId).replace(/"/g, '""')}"`,
      `"${b.region}"`,
      `"${b.procurementType}"`,
      `"${b.stage}"`,
      `"${b.submissionTargetDate ? b.submissionTargetDate.split('T')[0] : ''}"`,
      `"${b.closingDate.split('T')[0]}"`,
      `"${(b.submissionLocation || '').replace(/"/g, '""')}"`,
      b.estimatedContractValueETB,
      b.ourBidAmountETB,
      b.targetMarginPercent,
      b.bidBondAmountETB,
      `"${b.cpoStatus}"`,
      `"${b.assignedTo}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tenderpulse_pipeline_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported pipeline to CSV successfully');
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewBidModal={() => setIsNewBidModalOpen(true)}
        onRefreshFeed={() => {
          setIsRefreshing(true);
          fetchTenders(currentPage);
        }}
        isRefreshing={isRefreshing}
        onExportCsv={handleExportCsv}
        trackedCount={trackedBids.length}
      />

      {/* Header Context & Tabular Metrics Strip */}
      <HeaderMetrics
        totalCategoryTenders={totalCategoryTenders}
        trackedBids={trackedBids}
        isLiveFeed={true}
        activeCategoryId="all"
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'feed' && (
          <LiveFeedView
            tenders={tenders}
            trackedBids={trackedBids}
            isLoading={isLoadingFeed}
            onTrackTender={handleTrackTender}
            onInspectTender={handleInspectTender}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            categoryId="all"
            sourceUrl="https://tender.2merkato.com/tenders"
          />
        )}

        {currentView === 'pipeline' && (
          <PipelineBoard
            bids={trackedBids}
            onUpdateBidStage={handleUpdateBidStage}
            onOpenBidDetail={(bid) => {
              setSelectedTenderForInspect(bid);
              setIsInspectModalOpen(true);
            }}
            onOpenCalculator={handleOpenCalculator}
          />
        )}

        {currentView === 'deadlines' && (
          <DeadlineTrackerView
            bids={trackedBids}
            company={company}
            documents={documents}
            personnel={personnel}
            experiences={experiences}
            auditReports={auditReports}
            technicalOffers={technicalOffers}
            onUpdateBid={handleUpdateBid}
            onShowToast={showToast}
          />
        )}

        {currentView === 'dossier' && (
          <CompanyDossierView
            company={company}
            onUpdateCompany={setCompany}
            documents={documents}
            onAddDocument={(doc) => setDocuments((prev) => [doc, ...prev])}
            onDeleteDocument={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
            personnel={personnel}
            onAddPersonnel={(p) => setPersonnel((prev) => [p, ...prev])}
            onDeletePersonnel={(id) => setPersonnel((prev) => prev.filter((p) => p.id !== id))}
            experiences={experiences}
            onAddExperience={(exp) => setExperiences((prev) => [exp, ...prev])}
            onDeleteExperience={(id) => setExperiences((prev) => prev.filter((e) => e.id !== id))}
            auditReports={auditReports}
            onAddAuditReport={(rep) => setAuditReports((prev) => [rep, ...prev])}
            onDeleteAuditReport={(id) => setAuditReports((prev) => prev.filter((a) => a.id !== id))}
            technicalOffers={technicalOffers}
            onAddTechnicalOffer={(to) => setTechnicalOffers((prev) => [...prev, to])}
            onDeleteTechnicalOffer={(id) => setTechnicalOffers((prev) => prev.filter((t) => t.id !== id))}
            trackedBids={trackedBids}
            onShowToast={showToast}
          />
        )}

        {currentView === 'cpo' && (
          <CpoManagerView
            bids={trackedBids}
            onUpdateCpoStatus={handleUpdateCpoStatus}
            onOpenBidDetail={(bid) => {
              setSelectedTenderForInspect(bid);
              setIsInspectModalOpen(true);
            }}
          />
        )}

        {currentView === 'compliance' && (
          <ComplianceMatrixView
            bids={trackedBids}
            onToggleComplianceItem={handleToggleComplianceItem}
            onOpenBidDetail={(bid) => {
              setSelectedTenderForInspect(bid);
              setIsInspectModalOpen(true);
            }}
          />
        )}

        {currentView === 'calculator' && (
          <PricingEngineView
            bids={trackedBids}
            onSavePrice={handleSavePrice}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl border border-neutral-800 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <TenderDetailModal
        tender={selectedTenderForInspect}
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        onTrackTender={handleTrackTender}
        onUpdateTrackedBid={(updated) => {
          setTrackedBids((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          showToast('Updated bid details saved');
        }}
        onDownloadPdf={handleDownloadPdf}
        isTracked={
          !!selectedTenderForInspect &&
          trackedBids.some((b) => b.id === selectedTenderForInspect.id || b.sourceId === selectedTenderForInspect.id)
        }
      />

      <BidCalculatorModal
        bid={selectedBidForCalc}
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        onSavePrice={handleSavePrice}
      />

      <NewBidModal
        isOpen={isNewBidModalOpen}
        onClose={() => setIsNewBidModalOpen(false)}
        onAddBid={(newBid) => {
          setTrackedBids((prev) => [newBid, ...prev]);
          showToast(`Bid ${newBid.internalRefNo} registered in pipeline!`);
        }}
        defaultCategoryId="general_procurement"
      />
    </div>
  );
}
