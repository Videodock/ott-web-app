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
