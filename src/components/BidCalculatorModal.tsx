import React, { useState } from 'react';
import { TrackedBid } from '../types/tender';
import { formatETB } from '../utils/formatters';
import { Calculator, X, Save, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface BidCalculatorModalProps {
  bid: TrackedBid | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrice: (bidId: string, ourBidAmountETB: number, targetMarginPercent: number) => void;
}

export const BidCalculatorModal: React.FC<BidCalculatorModalProps> = ({
  bid,
  isOpen,
  onClose,
  onSavePrice,
}) => {
  if (!isOpen || !bid) return null;

  const [baseCost, setBaseCost] = useState<number>(Math.round((bid.ourBidAmountETB || bid.estimatedContractValueETB) * 0.72));
  const [logisticsPercent, setLogisticsPercent] = useState<number>(5.0);
  const [withholdingTaxPercent, setWithholdingTaxPercent] = useState<number>(2.0); // Standard Ethiopian 2% WHT
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(bid.targetMarginPercent || 18.0);
  const [includeVat, setIncludeVat] = useState<boolean>(true); // Ethiopian 15% VAT

  // Calculations
  const logisticsCost = baseCost * (logisticsPercent / 100);
  const directTotalCost = baseCost + logisticsCost;

  // Margin amount
  const grossProfit = directTotalCost * (targetMarginPercent / 100);
  const priceBeforeTaxes = directTotalCost + grossProfit;

  // 15% VAT
  const vatAmount = includeVat ? priceBeforeTaxes * 0.15 : 0;
  const finalBidOffer = priceBeforeTaxes + vatAmount;

  // Withholding tax deducted at client payment
  const withholdingDeduction = finalBidOffer * (withholdingTaxPercent / 100);
  const netCashReceived = finalBidOffer - withholdingDeduction;

  const handleSave = () => {
    onSavePrice(bid.id, Math.round(finalBidOffer), targetMarginPercent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white border-t sm:border border-neutral-200 rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-2 -mb-1 shrink-0"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 text-white rounded-md">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                Bid Financial Simulator & Margin Calculator
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                {bid.internalRefNo} · {bid.organization}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <div className="text-xs font-semibold text-neutral-800">Target Opportunity:</div>
            <div className="text-xs text-neutral-600 line-clamp-1 mt-0.5">{bid.title}</div>
            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
              Client Budget / Estimated Value: <span className="text-neutral-900 font-medium">{formatETB(bid.estimatedContractValueETB)}</span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Direct Cost (BOQ / Supplier Factory Price)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                  ETB
                </span>
                <input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-1.5 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Local Logistics & Customs (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={logisticsPercent}
                  onChange={(e) => setLogisticsPercent(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-1.5 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Target Gross Margin Markup (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-1.5 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Ethiopian VAT (15%)
              </label>
              <div className="flex items-center h-8">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Add 15% VAT to Submitted Offer</span>
                </label>
              </div>
            </div>
          </div>

          {/* Breakdown Sheet */}
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Base Materials & Supply:</span>
              <span className="tabular-nums">{formatETB(baseCost)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Freight, Handling & Transport ({logisticsPercent}%):</span>
              <span className="tabular-nums">{formatETB(logisticsCost)}</span>
            </div>
            <div className="flex justify-between font-medium text-neutral-900 pt-1 border-t border-neutral-200">
              <span>Total Landed Cost:</span>
              <span className="tabular-nums">{formatETB(directTotalCost)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Projected Gross Margin ({targetMarginPercent}%):</span>
              <span className="tabular-nums">+{formatETB(grossProfit)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal (Before VAT):</span>
              <span className="tabular-nums">{formatETB(priceBeforeTaxes)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>15% Ethiopian VAT:</span>
              <span className="tabular-nums">+{formatETB(vatAmount)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t-2 border-neutral-300">
              <span>Final Recommended Bid Price:</span>
              <span className="tabular-nums text-base">{formatETB(finalBidOffer)}</span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500">
            * Note: Ethiopian Ministry of Revenues withholds 2% (approx {formatETB(withholdingDeduction)}) at final invoice settlement. Net cash expected: {formatETB(netCashReceived)}.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-3.5 sm:p-4 border-t border-neutral-100 bg-neutral-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2 min-h-[42px] sm:min-h-[38px] text-xs font-medium text-neutral-700 bg-white sm:bg-transparent border sm:border-0 border-neutral-200 rounded-lg hover:text-neutral-950 transition-colors text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 min-h-[42px] sm:min-h-[38px] text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 active:bg-neutral-950 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply to Bid</span>
          </button>
        </div>
      </div>
    </div>
  );
};
