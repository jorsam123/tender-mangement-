import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  TrackedBid,
  CompanyProfile,
  UploadedDocument,
  KeyPersonnel,
  PastExperience,
  AuditReport,
  TechnicalOfferItem,
} from '../types/tender';
import { formatETB, formatDate, formatDateTime } from './formatters';

export interface GeneratePdfOptions {
  bid: TrackedBid;
  company: CompanyProfile;
  documents: UploadedDocument[];
  personnel: KeyPersonnel[];
  experiences: PastExperience[];
  auditReports: AuditReport[];
  technicalOffers: TechnicalOfferItem[];
}

export function generateTenderDossierPdf(options: GeneratePdfOptions): jsPDF {
  const { bid, company, documents, personnel, experiences, auditReports, technicalOffers } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for formal running headers and footers
  const addHeaderAndFooter = (pageNumber: number, totalPagesPlaceholder: string) => {
    if (pageNumber === 1) return; // Skip cover page

    // Running Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `TENDER BID DOSSIER: ${bid.internalRefNo} | ${bid.organization.toUpperCase()}`,
      15,
      12
    );
    doc.text(company.companyName, pageWidth - 15, 12, { align: 'right' });

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 14, pageWidth - 15, 14);

    // Running Footer
    doc.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14);
    doc.text(
      'CONFIDENTIAL & PROPRIETARY — SUBMITTED FOR TENDER EVALUATION',
      15,
      pageHeight - 9
    );
    doc.text(`Page ${pageNumber} of ${totalPagesPlaceholder}`, pageWidth - 15, pageHeight - 9, {
      align: 'right',
    });
  };

  // ==========================================
  // PAGE 1: FORMAL COVER PAGE
  // ==========================================
  // Top decorative bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 28, pageWidth, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA', pageWidth / 2, 13, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PUBLIC PROCUREMENT TENDER SUBMISSION DOSSIER', pageWidth / 2, 20, { align: 'center' });

  // Main Title Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text('PROCUREMENT IDENTIFIER & INTERNAL REF:', 20, 45);

  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(bid.internalRefNo, 20, 52);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Procurement Method: ${bid.procurementType} (National Competitive Bidding)`, 20, 58);

  // Big Box for Tender Title
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, 64, pageWidth - 40, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('PROJECT / CONTRACT TITLE:', 25, 71);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const splitTitle = doc.splitTextToSize(bid.title, pageWidth - 50);
  doc.text(splitTitle, 25, 78);

  // Entities 2-Column Box
  const colY = 108;
  const colWidth = (pageWidth - 48) / 2;

  // Procuring Entity Box (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, colY, colWidth, 75, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, colY, colWidth, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('SUBMITTED TO (PROCURING ENTITY):', 25, colY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(bid.organization, 25, colY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Location / Region: ${bid.region}, Ethiopia`, 25, colY + 25);
  doc.text('Submission Venue:', 25, colY + 32);
  const splitVenue = doc.splitTextToSize(bid.submissionLocation, colWidth - 10);
  doc.text(splitVenue, 25, colY + 37);

  doc.text(`Official Closing Deadline:`, 25, colY + 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // red
  doc.text(`${formatDate(bid.closingDate)} at 10:00 AM (East Africa Time)`, 25, colY + 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Public Opening Session:`, 25, colY + 66);
  doc.text(`${formatDateTime(bid.openingDate)}`, 25, colY + 71);

  // Bidder Entity Box (Right)
  const rightColX = 20 + colWidth + 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightColX, colY, colWidth, 75, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightColX, colY, colWidth, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('SUBMITTED BY (BIDDER / CONTRACTOR):', rightColX + 5, colY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(company.companyName, rightColX + 5, colY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Trade License #: ${company.tradeLicenseNumber}`, rightColX + 5, colY + 25);
  doc.text(`TIN: ${company.tinNumber} | VAT: ${company.vatNumber}`, rightColX + 5, colY + 31);
  doc.text(`FPPA Registry #: ${company.fppaRegistrationNumber}`, rightColX + 5, colY + 37);
  doc.text(`Address: ${company.businessAddress}`, rightColX + 5, colY + 43);
  doc.text(`Phone: ${company.phone}`, rightColX + 5, colY + 49);
  doc.text(`Email: ${company.email}`, rightColX + 5, colY + 55);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Auth. Signatory: ${company.authorizedSignatoryName}`, rightColX + 5, colY + 65);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(company.authorizedSignatoryTitle, rightColX + 5, colY + 70);

  // Financial & Bid Bond Summary Badge Strip
  const badgeY = 192;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, badgeY, pageWidth - 40, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('OUR SUBMITTED BID OFFER', 30, badgeY + 8);
  doc.text('BID SECURITY (CPO / GUARANTEE)', 95, badgeY + 8);
  doc.text('TARGET SUBMISSION DATE', 150, badgeY + 8);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(formatETB(bid.ourBidAmountETB), 30, badgeY + 16);

  doc.setTextColor(180, 83, 9); // amber
  doc.text(formatETB(bid.bidBondAmountETB), 95, badgeY + 16);

  doc.setTextColor(5, 150, 105); // emerald
  doc.text(formatDate(bid.submissionTargetDate), 150, badgeY + 16);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Inclusive of 15% VAT & Delivery', 30, badgeY + 21);
  doc.text(`${bid.cpoBank || 'Commercial Bank of Ethiopia'} (CPO)`, 95, badgeY + 21);
  doc.text('On-Time Physical Box Delivery', 150, badgeY + 21);

  // Official Seal Notice Box at bottom
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This dossier constitutes the official Technical and Preliminary Qualification Submission in full compliance',
    pageWidth / 2,
    260,
    { align: 'center' }
  );
  doc.text(
    'with the Ethiopian Federal Public Procurement and Property Administration Agency (FPPA) Standard Bidding Directives.',
    pageWidth / 2,
    264,
    { align: 'center' }
  );

  // ==========================================
  // PAGE 2: OFFICIAL BID TRANSMITTAL LETTER
  // ==========================================
  doc.addPage();

  let curY = 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL TENDER SUBMISSION & TRANSMITTAL LETTER', 15, curY);

  curY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Submission: ${formatDate(bid.submissionTargetDate || new Date().toISOString())}`, 15, curY);
  doc.text(`Procurement Reference: ${bid.internalRefNo}`, pageWidth - 15, curY, { align: 'right' });

  curY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, curY, pageWidth - 15, curY);

  curY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TO: The Chairperson, Tender Evaluation Committee', 15, curY);
  curY += 5;
  doc.text(bid.organization, 15, curY);
  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Procurement Directorate, ${bid.region}, Federal Democratic Republic of Ethiopia`, 15, curY);

  curY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`SUBJECT: Bid Submission for "${bid.title}"`, 15, curY);

  curY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const letterParagraph1 =
    `Dear Chairperson and Honorable Members of the Tender Board,\n\n` +
    `Having examined the Invitation to Bid and Bidding Documents for the above-referenced procurement, we, the undersigned, offer to supply, deliver, install, and commission the requested equipment and services in full conformity with the technical specifications and contract conditions.\n\n` +
    `We hereby confirm that our total bid price is ${formatETB(bid.ourBidAmountETB)} (including all applicable statutory Ethiopian taxes and 15% VAT). In compliance with the bid security conditions, we enclose herewith an unconditional and irrevocable Certified Payment Order (CPO) / Bank Guarantee in the amount of ${formatETB(bid.bidBondAmountETB)} issued by ${bid.cpoBank || 'Commercial Bank of Ethiopia'} (CPO Ref: ${bid.cpoNumber || 'CBE-CPO-9844211'}), valid for a duration of ninety (90) calendar days beyond the bid closing date.`;

  const splitP1 = doc.splitTextToSize(letterParagraph1, pageWidth - 30);
  doc.text(splitP1, 15, curY);

  curY += splitP1.length * 4.6 + 5;

  const letterParagraph2 =
    `We formally certify and declare that:\n` +
    `1. Our company is duly registered under Ethiopian commercial law with renewed Principal Trade License No. ${company.tradeLicenseNumber}, valid for fiscal year 2018/2019 E.C.\n` +
    `2. We have fulfilled all federal and regional tax obligations, as evidenced by the attached Tax Clearance Certificate and VAT/TIN certificate.\n` +
    `3. Our firm is officially registered on the Federal Public Procurement and Property Administration Agency (FPPA) public supplier portal under ID #${company.fppaRegistrationNumber}.\n` +
    `4. We agree to abide by this bid for the full bid validity period of ninety (90) days from the opening date, and it shall remain binding upon us.\n` +
    `5. We have inspected and accepted all terms without reservation and possess the technical capacity, certified personnel, financial solvency, and OEM warranty backing required to execute the contract flawlessly.`;

  const splitP2 = doc.splitTextToSize(letterParagraph2, pageWidth - 30);
  doc.text(splitP2, 15, curY);

  curY += splitP2.length * 4.6 + 12;

  // Signature Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Duly Authorized to Sign the Bid for and on Behalf of:', 15, curY);

  curY += 8;
  doc.text(company.companyName, 15, curY);
  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Authorized Signatory: ${company.authorizedSignatoryName}`, 15, curY);
  curY += 5;
  doc.text(`Designation: ${company.authorizedSignatoryTitle}`, 15, curY);
  curY += 5;
  doc.text(`Date: ${formatDate(new Date().toISOString())} | Addis Ababa, Ethiopia`, 15, curY);

  // Stamp Placeholder Box
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 75, curY - 20, 60, 30, 2, 2, 'D');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('[ COMPANY OFFICIAL SEAL ]', pageWidth - 45, curY - 5, { align: 'center' });
  doc.text('& AUTHORIZED SIGNATURE', pageWidth - 45, curY, { align: 'center' });

  // ==========================================
  // PAGE 3: COMPANY LEGAL REGISTRATION & LICENSES
  // ==========================================
  doc.addPage();
  curY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 1: COMPANY LEGAL REGISTRATIONS & MANDATORY LICENSES', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Mandatory statutory qualification documents pursuant to FPPA Bidding Directive (Section IV)', 15, curY);

  curY += 6;

  const licenseData = [
    ['Principal Commercial Trade License', company.tradeLicenseNumber, company.tradeLicenseValidUntil, 'Verified & Renewed'],
    ['Federal Tax Clearance Certificate', 'MoR/ERCA/TC/2026-9812', 'Valid for current Q3 procurement', 'Certified Valid'],
    ['Taxpayer Identification (TIN)', company.tinNumber, 'Permanent Federal Registration', 'Active & Verified'],
    ['15% Value Added Tax (VAT) Cert.', company.vatNumber, 'Federal VAT Registry', 'Active & Verified'],
    ['FPPA Public Suppliers Registry', company.fppaRegistrationNumber, 'Annual Validity 2026/2027', 'Approved Supplier'],
    ['Competency / Professional License', 'EBPE-MED-2018-0912', 'Ministry of Health / EFDA', 'Certified Operator'],
  ];

  (doc as any).autoTable({
    startY: curY,
    head: [['Document / Credential Type', 'Reference / Registration #', 'Validity / Period', 'Audit Status']],
    body: licenseData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 3, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  curY = (doc as any).lastAutoTable.finalY + 12;

  // Attached Document Inventory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED DIGITAL ATTACHMENTS ENCLOSED IN THIS BID DOSSIER:', 15, curY);

  curY += 4;

  const docTableRows = documents.map((d) => [
    d.title,
    d.category.toUpperCase().replace('_', ' '),
    d.fileName,
    d.fileSize,
    d.referenceNumber || 'N/A',
    d.status.toUpperCase(),
  ]);

  (doc as any).autoTable({
    startY: curY,
    head: [['Document Name', 'Category', 'Original File Attached', 'Size', 'Ref Code', 'Compliance']],
    body: docTableRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    margin: { left: 15, right: 15 },
  });

  // ==========================================
  // PAGE 4: TECHNICAL OFFER & SPECIFICATIONS COMPLIANCE
  // ==========================================
  doc.addPage();
  curY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 2: TECHNICAL OFFER & SPECIFICATIONS COMPLIANCE MATRIX', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Itemized schedule of requirements, brand specifications, delivery timeline, and warranty terms', 15, curY);

  curY += 6;

  const techRows = technicalOffers.map((t) => [
    `#${t.itemNumber}`,
    t.description,
    t.offeredBrandModel,
    t.countryOfOrigin,
    t.specCompliance,
    `${t.warrantyMonths} Months`,
    `${t.deliveryTimelineWeeks} Weeks`,
  ]);

  (doc as any).autoTable({
    startY: curY,
    head: [['Item', 'Required Specification & Scope', 'Offered Brand & Model', 'Origin', 'Compliance', 'Warranty', 'Delivery']],
    body: techRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 60 },
      2: { cellWidth: 42 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 16 },
      6: { cellWidth: 16 },
    },
    margin: { left: 15, right: 15 },
  });

  curY = (doc as any).lastAutoTable.finalY + 10;

  // Technical Statement of Undertaking
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, curY, pageWidth - 30, 40, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TECHNICAL GUARANTEE & SERVICE UNDERTAKING:', 20, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const techGuarantee =
    `1. Brand New Equipment: All delivered items are guaranteed brand new, unused, and current year manufacturing with factory test reports.\n` +
    `2. Genuine Spares & OEM Authorization: Backed by manufacturer authorization (MAF letter enclosed) guaranteeing genuine spare parts supply for minimum 7 years.\n` +
    `3. Onsite Installation & Calibration: Comprehensive turnkey commissioning by our factory-trained biomedical and electromechanical engineers.\n` +
    `4. User Training: 10 working days comprehensive operational and preventive maintenance training for client biomedical engineers and operators.\n` +
    `5. Warranty Coverage: Full comprehensive on-site warranty covering all parts and labor, with a 24-hour response time SLA within Ethiopia.`;

  const splitTG = doc.splitTextToSize(techGuarantee, pageWidth - 40);
  doc.text(splitTG, 20, curY + 12);

  // ==========================================
  // PAGE 5: KEY PERSONNEL & TECHNICAL TEAM QUALIFICATIONS
  // ==========================================
  doc.addPage();
  curY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 3: KEY PERSONNEL & PROJECT TEAM QUALIFICATIONS', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Curriculum Vitae and professional engineering registration of assigned project personnel', 15, curY);

  curY += 6;

  const personnelRows = personnel.map((p) => [
    p.fullName,
    p.role,
    p.qualification,
    `${p.yearsOfExperience} Years`,
    p.licenseNumber || 'Registered Engineer',
    p.assignedProjectRole,
  ]);

  (doc as any).autoTable({
    startY: curY,
    head: [['Full Name', 'Permanent Title', 'Highest Academic Degree', 'Experience', 'License #', 'Role on Contract']],
    body: personnelRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 32 },
      2: { cellWidth: 42 },
      3: { cellWidth: 18 },
      4: { cellWidth: 26 },
      5: { cellWidth: 38 },
    },
    margin: { left: 15, right: 15 },
  });

  curY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PROJECT EXECUTION STRUCTURE & AVAILABILITY CONFIRMATION:', 15, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const staffDeclaration =
    `We certify that the key personnel listed above are permanent full-time employees or contracted lead specialists dedicated to this contract upon award. Individual curriculum vitae, verified degree copies, and professional practicing licenses are attached in Appendix B of this submission.`;
  const splitStaff = doc.splitTextToSize(staffDeclaration, pageWidth - 30);
  doc.text(splitStaff, 15, curY);

  // ==========================================
  // PAGE 6: RELEVANT PAST EXPERIENCES & AUDIT REPORT
  // ==========================================
  doc.addPage();
  curY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 4: SIMILAR PAST EXPERIENCES & TRACK RECORD', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Evidence of contracts successfully executed in Ethiopia within the past 3 to 5 years (FPPA Criteria)', 15, curY);

  curY += 6;

  const expRows = experiences.map((e) => [
    e.projectTitle,
    e.clientOrganization,
    formatETB(e.contractValueETB),
    e.yearCompleted.toString(),
    e.sector,
    'Client Cert. Attached',
  ]);

  (doc as any).autoTable({
    startY: curY,
    head: [['Project & Scope Description', 'Client / Procuring Entity', 'Value (ETB)', 'Year', 'Sector', 'Proof']],
    body: expRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 46 },
      2: { cellWidth: 28 },
      3: { cellWidth: 14 },
      4: { cellWidth: 28 },
      5: { cellWidth: 20 },
    },
    margin: { left: 15, right: 15 },
  });

  curY = (doc as any).lastAutoTable.finalY + 12;

  // Audited Financial Statements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 5: FINANCIAL AUDIT REPORTS & SOLVENCY CAPACITY', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Three (3) Consecutive Years Audited Financial Statements by Authorized Public Accounting Firms', 15, curY);

  curY += 6;

  const auditRows = auditReports.map((a) => [
    a.fiscalYear,
    a.auditingFirm,
    formatETB(a.annualTurnoverETB),
    formatETB(a.netWorthETB),
    a.auditOpinion,
    'Full Report Enclosed',
  ]);

  (doc as any).autoTable({
    startY: curY,
    head: [['Fiscal Year', 'Authorized Auditing Firm', 'Annual Turnover (ETB)', 'Net Worth (ETB)', 'Auditor Opinion', 'Attachment']],
    body: auditRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 52 },
      2: { cellWidth: 30 },
      3: { cellWidth: 26 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 },
    },
    margin: { left: 15, right: 15 },
  });

  curY = (doc as any).lastAutoTable.finalY + 10;

  // Financial Ratio Confirmation
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, curY, pageWidth - 30, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('FINANCIAL SOUNDNESS DECLARATION:', 20, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const finSummaryText =
    `Average Annual Audited Turnover: ETB ${(
      auditReports.reduce((s, a) => s + a.annualTurnoverETB, 0) / (auditReports.length || 1)
    ).toLocaleString()} | Current Liquid Assets & Credit Facilities exceed the working capital threshold of ETB 20,000,000 required for seamless project mobilization without advance payment dependency.`;
  const splitFin = doc.splitTextToSize(finSummaryText, pageWidth - 40);
  doc.text(splitFin, 20, curY + 12);

  // ==========================================
  // PAGE 7: CPO BID SECURITY DECLARATION & ENVELOPE PROTOCOL
  // ==========================================
  doc.addPage();
  curY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION 6: BID SECURITY (CPO) & PACKAGING PROTOCOL', 15, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Original Bank Guarantee Instrument & Double-Envelope Sealed Packaging Declaration', 15, curY);

  curY += 8;

  // CPO Callout Box
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(15, curY, pageWidth - 30, 48, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(146, 64, 14);
  doc.text('OFFICIAL BID BOND / CPO SECURITY DECLARATION', 20, curY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(69, 26, 3);
  doc.text(`Instrument Type: Certified Payment Order (CPO) / Irrevocable Bank Guarantee`, 20, curY + 16);
  doc.text(`Issuing Commercial Bank: ${bid.cpoBank || 'Commercial Bank of Ethiopia (CBE)'}`, 20, curY + 22);
  doc.text(`Official CPO Number: ${bid.cpoNumber || 'CBE-CPO-9844211'}`, 20, curY + 28);
  doc.text(`Secured Guarantee Amount: ${formatETB(bid.bidBondAmountETB)} (Ethiopian Birr)`, 20, curY + 34);
  doc.text(`Validity Period: 90 Calendar Days beyond closing date (Valid until: ${formatDate(bid.cpoExpiryDate || '2026-12-26')})`, 20, curY + 40);

  curY += 56;

  // Envelope Packaging Declaration
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, curY, pageWidth - 30, 48, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ETHIOPIAN PUBLIC PROCUREMENT SEALED ENVELOPE COMPLIANCE:', 20, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const packagingText =
    `This bid submission strictly adheres to the Two-Envelope Bidding Procedure (FPPA Directive Section 22):\n\n` +
    `• ENVELOPE 1 (TECHNICAL PROPOSAL): Contains one (1) Original and two (2) Copies of the Technical Offer, Renewed Trade License, Tax Clearance, FPPA Certificate, Key Personnel CVs, Manufacturer Authorization Form (MAF), and the Original CPO Bid Security in a separate marked envelope.\n\n` +
    `• ENVELOPE 2 (FINANCIAL PROPOSAL): Contains one (1) Original and two (2) Copies of the Priced Bill of Quantities (BOQ), Unit Rate Analysis, and Total Tender Offer.\n\n` +
    `• MASTER OUTER ENVELOPE: Both inner envelopes are enclosed in a single wax-sealed and stamped outer envelope addressed to: ${bid.organization}, marked with "DO NOT OPEN BEFORE ${formatDateTime(bid.openingDate)}".`;

  const splitPack = doc.splitTextToSize(packagingText, pageWidth - 40);
  doc.text(splitPack, 20, curY + 14);

  curY += 58;

  // Final Sign-off block
  doc.setDrawColor(226, 232, 240);
  doc.line(15, curY, pageWidth - 15, curY);

  curY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signature & Corporate Seal:', 15, curY);
  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`${company.authorizedSignatoryName}, ${company.authorizedSignatoryTitle}`, 15, curY);
  curY += 5;
  doc.text(`${company.companyName} | ${company.phone}`, 15, curY);

  // Calculate total pages and add running headers/footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderAndFooter(i, totalPages.toString());
  }

  return doc;
}
