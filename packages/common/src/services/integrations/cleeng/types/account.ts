import type { Response } from './api';
import type { CleengCustomer, UpdateConfirmation } from './models';

// Cleeng typings for the account endpoints

// Customer
export type GetCustomerResponse = Response<CleengCustomer>;
export type UpdateCustomerResponse = Response<CleengCustomer>;

// Consents
export type UpdateConsentsResponse = Response<UpdateConfirmation>;
