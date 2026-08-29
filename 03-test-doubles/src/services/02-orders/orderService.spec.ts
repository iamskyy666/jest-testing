import { OrderService } from "./OrderService";

class InventoryServicesStub {
  private inStock: boolean = true;
  setInStock(value: boolean) {
    this.inStock = value;
  }

  checkStock(productId: string): boolean {
    console.log("productId:", productId);
    return this.inStock;
  }
}

class FakePaymentGateway {
  private transactions: { amount: number; status: string }[] = [];
  processPayment(amount: number): string {
    this.transactions.push({ amount, status: "success" });
    return `Processed payment of $${amount}`;
  }

  getTransactions(): { amount: number; status: string }[] {
    return this.transactions;
  }
}

// Stubs And Fakes in action..
describe("OrdersService", () => {
  it("process payment and calculate bonus pts. correctly when in stock", () => {
    const fakePaymentGateway = new FakePaymentGateway();
    const inventoryStub = new InventoryServicesStub();
    const orderService = new OrderService(fakePaymentGateway, inventoryStub);

    const result = orderService.checkout(100, "PROD111");
    expect(result).toBe("Processed payment of $100 - Earned 10 bonus points!");
    expect(fakePaymentGateway.getTransactions()).toEqual([
      {
        amount: 100,
        status: "success",
      },
    ]);
  });

  it("order fails when product is out of stock", () => {
    const fakePaymentGateway = new FakePaymentGateway();
    const inventoryStub = new InventoryServicesStub();
    inventoryStub.setInStock(false); // mimicking out-of-stock in DB.
    const orderService = new OrderService(fakePaymentGateway, inventoryStub);

    const result = orderService.checkout(100, "PROD111");
    expect(result).toBe("Order failed: Product out of stock");
    expect(fakePaymentGateway.getTransactions()).toEqual([]);
  });

  it("handles decimal amounts for bonus pts.", () => {
    const fakePaymentGateway = new FakePaymentGateway();
    const inventoryStub = new InventoryServicesStub();
    const orderService = new OrderService(fakePaymentGateway, inventoryStub);

    const result = orderService.checkout(66.99, "PROD111");
    expect(result).toBe("Processed payment of $66.99 - Earned 6 bonus points!");
    expect(fakePaymentGateway.getTransactions()).toEqual([
      {
        amount: 66.99,
        status: "success",
      },
    ]);
  });
});
