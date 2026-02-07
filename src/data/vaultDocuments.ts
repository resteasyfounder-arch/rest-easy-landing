import { DollarSign, Scale, HeartPulse, Monitor, Shield, User, type LucideIcon } from "lucide-react";

export interface VaultDocument {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  description?: string;
  hasExternalLink?: boolean;
}

export interface VaultCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  documents: VaultDocument[];
}

export const vaultCategories: VaultCategory[] = [
  {
    id: "financial",
    name: "Financial",
    icon: DollarSign,
    documents: [
      { id: "bank-accounts", name: "Bank Accounts", priority: "high", description: "List of all bank accounts with institutions and account types" },
      { id: "investment-accounts", name: "Investment Accounts", priority: "high", description: "Brokerage, mutual fund, and other investment account details" },
      { id: "retirement-accounts", name: "Retirement Accounts", priority: "high", description: "401(k), IRA, pension, and other retirement account info" },
      { id: "tax-returns", name: "Tax Returns", priority: "medium", description: "Recent tax returns and related documentation" },
      { id: "insurance-policies-fin", name: "Insurance Policies", priority: "medium", description: "All active insurance policy documents" },
      { id: "debts-loans", name: "Debts & Loans", priority: "medium", description: "Mortgage, student loans, credit cards, and other debts" },
      { id: "property-valuations", name: "Property Valuations", priority: "low", description: "Appraisals and valuations for real estate and valuable assets" },
    ],
  },
  {
    id: "legal",
    name: "Legal",
    icon: Scale,
    documents: [
      { id: "vehicle-titles", name: "Vehicle Titles", priority: "medium", description: "Titles for all owned vehicles" },
      { id: "will-testament", name: "Will / Testament", priority: "high", hasExternalLink: true, description: "Your last will and testament document" },
      { id: "power-of-attorney", name: "Power of Attorney", priority: "high", description: "Durable and/or financial power of attorney documents" },
      { id: "trust-documents", name: "Trust Documents", priority: "medium", description: "Living trust or other trust documentation" },
      { id: "property-deeds", name: "Property Deeds", priority: "medium", description: "Deeds for all owned real property" },
      { id: "guardian-designation", name: "Guardian Designation", priority: "high", description: "Legal guardian designation for minor children" },
      { id: "beneficiary-designations", name: "Beneficiary Designations", priority: "high", description: "Beneficiary designations for all accounts and policies" },
      { id: "marriage-divorce-docs", name: "Marriage / Divorce Documents", priority: "low", description: "Marriage certificates, divorce decrees, prenuptial agreements" },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: HeartPulse,
    documents: [
      { id: "healthcare-directive", name: "Healthcare Directive", priority: "high", description: "Advance directive / living will for medical decisions" },
      { id: "hipaa-authorization", name: "HIPAA Authorization", priority: "high", description: "Authorization for sharing medical information" },
      { id: "organ-donor-info", name: "Organ Donor Information", priority: "low", description: "Organ and tissue donation preferences" },
      { id: "medical-history", name: "Medical History", priority: "medium", description: "Summary of medical conditions, medications, and allergies" },
    ],
  },
  {
    id: "digital",
    name: "Digital",
    icon: Monitor,
    documents: [
      { id: "digital-account-inventory", name: "Digital Account Inventory", priority: "high", description: "List of all online accounts and services" },
      { id: "password-manager-info", name: "Password Manager Info", priority: "high", description: "Access details for your password manager" },
      { id: "social-media-wishes", name: "Social Media Wishes", priority: "low", description: "Instructions for social media accounts after passing" },
      { id: "email-access", name: "Email Access Instructions", priority: "medium", description: "How to access your primary email accounts" },
    ],
  },
  {
    id: "insurance",
    name: "Insurance",
    icon: Shield,
    documents: [
      { id: "life-insurance", name: "Life Insurance", priority: "high", description: "Life insurance policy details and beneficiaries" },
      { id: "home-renters-insurance", name: "Home / Renters Insurance", priority: "medium", description: "Homeowners or renters insurance policy" },
      { id: "auto-insurance", name: "Auto Insurance", priority: "low", description: "Auto insurance policy details" },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    icon: User,
    documents: [
      { id: "letter-of-intent", name: "Letter of Intent / Personal Wishes", priority: "medium", description: "Personal letter expressing your wishes and values" },
    ],
  },
];

export const totalDocumentCount = vaultCategories.reduce(
  (sum, cat) => sum + cat.documents.length, 0
);
