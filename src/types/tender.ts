export type TenderStage = 
  | 'lead' 
  | 'qualified' 
  | 'doc_bought' 
  | 'bid_prep' 
  | 'approved' 
  | 'submitted' 
  | 'evaluation' 
  | 'awarded' 
  | 'lost';

export type ProcurementType = 'NCB' | 'ICB' | 'RFQ' | 'EOI';

export type CpoStatus = 'Required' | 'Drafted' | 'Issued' | 'Submitted' | 'Released';

export interface ComplianceItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  required: boolean;
  fileAttached?: string;
}

export interface MerkatoTender {
  id: string;
  sourceId: string;
  title: string;
  titleAmharic?: string;
  organization: string;
  organizationAmharic?: string;
  logo?: string | null;
  category: string;
  categoryId: string;
  procurementType: ProcurementType;
  region: string;
  sourceMedia: string;
  publishedAt: string;
  closingDate: string;
  openingDate: string;
  bidBondAmountETB: number;
  bidBondType: 'CPO' | 'Bank Guarantee' | 'Exempt';
  documentFeeETB: number;
  estimatedContractValueETB: number;
  isOpen: boolean;
  sourceUrl: string;
}

export interface TrackedBid extends MerkatoTender {
  internalRefNo: string;
  stage: TenderStage;
  assignedTo: string;
  assigneeAvatar?: string;
  ourBidAmountETB: number;
  targetMarginPercent: number;
  cpoBank?: string;
  cpoNumber?: string;
  cpoStatus: CpoStatus;
  cpoIssueDate?: string;
  cpoExpiryDate?: string;
  cpoReturnedDate?: string;
  complianceChecklist: ComplianceItem[];
  notes: string;
  urgent: boolean;
  importedAt: string;
  
  // Submission & Deadline Tracking Fields
  submissionTargetDate: string; // Planned submission time (usually 2-4 hrs before closing)
  actualSubmissionDate?: string; // Logged when physically dropped in box
  submissionProofReceipt?: string; // Receipt / acknowledgment voucher #
  submissionLocation: string; // Specific room/hall, e.g. "Procurement Directorate Room 402"
  submissionMethod: 'Physical Sealed Box' | 'Electronic FPPA e-GP Portal' | 'Courier';
  dispatchBufferHours: number; // Planned transit hours to venue
  submissionMilestones: {
    cpoReady: boolean;
    technicalReady: boolean;
    financialReady: boolean;
    sealedWax: boolean;
    deliveredToBox: boolean;
  };
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  tenderCount: number;
  sourceUrl: string;
}

// Company Credentials & Uploaded Documents
export type DocumentCategory = 
  | 'license' 
  | 'personnel' 
  | 'experience' 
  | 'audit' 
  | 'technical_offer' 
  | 'other';

export interface UploadedDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  dataUrl?: string; // base64 or object url for real preview
  referenceNumber?: string;
  expiryDate?: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface KeyPersonnel {
  id: string;
  fullName: string;
  role: string;
  qualification: string;
  yearsOfExperience: number;
  licenseNumber?: string;
  assignedProjectRole: string;
  cvFileName?: string;
  cvUploadedAt?: string;
}

export interface PastExperience {
  id: string;
  projectTitle: string;
  clientOrganization: string;
  contractValueETB: number;
  yearCompleted: number;
  sector: string;
  scopeSummary: string;
  certificateFileName?: string;
  certificateUploadedAt?: string;
}

export interface AuditReport {
  id: string;
  fiscalYear: string; // e.g. "2016 E.C. (2023/2024 G.C.)"
  auditingFirm: string;
  annualTurnoverETB: number;
  netWorthETB: number;
  auditOpinion: 'Unqualified (Clean Opinion)' | 'Qualified' | 'Adverse';
  reportFileName?: string;
  uploadedAt?: string;
}

export interface TechnicalOfferItem {
  id: string;
  itemNumber: number;
  description: string;
  offeredBrandModel: string;
  countryOfOrigin: string;
  specCompliance: 'Full Compliance' | 'Exceeds Specification';
  warrantyMonths: number;
  deliveryTimelineWeeks: number;
}

export interface CompanyProfile {
  companyName: string;
  companyNameAmharic: string;
  tradeLicenseNumber: string;
  tradeLicenseValidUntil: string;
  tinNumber: string;
  vatNumber: string;
  fppaRegistrationNumber: string;
  businessAddress: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  establishedYear: number;
}
