import { expect } from '@std/expect';
import { assertSpyCalls, spy } from '@std/testing/mock';
import { CreateInvoiceUC } from '@app/logic/invoice.usecase.ts';
import { createTestInvoiceFactory, fakeInvoiceRepo } from './invoice.mock.repo.ts';
import { assertFailed, assertOk } from '../helper.ts';

Deno.test('CREATEINVOICEUC: verify user can create invoice successfully', async () => {
  const repo = fakeInvoiceRepo()
  const invoiceUC = new CreateInvoiceUC(repo);

  const result = await invoiceUC.execute('uuid-001', createTestInvoiceFactory());

  assertOk(result);
  expect(result.value).toHaveProperty('id');
});

Deno.test('CREATEINVOICEUC: should return error if no items are provided', async () => {
  const repo = fakeInvoiceRepo();
  const invoiceUC = new CreateInvoiceUC(repo);

  const result = await invoiceUC.execute('uuid-001', createTestInvoiceFactory({items: []}));
  console.log(result)
  expect(result?.ok).toBe(false);
  expect(result).toHaveProperty('error');
})

Deno.test("CreateInvoiceUseCase - past due date returns VALIDATION_ERROR", async () => {
  const repo = fakeInvoiceRepo();
  const useCase = new CreateInvoiceUC(repo);

  const result = await useCase.execute("uuid-001", createTestInvoiceFactory({dueDate: "2026-02-01"}));

  assertFailed(result);
  console.log(result)
  expect(result).toHaveProperty("error");
  expect(result?.error.code).toBe("VALIDATION_ERROR");
});

Deno.test("CreateInvoiceUC - subtotal, vatAmount, total are calculated correctly", async (test) => {
  const repo = fakeInvoiceRepo();
  const useCase = new CreateInvoiceUC(repo);

  const result = await useCase.execute("uuid-001", createTestInvoiceFactory({
    clientId: "uuid-001",
    items: [
      { description: "Item 1", quantity: 2, unitPrice: 50000 }, // 100,000naira
      { description: "Item 2", quantity: 1, unitPrice: 50000 }, // 50,000naira
    ],
    discount: 5000, // 5,000naira
  }));

  assertOk(result);
  console.log(result.value)

  await test.step("Verify calculations of subtotal, vatAmount, total are correct", () => {
    expect(result.value.subtotal).toBe(150000); // 15000000kobo
    expect(result.value.vatAmount).toBe(11250); // 1125000kobo (7.5% of 150,000)
    expect(result.value.total).toBe(156250); // 16125000kobo (subtotal + VAT - discount)
  })

  await test.step("total per item is calculated correctly", () => {
    expect(result.value.items[0].total).toBe(100000); // ₦100,000
    expect(result.value.items[1].total).toBe(50000); // ₦50,000
  });

})

Deno.test("CreatInvoiceUC - verify invoice number generation is sequential per user and year", async (test) => {
  const repo = fakeInvoiceRepo();
  const useCase = new CreateInvoiceUC(repo);

  // Create first invoice for user in 2024
  const spied = spy(repo, "incrementAndGetSequence");
  const result1 = await useCase.execute("uuid-001", createTestInvoiceFactory({dueDate: "2026-03-04"}));
  assertOk(result1);
  console.log(result1.value)

  await test.step("verify incrementAndGetSequence is called with correct userId and year", () => {
    assertSpyCalls(spied, 1);
    expect(spied.calls[0].args[0]).toBe("uuid-001");
    expect(spied.calls[0].args[1]).toBe(new Date().getFullYear());
  });

  await test.step("verify invoice number is generated", () => {
    expect(result1.value.invoiceNumber).toMatch(/[A-Z]{3,}-\d{4}-\d{3}/);
  })

  await test.step("First invoice should have sequence 001", () => {
    expect(result1.value.invoiceNumber).toBe("PAYT-2026-001");
  });

  // Create second invoice for same user and year
  const result2 = await useCase.execute("uuid-001", createTestInvoiceFactory({dueDate: "2026-03-04"}));
  assertOk(result2);
  console.log(result2.value)
  await test.step("Second invoice should have sequence 002", () => {
    expect(result2.value.invoiceNumber).toBe("PAYT-2026-002");
  });

  // Create invoice for different user
  const result3 = await useCase.execute("uuid-002", createTestInvoiceFactory({dueDate: "2026-03-04"}));
  assertOk(result3);
  console.log(result3.value)
  await test.step("First invoice for different user should have sequence 001", () => {
    expect(result3.value.invoiceNumber).toBe("PAYT-2026-001");
  });

  // Create invoice for same user but different year
  const result4 = await useCase.execute("uuid-001", createTestInvoiceFactory({dueDate: "2027-03-04"}));
  assertOk(result4);
  console.log(result4.value)
  await test.step("First invoice for new year should reset to sequence 001", () => {
    expect(result4.value.invoiceNumber).toBe("PAYT-2027-001");
  });
})