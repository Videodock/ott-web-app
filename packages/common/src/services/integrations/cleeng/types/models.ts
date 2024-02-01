// Cleeng typings for API models

export interface CleengCustomer {
  id: string;
  email: string;
  country: string;
  regDate: string;
  lastLoginDate?: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: Record<string, unknown>;
}

export interface UpdateConfirmation {
  success: boolean;
}

export interface LocalesData {
  country: string;
  currency: string;
  locale: string;
  ipAddress: string;
}

export interface PublisherConsent {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  version: string;
  value: string;
}

export interface CustomerConsent {
  customerId: string;
  date: number;
  label: string;
  name: string;
  needsUpdate: boolean;
  newestVersion: string;
  required: boolean;
  state: 'accepted' | 'declined';
  value: string | boolean;
  version: string;
}

export type CleengCaptureField = {
  key: string;
  enabled: boolean;
  required: boolean;
  answer: string | Record<string, string | null> | null;
};

export type CleengCaptureQuestionField = {
  key: string;
  enabled: boolean;
  required: boolean;
  value: string;
  question: string;
  answer: string | null;
};

export type GetCaptureStatusResponse = {
  isCaptureEnabled: boolean;
  shouldCaptureBeDisplayed: boolean;
  settings: Array<CleengCaptureField | CleengCaptureQuestionField>;
};

export type CaptureCustomAnswer = {
  questionId: string;
  question: string;
  value: string;
};

export type UpdateCaptureAnswersPayload = {
  firstName?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
  birthDate?: string;
  companyName?: string;
  phoneNumber?: string;
  customAnswers?: CaptureCustomAnswer[];
};
