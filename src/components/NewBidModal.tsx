import React, { useState } from 'react';
import { TrackedBid, ProcurementType, TenderStage } from '../types/tender';
import { STANDARD_COMPLIANCE_ITEMS } from '../data/mockTenders';
import { X, Plus, BookmarkPlus } from 'lucide-react';

interface NewBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBid: (newBid: TrackedBid) => void;
  defaultCategoryId: string;
}

export const NewBidModal: React.FC<NewBidModalProps> = ({
  isOpen,
  onClose,
  onAddBid,
  defaultCategoryId,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [titleAmharic, setTitleAmharic] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState('Medical & Healthcare Equipment');
  const [procurementType, setProcurementType] = useState<ProcurementType>('NCB');
  const [region, setRegion] = useState('Addis Ababa');
  const [estimatedContractValueETB, setEstimatedContractValueETB] = useState('5000000');
  const [bidBondAmountETB, setBidBondAmountETB] = useState('100000');
  const [closingDate, setClosingDate] = useState(
    new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [assignedTo, setAssignedTo] = useState('Jordan Zewdu');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organization.trim()) return;

    const estValue = Number(estimatedContractValueETB) || 1000000;
    const bond = Number(bidBondAmountETB) || 50000;
    const uniqueId = `custom-${Date.now()}`;
    const refNo = `TP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newBid: TrackedBid = {
      id: uniqueId,
      sourceId: uniqueId,
      internalRefNo: refNo,
      title: title.trim(),
      titleAmharic: titleAmharic.trim() || undefined,
      organization: organization.trim(),
      category,
      categoryId: category ? category.toLowerCase().replace(/[^a-z0-9]/g, '_') : defaultCategoryId,
      procurementType,
      region,
      sourceMedia: '2Merkato Tender Portal',
      publishedAt: new Date().toISOString(),
      closingDate: new Date(`${closingDate}T14:00:00Z`).toISOString(),
      openingDate: new Date(`${closingDate}T14:30:00Z`).toISOString(),
      bidBondAmountETB: bond,
      bidBondType: 'CPO',
      documentFeeETB: 300,
      estimatedContractValueETB: estValue,
      isOpen: true,
      sourceUrl: 'https://tender.2merkato.com/tenders',
      stage: 'lead',
      assignedTo,
      ourBidAmountETB: Math.round(estValue * 0.94),
      targetMarginPercent: 18.0,
      cpoStatus: 'Required',
      urgent: false,
      importedAt: new Date().toISOString(),
      submissionTargetDate: new Date(`${closingDate}T11:00:00Z`).toISOString(),
      submissionLocation: `${organization.trim()} Head Office, Procurement Directorate Tender Box`,
      submissionMethod: 'Physical Sealed Box',
      dispatchBufferHours: region === 'Addis Ababa' ? 2 : 12,
      submissionMilestones: {
        cpoReady: false,
        technicalReady: false,
        financialReady: false,
        sealedWax: false,
        deliveredToBox: false,
      },
      notes,
      complianceChecklist: [...STANDARD_COMPLIANCE_ITEMS],
    };

    onAddBid(newBid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white border-t sm:border border-neutral-200 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 -mb-1 shrink-0"></div>

        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-100 bg-neutral-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 text-white rounded-lg">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                Track New Procurement Opportunity
              </h3>
              <p className="text-[11px] text-neutral-500">
                Register a tender into the pipeline for CPO & compliance tracking
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">
              Tender Title (English) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Procurement of Laboratory Centrifuges & Test Kits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">
              Amharic Title (Optional)
            </label>
            <input
              type="text"
              placeholder="የላቦራቶሪ መሣሪያዎች ግዥ ጨረታ ማስታወቂያ"
              value={titleAmharic}
              onChange={(e) => setTitleAmharic(e.target.value)}
              className="w-full text-xs font-amharic bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Procuring Organization / Client *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ethiopian Pharmaceuticals Supply Agency"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Region / Location
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Federal / Multi-Region">Federal / Multi-Region</option>
                <option value="Amhara">Amhara</option>
                <option value="Oromia">Oromia</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Sidama">Sidama</option>
                <option value="Tigray">Tigray</option>
                <option value="Somali">Somali</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Procurement Method
              </label>
              <select
                value={procurementType}
                onChange={(e) => setProcurementType(e.target.value as ProcurementType)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="NCB">NCB (National)</option>
                <option value="ICB">ICB (International)</option>
                <option value="RFQ">RFQ (Request for Quotation)</option>
                <option value="EOI">EOI (Expression of Interest)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Est. Contract Budget (ETB)
              </label>
              <input
                type="number"
                value={estimatedContractValueETB}
                onChange={(e) => setEstimatedContractValueETB(e.target.value)}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Bid Bond (CPO) ETB
              </label>
              <input
                type="number"
                value={bidBondAmountETB}
                onChange={(e) => setBidBondAmountETB(e.target.value)}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Submission Closing Date *
              </label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Assigned Team Lead
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 block mb-1">
              Internal Strategy & Scope Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Requires ISO 13485 certification, 3 years past experience..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 min-h-[42px] sm:min-h-[38px] text-xs font-medium text-neutral-700 bg-white sm:bg-transparent border sm:border-0 border-neutral-200 rounded-lg hover:text-neutral-950 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-5 py-2 min-h-[42px] sm:min-h-[38px] text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 rounded-lg transition-colors shadow-xs text-center"
            >
              Add to Bid Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
