import React, { useState, useRef } from 'react';
import {
  CompanyProfile,
  UploadedDocument,
  KeyPersonnel,
  PastExperience,
  AuditReport,
  TechnicalOfferItem,
  TrackedBid,
} from '../types/tender';
import { formatETB, formatDate } from '../utils/formatters';
import { generateTenderDossierPdf } from '../utils/tenderPdfGenerator';
import {
  FileText,
  Upload,
  UserCheck,
  Award,
  BarChart3,
  Cpu,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  Eye,
  FileCheck,
  Paperclip,
  ExternalLink,
  Save,
} from 'lucide-react';

interface CompanyDossierViewProps {
  company: CompanyProfile;
  onUpdateCompany: (updated: CompanyProfile) => void;
  documents: UploadedDocument[];
  onAddDocument: (doc: UploadedDocument) => void;
  onDeleteDocument: (id: string) => void;
  personnel: KeyPersonnel[];
  onAddPersonnel: (person: KeyPersonnel) => void;
  onDeletePersonnel: (id: string) => void;
  experiences: PastExperience[];
  onAddExperience: (exp: PastExperience) => void;
  onDeleteExperience: (id: string) => void;
  auditReports: AuditReport[];
  onAddAuditReport: (rep: AuditReport) => void;
  onDeleteAuditReport: (id: string) => void;
  technicalOffers: TechnicalOfferItem[];
  onAddTechnicalOffer: (offer: TechnicalOfferItem) => void;
  onDeleteTechnicalOffer: (id: string) => void;
  trackedBids: TrackedBid[];
  onShowToast: (msg: string) => void;
}

