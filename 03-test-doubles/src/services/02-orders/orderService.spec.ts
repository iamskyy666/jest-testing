import { OrderService } from "./OrderService";

class InventoryServicesStub {
  private inStock: boolean = true;
  setInStock(value: boolean) {
    this.inStock = value;
  }

  checkStock(_productId: string): boolean {
    // console.log("productId:", productId);
    return this.inStock;
  }
}

type Transaction = { amount: number; status: string }; // refactored

class FakePaymentGateway {
  private transactions: Transaction[] = [];
  processPayment(amount: number): string {
    this.transactions.push({ amount, status: "success" });
    return `Processed payment of $${amount}`;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }
}

// Stubs And Fakes in action..
describe("OrdersService", () => {
  let fakePaymentGateway: FakePaymentGateway;
  let inventoryStub: InventoryServicesStub;
  let orderService: OrderService;
  let amount: number;
  let productId: string;

  beforeEach(() => {
    console.log("Before each.. ✅");
    fakePaymentGateway = new FakePaymentGateway();
    inventoryStub = new InventoryServicesStub();
    orderService = new OrderService(fakePaymentGateway, inventoryStub);
    amount = 100;
    productId = "PROD123";
  });

  it("process payment and calculate bonus pts. correctly when in stock", () => {
    const result = orderService.checkout(amount, productId);
    expect(result).toBe(
      `Processed payment of $${amount} - Earned 10 bonus points!`,
    );
    expect(fakePaymentGateway.getTransactions()).toEqual([
      {
        amount: 100,
        status: "success",
      },
    ]);
  });

  it("order fails when product is out of stock", () => {
    inventoryStub.setInStock(false); // mimicking out-of-stock in DB.
    const result = orderService.checkout(amount, productId);
    expect(result).toBe("Order failed: Product out of stock");
    expect(fakePaymentGateway.getTransactions()).toEqual([]);
  });

  it("handles decimal amounts for bonus pts.", () => {
    amount = 66.99;
    const result = orderService.checkout(amount, productId);
    expect(result).toBe(`Processed payment of $${amount} - Earned 6 bonus points!`);
    expect(fakePaymentGateway.getTransactions()).toEqual([
      {
        amount: 66.99,
        status: "success",
      },
    ]);
  });
});

/*
$ npm test -- orderService

> 03-test-doubles@1.0.0 test
> jest orderService

  console.log
    Before each.. ✅

      at Object.<anonymous> (src/services/02-orders/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/02-orders/orderService.spec.ts:38:13)

  console.log
    Before each.. ✅

      at Object.<anonymous> (src/services/02-orders/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/02-orders/orderService.spec.ts:38:13)

  console.log
    Before each.. ✅

      at Object.<anonymous> (src/services/02-orders/C:/Users/ASUS/Desktop/jest-testing/03-test-doubles/src/services/02-orders/orderService.spec.ts:38:13)

 PASS  src/services/02-orders/orderService.spec.ts
  OrdersService
    √ process payment and calculate bonus pts. correctly when in stock (53 ms)
    √ order fails when product is out of stock (5 ms)
    √ handles decimal amounts for bonus pts. (6 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.729 s, estimated 1 s
Ran all test suites matching orderService.
*/
