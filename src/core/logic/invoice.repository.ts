import { CreateInvoiceRecord, InvoiceDto } from '../schema/invoice.types.ts';

export interface IInvoiceRepository {
  create(data: CreateInvoiceRecord): Promise<InvoiceDto>;
  incrementAndGetSequence(userId: string, year: number): Promise<number>;
}
