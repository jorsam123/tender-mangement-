import { TenderStage, CpoStatus } from '../types/tender';

export function formatETB(amount: number): string {
  if (isNaN(amount)) return 'ETB 0';
  return `ETB ${amount.toLocaleString('en-US')}`;
}

export function formatShortETB(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ETB`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k ETB`;
  }
  return `${amount} ETB`;
}

export function calculateDaysRemaining(closingDateStr: string): {
  days: number;
  hours: number;
  isOverdue: boolean;
  text: string;
  urgent: boolean;
} {
  const now = new Date();
  const closing = new Date(closingDateStr);
  const diffMs = closing.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      isOverdue: true,
      text: 'Closed / Submission Ended',
      urgent: false,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h remaining`;
  } else {
    text = `${hours}h remaining today`;
  }

  return {
    days,
    hours,
    isOverdue: false,
    text,
    urgent: days <= 5,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export const STAGE_META: Record<
  TenderStage,
  { label: string; description: string; stepNumber: number }
> = {
  lead: { label: 'Discovered Lead', description: 'Freshly identified opportunity from 2Merkato', stepNumber: 1 },
  qualified: { label: 'Qualified (Go/No-Go)', description: 'Technical feasibility and margin verified', stepNumber: 2 },
  doc_bought: { label: 'Document Purchased', description: 'Tender dossier & RFP purchased from client', stepNumber: 3 },
  bid_prep: { label: 'Bid Preparation', description: 'BOQ pricing, technical & compliance dossier in progress', stepNumber: 4 },
  approved: { label: 'Internal Approval', description: 'Management sign-off & sealed envelopes ready', stepNumber: 5 },
  submitted: { label: 'Submitted & Receipt', description: 'Dropped into client tender box before closing', stepNumber: 6 },
  evaluation: { label: 'Public Opening / Eval', description: 'Tender opened, price read & under committee review', stepNumber: 7 },
  awarded: { label: 'Contract Awarded', description: 'Official award letter received', stepNumber: 8 },
  lost: { label: 'Closed / Not Won', description: 'Tender not awarded or canceled', stepNumber: 9 },
};

export const CPO_STATUS_META: Record<
  CpoStatus,
  { label: string; textClass: string; bgClass: string }
> = {
  Required: { label: 'CPO Required', textClass: 'text-amber-800', bgClass: 'bg-amber-50 border-amber-200' },
  Drafted: { label: 'Bank Application Drafted', textClass: 'text-sky-800', bgClass: 'bg-sky-50 border-sky-200' },
  Issued: { label: 'Issued by Bank (In Hand)', textClass: 'text-emerald-800', bgClass: 'bg-emerald-50 border-emerald-200' },
  Submitted: { label: 'Submitted to Client Box', textClass: 'text-indigo-800', bgClass: 'bg-indigo-50 border-indigo-200' },
  Released: { label: 'Released & Reclaimed', textClass: 'text-neutral-700', bgClass: 'bg-neutral-100 border-neutral-200' },
};
