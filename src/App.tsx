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
import { MobileBottomNav } from './components/MobileBottomNav';
import { generateTenderDossierPdf } from './utils/tenderPdfGenerator';
import { useFirebase } from './firebase/FirebaseContext';
import { auth } from './firebase/config';
import {
  saveTrackedBidToFirebase,
  deleteTrackedBidFromFirebase,
  saveCompanyProfileToFirebase,
  saveDocumentToFirebase,
  deleteDocumentFromFirebase,
  savePersonnelToFirebase,
  deletePersonnelFromFirebase,
  saveExperienceToFirebase,
  deleteExperienceFromFirebase,
  saveAuditReportToFirebase,
  deleteAuditReportFromFirebase,
  saveTechnicalOfferToFirebase,
  deleteTechnicalOfferFromFirebase,
  syncAllRecordsToFirebase,
  subscribeToUserRecords,
} from './firebase/databaseService';

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
  const { user, dbConnected, signInWithGoogle } = useFirebase();
  const [currentView, setCurrentView] = useState<AppView>('feed');
  const [tenders, setTenders] = useState<MerkatoTender[]>([]);
  const [isSyncingToFirebase, setIsSyncingToFirebase] = useState<boolean>(false);
  const [hasPromptedAutoSync, setHasPromptedAutoSync] = useState<boolean>(false);

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

  // Realtime Firestore synchronization for authenticated user
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserRecords(user.uid, {
      onBids: (cloudBids) => {
        if (cloudBids && cloudBids.length > 0) {
          setTrackedBids(cloudBids);
        }
      },
      onCompany: (cloudCompany) => {
        if (cloudCompany && cloudCompany.companyName) {
          setCompany(cloudCompany);
        }
      },
      onDocuments: (cloudDocs) => {
        if (cloudDocs && cloudDocs.length > 0) {
          setDocuments(cloudDocs);
        }
      },
      onPersonnel: (cloudPersonnel) => {
        if (cloudPersonnel && cloudPersonnel.length > 0) {
          setPersonnel(cloudPersonnel);
        }
      },
      onExperiences: (cloudExperiences) => {
        if (cloudExperiences && cloudExperiences.length > 0) {
          setExperiences(cloudExperiences);
        }
      },
      onAuditReports: (cloudAudits) => {
        if (cloudAudits && cloudAudits.length > 0) {
          setAuditReports(cloudAudits);
        }
      },
      onTechnicalOffers: (cloudOffers) => {
        if (cloudOffers && cloudOffers.length > 0) {
          setTechnicalOffers(cloudOffers);
        }
      },
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Bulk push all records into Firestore database
  const handleSyncAllToFirebase = async () => {
    let targetUid = user?.uid || auth.currentUser?.uid;

    if (!targetUid) {
      showToast('Opening Google Sign-In to connect your database...');
      try {
        await signInWithGoogle();
        targetUid = auth.currentUser?.uid;
      } catch (e: any) {
        showToast('Google Sign-In canceled or interrupted.');
        return;
      }
    }

    if (!targetUid) {
      showToast('Sign in with Google to sync records to Firebase.');
      return;
    }

    setIsSyncingToFirebase(true);
    showToast('Syncing all records to Firebase Firestore...');

    try {
      const result = await syncAllRecordsToFirebase(targetUid, {
        trackedBids,
        company,
        documents,
        personnel,
        experiences,
        auditReports,
        technicalOffers,
      });

      if (result.count > 0) {
        showToast(`Successfully added ${result.count} records to Firebase Firestore!`);
      } else {
        showToast('All records up to date in Firestore.');
      }
    } catch (err: any) {
      console.error('Error during bulk database sync:', err);
      showToast(`Database sync error: ${err.message || 'Check connection'}`);
    } finally {
      setIsSyncingToFirebase(false);
    }
  };

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
    if (user?.uid) {
      saveTrackedBidToFirebase(user.uid, newBid).catch(console.error);
    }
    showToast(`Tracked tender ${refNo} added to Bid Pipeline!`);
  };

  // Update bid stage
  const handleUpdateBidStage = (bidId: string, newStage: TenderStage) => {
    setTrackedBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          const updated = { ...b, stage: newStage };
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, updated).catch(console.error);
          }
          return updated;
        }
        return b;
      })
    );
    showToast(`Stage updated to ${newStage}`);
  };

  // Update whole bid
  const handleUpdateBid = (updatedBid: TrackedBid) => {
    setTrackedBids((prev) =>
      prev.map((b) => (b.id === updatedBid.id ? updatedBid : b))
    );
    if (user?.uid) {
      saveTrackedBidToFirebase(user.uid, updatedBid).catch(console.error);
    }
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
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, updated).catch(console.error);
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
          const updated = {
            ...b,
            complianceChecklist: b.complianceChecklist.map((c) =>
              c.id === itemId ? { ...c, completed: !c.completed } : c
            ),
          };
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, updated).catch(console.error);
          }
          return updated;
        }
        return b;
      })
    );
  };

  // Save calculated price
  const handleSavePrice = (bidId: string, ourBidAmountETB: number, targetMarginPercent: number) => {
    setTrackedBids((prev) =>
      prev.map((b) => {
        if (b.id === bidId) {
          const updated = { ...b, ourBidAmountETB, targetMarginPercent };
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, updated).catch(console.error);
          }
          return updated;
        }
        return b;
      })
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

  const urgentDeadlinesCount = trackedBids.filter((b) => {
    const diffHours = (new Date(b.closingDate).getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 72;
  }).length;

  const pendingCpoCount = trackedBids.filter(
    (b) => b.cpoStatus === 'Required' || b.cpoStatus === 'Drafted'
  ).length;

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
        onSyncAllToFirebase={handleSyncAllToFirebase}
        isSyncingToFirebase={isSyncingToFirebase}
        urgentDeadlinesCount={urgentDeadlinesCount}
        pendingCpoCount={pendingCpoCount}
        totalCategoryTenders={totalCategoryTenders}
      />



      {/* Header Context & Tabular Metrics Strip */}
      <HeaderMetrics


        totalCategoryTenders={totalCategoryTenders}
        trackedBids={trackedBids}
        isLiveFeed={true}
        activeCategoryId="all"
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-12">
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
            onUpdateCompany={(updated) => {
              setCompany(updated);
              if (user?.uid) {
                saveCompanyProfileToFirebase(user.uid, updated).catch(console.error);
              }
            }}
            documents={documents}
            onAddDocument={(docItem) => {
              setDocuments((prev) => [docItem, ...prev]);
              if (user?.uid) {
                saveDocumentToFirebase(user.uid, docItem).catch(console.error);
              }
            }}
            onDeleteDocument={(id) => {
              setDocuments((prev) => prev.filter((d) => d.id !== id));
              if (user?.uid) {
                deleteDocumentFromFirebase(user.uid, id).catch(console.error);
              }
            }}
            personnel={personnel}
            onAddPersonnel={(p) => {
              setPersonnel((prev) => [p, ...prev]);
              if (user?.uid) {
                savePersonnelToFirebase(user.uid, p).catch(console.error);
              }
            }}
            onDeletePersonnel={(id) => {
              setPersonnel((prev) => prev.filter((p) => p.id !== id));
              if (user?.uid) {
                deletePersonnelFromFirebase(user.uid, id).catch(console.error);
              }
            }}
            experiences={experiences}
            onAddExperience={(exp) => {
              setExperiences((prev) => [exp, ...prev]);
              if (user?.uid) {
                saveExperienceToFirebase(user.uid, exp).catch(console.error);
              }
            }}
            onDeleteExperience={(id) => {
              setExperiences((prev) => prev.filter((e) => e.id !== id));
              if (user?.uid) {
                deleteExperienceFromFirebase(user.uid, id).catch(console.error);
              }
            }}
            auditReports={auditReports}
            onAddAuditReport={(rep) => {
              setAuditReports((prev) => [rep, ...prev]);
              if (user?.uid) {
                saveAuditReportToFirebase(user.uid, rep).catch(console.error);
              }
            }}
            onDeleteAuditReport={(id) => {
              setAuditReports((prev) => prev.filter((a) => a.id !== id));
              if (user?.uid) {
                deleteAuditReportFromFirebase(user.uid, id).catch(console.error);
              }
            }}
            technicalOffers={technicalOffers}
            onAddTechnicalOffer={(to) => {
              setTechnicalOffers((prev) => [...prev, to]);
              if (user?.uid) {
                saveTechnicalOfferToFirebase(user.uid, to).catch(console.error);
              }
            }}
            onDeleteTechnicalOffer={(id) => {
              setTechnicalOffers((prev) => prev.filter((t) => t.id !== id));
              if (user?.uid) {
                deleteTechnicalOfferFromFirebase(user.uid, id).catch(console.error);
              }
            }}
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

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        trackedCount={trackedBids.length}
        onRefreshFeed={() => {
          setIsRefreshing(true);
          fetchTenders(currentPage);
        }}
        isRefreshing={isRefreshing}
        onExportCsv={handleExportCsv}
        onSyncAllToFirebase={handleSyncAllToFirebase}
        isSyncingToFirebase={isSyncingToFirebase}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-5 right-3 sm:right-5 z-50 bg-neutral-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl border border-neutral-800 animate-fade-in flex items-center gap-2 max-w-[90vw]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="truncate">{toastMessage}</span>
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
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, updated).catch(console.error);
          }
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
          if (user?.uid) {
            saveTrackedBidToFirebase(user.uid, newBid).catch(console.error);
          }
          showToast(`Bid ${newBid.internalRefNo} registered in pipeline!`);
        }}
        defaultCategoryId="general_procurement"
      />

    </div>
  );
}
