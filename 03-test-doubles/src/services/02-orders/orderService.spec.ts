import { OrderService } from "./OrderService";

class InventoryServicesStub {
  private inStock: boolean = true;
  setInStock(value: boolean) {
    this.inStock = value;
  }

  checkStock(productId: string): boolean {
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
