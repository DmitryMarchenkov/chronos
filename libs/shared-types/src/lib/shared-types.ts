export enum Role {
  OWNER = 'OWNER',
  CONSULTANT = 'CONSULTANT',
  VIEWER = 'VIEWER',
}

export enum AssessmentType {
  AI_ADOPTION = 'AI_ADOPTION',
  DIGITAL_TRANSFORMATION = 'DIGITAL_TRANSFORMATION',
}

export enum AssessmentDomain {
  STRATEGY = 'STRATEGY',
  PROCESS = 'PROCESS',
  DATA = 'DATA',
  TECH = 'TECH',
  PEOPLE = 'PEOPLE',
  GOVERNANCE = 'GOVERNANCE',
  SECURITY = 'SECURITY',
}

export enum LeadStatus {
  NEW = 'NEW',
  PROSPECTING = 'PROSPECTING',
  CONVERTED = 'CONVERTED',
}

export type DomainScore = {
  domain: AssessmentDomain;
  score: number;
  notes?: string | null;
};

export type ClientSummary = {
  id: string;
  name: string;
  createdAt: string;
};

export type LeadSummary = {
  id: string;
  name: string;
  contact: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
};

export type AssessmentSummary = {
  id: string;
  clientId: string;
  type: AssessmentType;
  createdAt: string;
};

export type MemberSummary = {
  id: string;
  userId: string;
  email: string;
  role: Role;
  createdAt: string;
};
