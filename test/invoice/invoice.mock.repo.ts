import { CreateInvoiceInput, CreateInvoiceRecord, InvoiceDto } from '@app/core/schema/invoice.types.ts';
import { IInvoiceRepository } from '@app/logic/invoice.repository.ts';

class MockInvoiceRepo implements IInvoiceRepository {
  private invoices: CreateInvoiceRecord[] = [];

  sequenceStore: Record<string, number> = {}; // { "userId-year": lastSequence }

  create(data: CreateInvoiceRecord): Promise<InvoiceDto> {
    this.invoices.push(data);
     return Promise.resolve(createTestInvoiceFactory(data))
  }

  incrementAndGetSequence(userId: string, year: number): Promise<number> {
    const key = `${userId}-${year}`;
    this.sequenceStore[key] = (this.sequenceStore[key] || 0) + 1;
    return Promise.resolve(this.sequenceStore[key]);
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
        clientId: "uuid-001",
        invoiceNumber: "INV-2026-001",
        status: "draft" as const,
        dueDate: tomorrow,
        subtotal: 150000,   // ₦150,000
        vatAmount: 11250,  // ₦11,250 (7.5% of ₦150,000)
        discount: 0,
        total: 161250,      // ₦161,250
        notes: "Notes",
        publicToken: "public-token-abc",
        createdAt: new Date("2026-02-23T08:00:00Z"),
        items: [{
            description: "Item 1",
            quantity: 2,
            unitPrice: 50000,
            total: 100000
        }],
        ...overrides,
    }
}

