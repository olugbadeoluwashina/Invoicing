import { expect } from '@std/expect';
import { CreateInvoiceUC } from '@app/logic/invoice.usecase.ts';
import { createTestInvoiceFactory, fakeInvoiceRepo } from './invoice.mock.repo.ts';
import { InvoiceResult } from '@app/core/schema/invoice.types.ts';

Deno.test('CREATEINVOICEUC: verify user can create invoice successfully', async () => {
  const repo = fakeInvoiceRepo()
  const invoiceUC = new CreateInvoiceUC(repo);

  const result = await invoiceUC.execute('uuid-001', createTestInvoiceFactory({clientId: "uuid-001"}));

  expect(result?.ok).toBe(true);
  expect(result).toHaveProperty('value');
  if (!result?.ok) return;
  expect(result?.value?.clientId).toEqual("uuid-001");

});

Deno.test('CREATEINVOICEUC: should return error if no items are provided', async () => {
  const repo = fakeInvoiceRepo();
  const invoiceUC = new CreateInvoiceUC(repo);

  const result = await invoiceUC.execute('uuid-001', createTestInvoiceFactory({clientId: "uuid-001", items: []}));
  console.log(result)
  expect(result?.ok).toBe(false);
  expect(result).toHaveProperty('error');
})

Deno.test("CreateInvoiceUseCase - past due date returns VALIDATION_ERROR", async () => {
  const repo = fakeInvoiceRepo();
  const useCase = new CreateInvoiceUC(repo);

  const result = await useCase.execute("uuid-001", createTestInvoiceFactory({dueDate: "2026-02-01", items: []}));

  expect(result?.ok).toBe(false);
  console.log(result)
  expect(result).toHaveProperty("error");

  if(result?.ok) return
  expect(result?.error.code).toBe("VALIDATION_ERROR");
});

Deno.test("CreateInvoiceUC - subtotal, vatAmount, total are calculated correctly", async (test) => {
  const repo = fakeInvoiceRepo();
  const useCase = new CreateInvoiceUC(repo);

  const result = await useCase.execute("uuid-001", createTestInvoiceFactory({
    clientId: "uuid-001",
    items: [
      { description: "Item 1", quantity: 2, unitPrice: 50000 }, // ₦100,000
      { description: "Item 2", quantity: 1, unitPrice: 50000 }, // ₦50,000
    ],
    discount: 5000, // ₦5,000
  }));

  expect(result?.ok).toBe(true);
  

  await test.step("Verify calculations of subtotal, vatAmount, total are correct", () => {
    
    if (!result?.ok) return;
    console.log(result.value)
    expect(result.value.subtotal).toBe(15000000); // ₦150,000
    expect(result.value.vatAmount).toBe(1125000); // ₦11,250 (7.5% of ₦150,000)
    expect(result.value.total).toBe(15625000); // ₦161,250 (subtotal + VAT - discount)
  })

  await test.step("total per item is calculated correctly", () => {
    if (!result?.ok) return;
    expect(result.value.items[0].total).toBe(10000000); // ₦100,000
    expect(result.value.items[1].total).toBe(5000000); // ₦50,000
  });
})