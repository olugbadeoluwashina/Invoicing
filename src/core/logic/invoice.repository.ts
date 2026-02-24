import { CreateInvoiceRecord, InvoiceResult } from '../schema/invoice.types.ts';

export interface IInvoiceRepository {
  create(data: CreateInvoiceRecord): Promise<InvoiceResult>;
}
