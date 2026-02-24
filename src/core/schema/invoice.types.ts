import z from 'zod';
import {
  CreateInvoiceInputSchema,
  InvoiceStatusSchema,
} from '@app/core/schema/invoice.schema.ts';


export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInputSchema>;

export type InvoiceLineItemResult = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number; // Naira
  total?: number; // Naira
};


export type InvoiceResult = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientId: string;
  dueDate: string;
  subtotal: number; // Naira
  vatAmount: number; // Naira
  discount: number; // Naira
  total: number; // Naira
  notes: string | null;
  publicToken: string;
  items: InvoiceLineItemResult[];
  createdAt: Date;
};

export type CreateInvoiceRecord = {
  userId: string;
  clientId: string;
  invoiceNumber: string;
  dueDate: string;
  subtotal: number; // kobo
  vatAmount: number; // kobo
  discount: number; // kobo
  total: number; // kobo
  notes?: string;
  status: InvoiceStatus;
  publicToken: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number; // Naira
  }[];
};
