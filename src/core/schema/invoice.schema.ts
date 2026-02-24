import { z } from 'zod';

// ─── INVOICE STATUS ───────────────────────────────────────────────────────────
// Defined as a Zod enum so it can be reused for response validation
// and future parsing (e.g. validating query filter params).

export const InvoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled',
]);

// ─── LINE ITEM INPUT ──────────────────────────────────────────────────────────

export const InvoiceLineItemInputSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
});

// ─── CREATE INVOICE INPUT ─────────────────────────────────────────────────────
// This schema is imported by the router for request validation.
// It defines shape only — business rules (past due dates etc) live in the use case.

export const CreateInvoiceInputSchema = z.object({
  clientId: z.uuid('client_id must be a valid UUID'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  items: z.array(InvoiceLineItemInputSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  discount: z.number().min(0).optional(),
  applyVat: z.boolean().optional(),
});