export const CompanyDossierView: React.FC<CompanyDossierViewProps> = ({
  company,
  onUpdateCompany,
  documents,
  onAddDocument,
  onDeleteDocument,
  personnel,
  onAddPersonnel,
  onDeletePersonnel,
  experiences,
  onAddExperience,
  onDeleteExperience,
  auditReports,
  onAddAuditReport,
  onDeleteAuditReport,
  technicalOffers,
  onAddTechnicalOffer,
  onDeleteTechnicalOffer,
  trackedBids,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'license' | 'personnel' | 'experience' | 'audit' | 'technical' | 'pdf_dossier'
  >('license');

  const [selectedBidForPdf, setSelectedBidForPdf] = useState<string>(
    trackedBids[0]?.id || ''
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<CompanyProfile>(company);

  // Modals for adding items
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocCategory, setNewDocCategory] = useState<UploadedDocument['category']>('license');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocRef, setNewDocRef] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  // New Personnel Form
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [newPersonQual, setNewPersonQual] = useState('');
  const [newPersonExp, setNewPersonExp] = useState(8);
  const [newPersonLicense, setNewPersonLicense] = useState('');
  const [newPersonProjectRole, setNewPersonProjectRole] = useState('');

  // New Experience Form
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpClient, setNewExpClient] = useState('');
  const [newExpValue, setNewExpValue] = useState(10000000);
  const [newExpYear, setNewExpYear] = useState(2025);
  const [newExpSector, setNewExpSector] = useState('Medical & Healthcare');
  const [newExpScope, setNewExpScope] = useState('');

  // New Audit Form
  const [isAddAuditOpen, setIsAddAuditOpen] = useState(false);
  const [newAuditYear, setNewAuditYear] = useState('2016 E.C. (2024 G.C.)');
  const [newAuditFirm, setNewAuditFirm] = useState('HST & Co. Certified Public Accountants');
  const [newAuditTurnover, setNewAuditTurnover] = useState(65000000);
  const [newAuditNetWorth, setNewAuditNetWorth] = useState(32000000);

  // New Tech Offer Item Form
  const [isAddTechOpen, setIsAddTechOpen] = useState(false);
  const [newTechDesc, setNewTechDesc] = useState('');
  const [newTechBrand, setNewTechBrand] = useState('');
  const [newTechOrigin, setNewTechOrigin] = useState('Germany');
  const [newTechWarranty, setNewTechWarranty] = useState(24);
  const [newTechDelivery, setNewTechDelivery] = useState(6);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileObj(file);
      if (!newDocTitle) {
        setNewDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const file = selectedFileObj;
    const fileName = file ? file.name : `${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB';

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      category: newDocCategory,
      title: newDocTitle.trim(),
      fileName,
      fileSize,
      fileType: file ? file.type : 'application/pdf',
      uploadedAt: new Date().toISOString(),
      referenceNumber: newDocRef.trim() || undefined,
      expiryDate: newDocExpiry || undefined,
      status: 'valid',
    };

    onAddDocument(newDoc);
    setIsAddDocModalOpen(false);
    setSelectedFileObj(null);
    setNewDocTitle('');
    setNewDocRef('');
    setNewDocExpiry('');
    onShowToast(`Uploaded "${newDoc.title}" to company credentials!`);
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim() || !newPersonRole.trim()) return;

    const newPerson: KeyPersonnel = {
      id: `kp-${Date.now()}`,
      fullName: newPersonName.trim(),
      role: newPersonRole.trim(),
      qualification: newPersonQual.trim() || 'B.Sc. Engineering / Specialized Diploma',
      yearsOfExperience: Number(newPersonExp) || 5,
      licenseNumber: newPersonLicense.trim() || undefined,
      assignedProjectRole: newPersonProjectRole.trim() || 'Lead Technical Support & Commissioning',
      cvFileName: `CV_${newPersonName.replace(/\s+/g, '_')}.pdf`,
      cvUploadedAt: new Date().toISOString().split('T')[0],
    };

    onAddPersonnel(newPerson);
    setIsAddPersonnelOpen(false);
    setNewPersonName('');
    setNewPersonRole('');
    setNewPersonQual('');
    setNewPersonLicense('');
    setNewPersonProjectRole('');
    onShowToast(`Added Key Personnel: ${newPerson.fullName}`);
  };

  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpClient.trim()) return;

    const newExp: PastExperience = {
      id: `exp-${Date.now()}`,
      projectTitle: newExpTitle.trim(),
      clientOrganization: newExpClient.trim(),
      contractValueETB: Number(newExpValue) || 5000000,
      yearCompleted: Number(newExpYear) || 2025,
      sector: newExpSector,
      scopeSummary: newExpScope.trim() || 'Turnkey delivery, testing, and client training.',
      certificateFileName: `Acceptance_Cert_${newExpClient.replace(/\s+/g, '_').slice(0, 15)}.pdf`,
      certificateUploadedAt: new Date().toISOString().split('T')[0],
    };

    onAddExperience(newExp);
    setIsAddExpOpen(false);
    setNewExpTitle('');
    setNewExpClient('');
    setNewExpScope('');
    onShowToast(`Recorded Past Experience: ${newExp.projectTitle}`);
  };

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: AuditReport = {
      id: `aud-${Date.now()}`,
      fiscalYear: newAuditYear.trim(),
      auditingFirm: newAuditFirm.trim(),
      annualTurnoverETB: Number(newAuditTurnover),
      netWorthETB: Number(newAuditNetWorth),
      auditOpinion: 'Unqualified (Clean Opinion)',
      reportFileName: `Audit_Report_${newAuditYear.replace(/\s+/g, '_').slice(0, 10)}.pdf`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    onAddAuditReport(newRep);
    setIsAddAuditOpen(false);
    onShowToast(`Saved Audited Financial Statement for ${newRep.fiscalYear}`);
  };

  const handleSaveTechOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechDesc.trim()) return;

    const newItem: TechnicalOfferItem = {
      id: `toi-${Date.now()}`,
      itemNumber: technicalOffers.length + 1,
      description: newTechDesc.trim(),
      offeredBrandModel: newTechBrand.trim() || 'Standard European / ISO certified model',
      countryOfOrigin: newTechOrigin.trim() || 'Germany / USA',
      specCompliance: 'Full Compliance',
      warrantyMonths: Number(newTechWarranty) || 24,
      deliveryTimelineWeeks: Number(newTechDelivery) || 6,
    };

    onAddTechnicalOffer(newItem);
    setIsAddTechOpen(false);
    setNewTechDesc('');
    setNewTechBrand('');
    onShowToast(`Added Technical Specification item #${newItem.itemNumber}`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(profileForm);
    setIsEditingProfile(false);
    onShowToast('Company profile & legal credentials updated!');
  };

  // Full PDF generation trigger
  const handleGeneratePdf = () => {
    const targetBid = trackedBids.find((b) => b.id === selectedBidForPdf) || trackedBids[0];
    if (!targetBid) {
      onShowToast('Please track at least one tender in the pipeline first.');
      return;
    }

    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        const doc = generateTenderDossierPdf({
          bid: targetBid,
          company,
          documents,
          personnel,
          experiences,
          auditReports,
          technicalOffers,
        });

        const safeTitle = targetBid.title
          .slice(0, 30)
          .replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `TENDER_BID_DOSSIER_${targetBid.internalRefNo}_${safeTitle}.pdf`;
        doc.save(filename);
        onShowToast(`Downloaded full tender dossier PDF: ${filename}`);
      } catch (err: any) {
        console.error('PDF generation error:', err);
        onShowToast(`Failed to generate PDF: ${err.message}`);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 500);
  };

  const selectedBid = trackedBids.find((b) => b.id === selectedBidForPdf) || trackedBids[0];

  return (
    <div className="space-y-5">
      {/* Top Banner: Company Profile Header & PDF Quick Generation Action */}
      <div className="bg-neutral-900 text-white rounded-xl p-5 border border-neutral-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Bidder Company Master Dossier
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">FPPA Supplier #{company.fppaRegistrationNumber}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                {company.companyName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400 mt-1">
                <span>License: <strong className="text-white font-mono">{company.tradeLicenseNumber}</strong></span>
                <span>TIN: <strong className="text-white font-mono">{company.tinNumber}</strong></span>
                <span>VAT: <strong className="text-white font-mono">{company.vatNumber}</strong></span>
                <span>Signatory: <strong className="text-white">{company.authorizedSignatoryName}</strong></span>
              </div>
            </div>
          </div>

          {/* Prominent Action: Compile & Download Full PDF */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
            <div className="flex flex-col">
              <span className="text-[11px] text-neutral-400 mb-1">Select Target Tender:</span>
              <select
                value={selectedBidForPdf}
                onChange={(e) => setSelectedBidForPdf(e.target.value)}
                className="text-xs font-medium bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-xs truncate"
              >
                {trackedBids.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.internalRefNo} · {b.organization} ({b.title.slice(0, 35)}...)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || !selectedBid}
              className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              {isGeneratingPdf ? 'Compiling Dossier...' : 'Generate Full Tender PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Bar for the 5 Upload/Credential Sections */}
      <div className="bg-white border border-neutral-200 rounded-lg p-2 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('license')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'license'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Company Licenses & Legal
          <span className="ml-1 text-[10px] font-mono opacity-70">
            ({documents.filter((d) => d.category === 'license').length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personnel')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'personnel'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Key Personnel (CVs)
          <span className="ml-1 text-[10px] font-mono opacity-70">({personnel.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'experience'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Past Experiences
          <span className="ml-1 text-[10px] font-mono opacity-70">({experiences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Audit Reports
          <span className="ml-1 text-[10px] font-mono opacity-70">({auditReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'technical'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Technical Offer & Specs
          <span className="ml-1 text-[10px] font-mono opacity-70">({technicalOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pdf_dossier')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ml-auto ${
            activeTab === 'pdf_dossier'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Full PDF Preview & Export
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: COMPANY LICENSES & LEGAL DOCUMENTS */}
      {/* ============================================================== */}
      {activeTab === 'license' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-lg shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Company Legal Registrations & Trade Licenses
              </h3>
              <p className="text-xs text-neutral-500">
                Mandatory preliminary qualification documents for Ethiopian Federal & Regional tenders
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                {isEditingProfile ? 'Cancel Edit' : 'Edit Company Info'}
              </button>

              <button
                onClick={() => {
                  setNewDocCategory('license');
                  setIsAddDocModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Legal Document
              </button>
            </div>
          </div>

          {/* Profile Edit Drawer */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Edit Formal Company Information (Used in PDF Letters & Cover Pages)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Company Name (English)</label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Company Name (Amharic)</label>
                  <input
                    type="text"
                    value={profileForm.companyNameAmharic}
                    onChange={(e) => setProfileForm({ ...profileForm, companyNameAmharic: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-amharic"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Trade License Number</label>
                  <input
                    type="text"
                    value={profileForm.tradeLicenseNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, tradeLicenseNumber: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">TIN Number</label>
                  <input
                    type="text"
                    value={profileForm.tinNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, tinNumber: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">VAT Number</label>
                  <input
                    type="text"
                    value={profileForm.vatNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, vatNumber: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">FPPA Registry Number</label>
                  <input
                    type="text"
                    value={profileForm.fppaRegistrationNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, fppaRegistrationNumber: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={profileForm.authorizedSignatoryName}
                    onChange={(e) => setProfileForm({ ...profileForm, authorizedSignatoryName: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Signatory Title</label>
                  <input
                    type="text"
                    value={profileForm.authorizedSignatoryTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, authorizedSignatoryTitle: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Official Phone & Email</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* Uploaded Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents
              .filter((d) => d.category === 'license')
              .map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-neutral-100 text-neutral-800">
                          <FileText className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {doc.title}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {doc.referenceNumber || 'Official Seal Verified'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Active & Valid
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-700 truncate max-w-[180px]">
                        <Paperclip className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        {doc.fileName}
                      </span>
                      <span className="font-mono text-[11px]">{doc.fileSize}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400">
                      Uploaded {formatDate(doc.uploadedAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onShowToast(`Verified attachment: ${doc.fileName}`)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-100 px-2.5 py-1 rounded"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: KEY PERSONNEL & CVs */}
      {/* ============================================================== */}
      {activeTab === 'personnel' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-lg shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Key Personnel & Technical Staff CV Dossier
              </h3>
              <p className="text-xs text-neutral-500">
                Certified biomedical, electromechanical, and project management personnel dedicated to tender execution
              </p>
            </div>

            <button
              onClick={() => setIsAddPersonnelOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key Personnel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personnel.map((person) => (
              <div
                key={person.id}
                className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs hover:border-neutral-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700">
                        {person.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">
                          {person.fullName}
                        </h4>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          {person.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {person.yearsOfExperience} yrs exp
                    </span>
                  </div>

                  <div className="mt-3 text-xs space-y-1 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                    <div className="text-neutral-700">
                      <span className="font-semibold text-neutral-900">Qualification:</span> {person.qualification}
                    </div>
                    {person.licenseNumber && (
                      <div className="text-neutral-600 font-mono text-[11px]">
                        <span className="font-semibold text-neutral-900 font-sans">License:</span> {person.licenseNumber}
                      </div>
                    )}
                    <div className="text-neutral-600">
                      <span className="font-semibold text-neutral-900">Tender Role:</span> {person.assignedProjectRole}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500">
                    <Paperclip className="w-3.5 h-3.5" />
                    {person.cvFileName || 'CV_Attached.pdf'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeletePersonnel(person.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified CV ✓
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PAST EXPERIENCES */}
      {/* ============================================================== */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-lg shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Relevant Past Experiences & Reference Contracts
              </h3>
              <p className="text-xs text-neutral-500">
                Contracts of similar scope executed in Ethiopia within the past 3 to 5 years (FPPA Past Performance requirement)
              </p>
            </div>

            <button
              onClick={() => setIsAddExpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Past Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs hover:border-neutral-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {exp.sector} · {exp.yearCompleted}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 mt-0.5">
                        {exp.projectTitle}
                      </h4>
                      <p className="text-[11px] font-medium text-neutral-700 mt-0.5">
                        Client: {exp.clientOrganization}
                      </p>
                    </div>

                    <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 shrink-0">
                      {formatETB(exp.contractValueETB)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 mt-2 bg-neutral-50 p-2 rounded border border-neutral-100 leading-relaxed">
                    {exp.scopeSummary}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500 truncate max-w-[200px]">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    {exp.certificateFileName || 'Acceptance_Certificate.pdf'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteExperience(exp.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Client Certificate Attached
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: AUDIT REPORTS */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-lg shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Audited Financial Statements & Balance Sheets
              </h3>
              <p className="text-xs text-neutral-500">
                3 consecutive years authorized external audit reports confirming financial turnover and solvency
              </p>
            </div>

            <button
              onClick={() => setIsAddAuditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Audit Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {auditReports.map((aud) => (
              <div
                key={aud.id}
                className="bg-white border border-neutral-200 rounded-lg p-4 shadow-xs hover:border-neutral-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-neutral-900">
                      {aud.fiscalYear}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Clean Opinion
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 mt-1">
                    Audited by: <strong className="text-neutral-800">{aud.auditingFirm}</strong>
                  </div>

                  <div className="mt-4 space-y-2 bg-neutral-50 p-3 rounded border border-neutral-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Annual Turnover:</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatETB(aud.annualTurnoverETB)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Net Worth / Capital:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatETB(aud.netWorthETB)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-500 truncate max-w-[150px]">
                    <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
                    {aud.reportFileName || 'Audit_Report.pdf'}
                  </span>

                  <button
                    onClick={() => onDeleteAuditReport(aud.id)}
                    className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: TECHNICAL OFFER & SPECS */}
      {/* ============================================================== */}
      {activeTab === 'technical' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 border border-neutral-200 rounded-lg shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Technical Offer & Specification Compliance Matrix
              </h3>
              <p className="text-xs text-neutral-500">
                Itemized technical specifications, manufacturer authorizations (MAF), warranties, and delivery schedule
              </p>
            </div>

            <button
              onClick={() => setIsAddTechOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Specification Item
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                    <th className="py-3 px-3">Item #</th>
                    <th className="py-3 px-3">Required Technical Specification</th>
                    <th className="py-3 px-3">Offered Model & Manufacturer</th>
                    <th className="py-3 px-3">Origin</th>
                    <th className="py-3 px-3">Compliance</th>
                    <th className="py-3 px-3">Warranty</th>
                    <th className="py-3 px-3">Delivery</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {technicalOffers.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                        #{item.itemNumber}
                      </td>
                      <td className="py-3 px-3 max-w-xs font-medium text-neutral-800">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-900">
                        {item.offeredBrandModel}
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        {item.countryOfOrigin}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {item.specCompliance}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-800">
                        {item.warrantyMonths} Months
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-800">
                        {item.deliveryTimelineWeeks} Weeks
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onDeleteTechnicalOffer(item.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: FULL PDF DOSSIER PREVIEW & DOWNLOAD */}
      {/* ============================================================== */}
      {activeTab === 'pdf_dossier' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-semibold">
                Official Document Compilation Engine
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                Full Tender Bid Dossier & Submission Package
              </h3>
              <p className="text-xs text-neutral-500">
                Compiles the complete tender dossier combining your uploaded license, staff CVs, experience proofs, audit records, and technical offer into a formal multi-page PDF ready for submission.
              </p>
            </div>

            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || !selectedBid}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download Full PDF Document'}
            </button>
          </div>

          {/* Dossier Structure Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                1. Formal Cover & Transmittal
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Includes official transmittal letter addressed to {selectedBid?.organization || 'Procuring Entity'}, bid validity declaration (90 days), and authorized signatory seal.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2. Licenses & Legal Credentials
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Full table of renewed trade license ({company.tradeLicenseNumber}), tax clearance, TIN/VAT, and FPPA registration code.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                3. Technical Offer & Guarantee
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Detailed itemized specifications, OEM authorization backing, warranty terms ({technicalOffers[0]?.warrantyMonths || 24} mos), and delivery schedule.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                4. Key Personnel Qualification
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {personnel.length} lead engineers and specialists with university degrees, certifications, and assigned roles on this tender.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                5. Similar Past Experience
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {experiences.length} executed contracts totaling over ETB {experiences.reduce((s, e) => s + e.contractValueETB, 0).toLocaleString()} with verified client completion certificates.
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2">
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                6. 3-Year Audited Accounts & CPO
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Audited balance sheets by authorized public accountants, plus irrevocable CPO bid bond instrument ({selectedBid?.cpoBank || 'CBE'} - {formatETB(selectedBid?.bidBondAmountETB || 200000)}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Upload Document / License */}
      {/* ============================================================== */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Upload Legal / Compliance Credential
              </h3>
              <button
                onClick={() => setIsAddDocModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-neutral-700 block mb-1 font-medium">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Renewed Trade License 2018/2019 E.C."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 font-medium">Credential Category</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full border border-neutral-300 rounded p-2"
                >
                  <option value="license">Trade License / Tax Clearance / FPPA</option>
                  <option value="personnel">Key Personnel CV / Degree</option>
                  <option value="experience">Client Acceptance / Completion Certificate</option>
                  <option value="audit">Audited Financial Statement / Balance Sheet</option>
                  <option value="technical_offer">Manufacturer Authorization / Technical Catalog</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Reference / Certificate #</label>
                  <input
                    type="text"
                    placeholder="e.g. MTRI/AA/14/672"
                    value={newDocRef}
                    onChange={(e) => setNewDocRef(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 font-medium">Expiry / Renewal Date</label>
                  <input
                    type="date"
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 font-medium">Attach File (PDF, DOCX, or Image)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="w-full text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800 shadow-xs"
                >
                  Save & Verify Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Personnel */}
      {/* ============================================================== */}
      {isAddPersonnelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Key Technical Staff & CV</h3>
              <button onClick={() => setIsAddPersonnelOpen(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleSavePersonnel} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Dawit Tadesse Mengesha"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Permanent Role / Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Biomedical Engineer"
                  value={newPersonRole}
                  onChange={(e) => setNewPersonRole(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Highest Academic Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc. Biomedical Instrumentation (AAU)"
                  value={newPersonQual}
                  onChange={(e) => setNewPersonQual(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Years of Experience</label>
                  <input
                    type="number"
                    value={newPersonExp}
                    onChange={(e) => setNewPersonExp(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Practicing License #</label>
                  <input
                    type="text"
                    placeholder="e.g. EBPE-BME-0912"
                    value={newPersonLicense}
                    onChange={(e) => setNewPersonLicense(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Assigned Role on this Tender</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Installation, Calibration & Acceptance Testing"
                  value={newPersonProjectRole}
                  onChange={(e) => setNewPersonProjectRole(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddPersonnelOpen(false)}
                  className="px-3 py-1.5 text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800"
                >
                  Save Key Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Past Experience */}
      {/* ============================================================== */}
      {isAddExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Past Experience / Contract</h3>
              <button onClick={() => setIsAddExpOpen(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleSaveExperience} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Project Title / Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply and Delivery of Hospital Diagnostic Reagents"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Client / Procuring Entity *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ethiopian Pharmaceuticals Supply Agency (EPSA)"
                  value={newExpClient}
                  onChange={(e) => setNewExpClient(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Contract Value (ETB)</label>
                  <input
                    type="number"
                    value={newExpValue}
                    onChange={(e) => setNewExpValue(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Year Completed</label>
                  <input
                    type="number"
                    value={newExpYear}
                    onChange={(e) => setNewExpYear(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Sector / Category</label>
                <input
                  type="text"
                  value={newExpSector}
                  onChange={(e) => setNewExpSector(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Scope Summary & Client Acceptance</label>
                <textarea
                  rows={2}
                  value={newExpScope}
                  onChange={(e) => setNewExpScope(e.target.value)}
                  placeholder="Completed with 100% acceptance certificate and zero defect report..."
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpOpen(false)}
                  className="px-3 py-1.5 text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800"
                >
                  Record Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Audit Report */}
      {/* ============================================================== */}
      {isAddAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Audited Financial Statement</h3>
              <button onClick={() => setIsAddAuditOpen(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleSaveAudit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Ethiopian Fiscal Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2016 E.C. (2024 G.C.)"
                  value={newAuditYear}
                  onChange={(e) => setNewAuditYear(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 font-medium"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Authorized Auditing Firm</label>
                <input
                  type="text"
                  value={newAuditFirm}
                  onChange={(e) => setNewAuditFirm(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Annual Turnover (ETB)</label>
                  <input
                    type="number"
                    value={newAuditTurnover}
                    onChange={(e) => setNewAuditTurnover(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Net Worth / Assets (ETB)</label>
                  <input
                    type="number"
                    value={newAuditNetWorth}
                    onChange={(e) => setNewAuditNetWorth(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddAuditOpen(false)}
                  className="px-3 py-1.5 text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800"
                >
                  Save Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Technical Offer Item */}
      {/* ============================================================== */}
      {isAddTechOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Add Technical Offer Specification</h3>
              <button onClick={() => setIsAddTechOpen(false)} className="text-neutral-400">✕</button>
            </div>
            <form onSubmit={handleSaveTechOffer} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-neutral-700">Item Specification / Scope *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. High-performance Centrifuge with digital timer and dual rotor assembly..."
                  value={newTechDesc}
                  onChange={(e) => setNewTechDesc(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Offered Model & OEM</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermo Scientific Sorvall Legend"
                    value={newTechBrand}
                    onChange={(e) => setNewTechBrand(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Country of Origin</label>
                  <input
                    type="text"
                    value={newTechOrigin}
                    onChange={(e) => setNewTechOrigin(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Warranty (Months)</label>
                  <input
                    type="number"
                    value={newTechWarranty}
                    onChange={(e) => setNewTechWarranty(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-neutral-700">Delivery Schedule (Weeks)</label>
                  <input
                    type="number"
                    value={newTechDelivery}
                    onChange={(e) => setNewTechDelivery(Number(e.target.value))}
                    className="w-full border border-neutral-300 rounded p-2 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddTechOpen(false)}
                  className="px-3 py-1.5 text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
