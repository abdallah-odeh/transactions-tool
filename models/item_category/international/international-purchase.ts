import { Currencies, TransactionCode } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseInternationalPurchase extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isDirectSettlment: boolean;
    isFullRefund: boolean;
    isPartialRefund: boolean;
    code: string;
  }) {
    super({
      name: "International Purchase",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isDirectSettlment: args.isDirectSettlment,
      isFullRefund: args.isFullRefund,
      isPartialRefund: args.isPartialRefund,
      code: args.code,
    });
  }

  getCurrency(): Currencies {
    return Currencies.inr;
  }

  getFee(amount: number): number {
    return 0;
  }

  transactionCode(): TransactionCode {
    return TransactionCode.purchase;
  }

  refundTransactionCode(): TransactionCode {
    return this.transactionCode();
  }
}

export class InternationalPurchase extends BaseInternationalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0007",
    });
  }
}

export class InternationalPurchaseReversal extends BaseInternationalPurchase {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0008",
    });
    this.changeTransactionCode = args.changeTransactionCode;
  }
  refundTransactionCode(): TransactionCode {
    if (this.changeTransactionCode) return TransactionCode.return;
    return super.refundTransactionCode();
  }

  displayName(): string {
    return `${super.displayName()} (Transaction code ${this.refundTransactionCode()})`;
  }
}
export class InternationalPurchasePartialRefund extends BaseInternationalPurchase {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: true,
      code: "0009",
    });
    this.changeTransactionCode = args.changeTransactionCode;
  }
  refundTransactionCode(): TransactionCode {
    if (this.changeTransactionCode) return TransactionCode.return;
    return super.refundTransactionCode();
  }

  displayName(): string {
    return `${super.displayName()} (Transaction code ${this.refundTransactionCode()})`;
  }
}
export class InternationalPurchaseFullRefund extends BaseInternationalPurchase {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0009",
    });
    this.changeTransactionCode = args.changeTransactionCode;
  }
  refundTransactionCode(): TransactionCode {
    if (this.changeTransactionCode) return TransactionCode.return;
    return super.refundTransactionCode();
  }

  displayName(): string {
    return `${super.displayName()} (Transaction code ${this.refundTransactionCode()})`;
  }
}
