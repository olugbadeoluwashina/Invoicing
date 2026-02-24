import { CreateInvoiceInput, CreateInvoiceRecord, InvoiceResult } from '@app/core/schema/invoice.types.ts';
import { IInvoiceRepository } from '@app/logic/invoice.repository.ts';
import { de } from 'zod/v4/locales';

class MockInvoiceRepo implements IInvoiceRepository {
  private invoices: CreateInvoiceRecord[] = [];

  create(data: CreateInvoiceRecord): Promise<InvoiceResult> {
    this.invoices.push(data);
     return Promise.resolve(createTestInvoiceFactory(data))
  }
}

export function fakeInvoiceRepo(): IInvoiceRepository {
  return new MockInvoiceRepo();
}

export function createTestInvoiceFactory(overrides?: Partial<CreateInvoiceInput>) {
    //return date for the next day in format 'YYYY-MM-DD'
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const tomorrow = today.toISOString().split('T')[0];

    return {
        id: "invoice-uuid-001",
        userId: "user-uuid-001",
        invoiceNumber: "INV-2026-001",
        status: "draft" as const,
        clientId: "client-uuid-001",
        dueDate: tomorrow,
        subtotal: 150000,   // ₦150,000
        vatAmount: 11250,  // ₦11,250 (7.5% of ₦150,000)
        discount: 0,
        total: 161250,      // ₦161,250
        notes: "Notes",
        publicToken: "public-token-abc",
        publicUrl: "http://localhost:8000/i/public-token-abc",
        createdAt: new Date("2026-02-23T08:00:00Z"),
        items: [{
          id: "item-uuid-001",
          total: 150000,
          description: "Item 1",
          quantity: 1,
          unitPrice: 150000,// ₦150,000
        }],
        ...overrides,
        
        
    }
}

