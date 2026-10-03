import React, { useState } from 'react';
import { TrackedBid } from '../types/tender';
import { formatETB } from '../utils/formatters';
import { Calculator, DollarSign, TrendingUp, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

interface PricingEngineViewProps {
  bids: TrackedBid[];
  onSavePrice: (bidId: string, ourBidAmountETB: number, targetMarginPercent: number) => void;
}

export const PricingEngineView: React.FC<PricingEngineViewProps> = ({
  bids,
  onSavePrice,
}) => {
  const [selectedBidId, setSelectedBidId] = useState<string>(bids[0]?.id || '');
  const currentBid = bids.find((b) => b.id === selectedBidId) || bids[0];

  const [baseCost, setBaseCost] = useState<number>(
    currentBid ? Math.round((currentBid.ourBidAmountETB || currentBid.estimatedContractValueETB) * 0.72) : 5000000
  );
  const [logisticsPercent, setLogisticsPercent] = useState<number>(5.0);
  const [withholdingTaxPercent, setWithholdingTaxPercent] = useState<number>(2.0);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(
    currentBid?.targetMarginPercent || 18.0
  );
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [savedNotification, setSavedNotification] = useState(false);

  // When selected bid changes, sync defaults
  const handleSelectBid = (id: string) => {
    setSelectedBidId(id);
    const b = bids.find((item) => item.id === id);
    if (b) {
      setBaseCost(Math.round((b.ourBidAmountETB || b.estimatedContractValueETB) * 0.72));
      setTargetMarginPercent(b.targetMarginPercent || 18.0);
    }
  };

  const logisticsCost = baseCost * (logisticsPercent / 100);
  const directTotalCost = baseCost + logisticsCost;
  const grossProfit = directTotalCost * (targetMarginPercent / 100);
  const priceBeforeTaxes = directTotalCost + grossProfit;
  const vatAmount = includeVat ? priceBeforeTaxes * 0.15 : 0;
  const finalBidOffer = priceBeforeTaxes + vatAmount;
  const withholdingDeduction = finalBidOffer * (withholdingTaxPercent / 100);
  const netCashReceived = finalBidOffer - withholdingDeduction;

  const handleApply = () => {
    if (!currentBid) return;
    onSavePrice(currentBid.id, Math.round(finalBidOffer), targetMarginPercent);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  if (!currentBid) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
        <Calculator className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-neutral-900">No bids tracked yet</h3>
        <p className="text-xs text-neutral-500 mt-1">Import a tender from the 2Merkato feed to simulate pricing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header selector */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold text-neutral-900">
            Financial Modeling & BOQ Pricing Engine
          </h2>
          <p className="text-xs text-neutral-500">
            Simulate landed import costs, customs, 2% Ethiopian withholding tax, and 15% VAT
          </p>
        </div>

        <select
          value={selectedBidId}
          onChange={(e) => handleSelectBid(e.target.value)}
          className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          {bids.map((b) => (
            <option key={b.id} value={b.id}>
              {b.internalRefNo} — {b.organization} ({formatETB(b.ourBidAmountETB)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
            <div>
              <span className="text-[11px] font-mono text-neutral-500">{currentBid.internalRefNo}</span>
              <h3 className="text-sm font-bold text-neutral-900 mt-0.5">{currentBid.title}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{currentBid.organization} · {currentBid.region}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block uppercase">Client Budget</span>
              <span className="font-mono font-bold text-neutral-900 tabular-nums">
                {formatETB(currentBid.estimatedContractValueETB)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Direct Cost (Equipment / Reagents / Works)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                  ETB
                </span>
                <input
                  type="number"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                  className="w-full pl-12 pr-3 py-2 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Logistics, Inland Transport & Clearance (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={logisticsPercent}
                  onChange={(e) => setLogisticsPercent(Number(e.target.value))}
                  className="w-full pr-8 pl-3 py-2 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
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
                  className="w-full pr-8 pl-3 py-2 text-xs font-mono font-medium border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Ethiopian Statutory 15% VAT
              </label>
              <div className="flex items-center h-10">
                <label className="inline-flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Inclusive of 15% VAT in formal offer</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            {savedNotification ? (
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Updated bid amount applied to {currentBid.internalRefNo}
              </span>
            ) : (
              <span className="text-xs text-neutral-400">
                Current in pipeline: {formatETB(currentBid.ourBidAmountETB)}
              </span>
            )}

            <button
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Apply Offer to Pipeline Bid
            </button>
          </div>
        </div>

        {/* Right Col: Bill of Quantities Summary Slip */}
        <div className="bg-neutral-900 text-white rounded-lg p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Financial Breakdown Slip
            </div>
            <div className="text-lg font-bold text-white mt-1">
              Final Quotation Offer
            </div>

            <div className="mt-5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Base Supply Cost:</span>
                <span className="text-white tabular-nums">{formatETB(baseCost)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Inland Logistics ({logisticsPercent}%):</span>
                <span className="text-white tabular-nums">{formatETB(logisticsCost)}</span>
              </div>
              <div className="flex justify-between text-neutral-300 pt-1.5 border-t border-neutral-800 font-medium">
                <span>Total Net Direct Cost:</span>
                <span className="text-white tabular-nums">{formatETB(directTotalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Target Profit Margin ({targetMarginPercent}%):</span>
                <span className="tabular-nums">+{formatETB(grossProfit)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal (Excl. VAT):</span>
                <span className="text-white tabular-nums">{formatETB(priceBeforeTaxes)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>15% Ethiopian VAT:</span>
                <span className="text-white tabular-nums">+{formatETB(vatAmount)}</span>
              </div>

              <div className="pt-3 border-t-2 border-neutral-700">
                <div className="text-[11px] text-neutral-400 uppercase">Grand Total Bid Offer</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  {formatETB(finalBidOffer)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400">
            <div>Client statutory 2% Withholding Tax: <span className="text-white font-mono">{formatETB(withholdingDeduction)}</span></div>
            <div className="mt-0.5">Net Cash Inflow: <span className="text-emerald-400 font-mono font-medium">{formatETB(netCashReceived)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
