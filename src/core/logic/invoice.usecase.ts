import { fail, ok, Result } from '@app/shared/result.ts';
import { toKobo, toNaira } from '@app/shared/money.ts';
import { CreateInvoiceInput, InvoiceDto, InvoiceResult } from '@app/core/schema/invoice.types.ts';
import { IInvoiceRepository } from '@app/core/logic/invoice.repository.ts';

const INVOICE_PREFIX = "PAYT";

export class CreateInvoiceUC {
  
  constructor(private repo: IInvoiceRepository) {}

  async execute(userId: string, input: CreateInvoiceInput): Promise<Result<InvoiceResult>>  {

    // VALIDATE BUSINESS RULES ────────────────────────────────────
    // Plain return values — no error classes, no throw, no framework.

    if (input.items.length === 0) {
      return fail({ code: "VALIDATION_ERROR", message: "Invoice must have at least one line item" });
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        return fail({ code: "VALIDATION_ERROR", message: `Quantity must be greater than 0 for: "${item.description}"` });
      }
      if (item.unitPrice <= 0) {
        return fail({ code: "VALIDATION_ERROR", message: `Unit price must be greater than 0 for: "${item.description}"` });
      }
    }

    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      return fail({ code: "VALIDATION_ERROR", message: "Invalid due date. Use YYYY-MM-DD format" });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return fail({ code: "VALIDATION_ERROR", message: "Due date cannot be in the past" });
    }

    const totalInItems = input.items.map((item) => {
      const unitPrice = toKobo(item.unitPrice);
      const total = item.quantity * unitPrice;
      
      return { ...item, unitPrice, total };
    });

    const subtotal = totalInItems.reduce((sum, itemTotal) => sum + itemTotal.total, 0);
    const publicToken = crypto.randomUUID();
    const vatAmount = Math.round(subtotal * 0.075); // 7.5% VAT
    const discount = toKobo(input.discount ?? 0);
    const total = subtotal + vatAmount - discount;

    //invoice number generation logic
    const sequence = await this.repo.incrementAndGetSequence(userId, new Date().getFullYear());
    const invoiceNumber = this.formatInvoiceNumber(new Date().getFullYear(), sequence);

    const invoice: InvoiceDto = await this.repo.create({
      userId,
      clientId: input.clientId,
      invoiceNumber,
      dueDate: input.dueDate,
      subtotal, // Convert back to Naira for storage
      vatAmount, // 7.5% VAT
      discount,
      total, // subtotal + VAT - discount
      notes: input.notes,
      status: 'draft',
      publicToken,
      items: totalInItems.map(item => item),
    })
    
    // RETURN RESULT ─────────────────────────────────────────────
    return ok({
      id: invoice.id,
      invoiceNumber,
      dueDate: input.dueDate,
      subtotal: toNaira(subtotal), // Convert back to Naira for output
      vatAmount: toNaira(vatAmount), // Convert back to Naira for output
      discount: toNaira(discount), // Convert back to Naira for output
      total: toNaira(total), // Convert back to Naira for output
      notes: input.notes ?? null,
      status: input?.status || 'draft' as const,
      //publicToken: invoice.publicToken,
     // publicUrl: invoice.publicUrl,
      createdAt: invoice.createdAt,
      items: totalInItems.map(item => {
        item.unitPrice = toNaira(item.unitPrice);
        item.total = toNaira(item.total);
        return item;
      }),
    });
  }

  private formatInvoiceNumber(year: number, sequence: number): string {
    const padded = String(sequence).padStart(3, "0");
    return `${INVOICE_PREFIX}-${year}-${padded}`;
  }
}