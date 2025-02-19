import { Currencies, TransactionCode } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseLocalPurchase extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isPartialRefund: boolean;
    isFullRefund: boolean;
    isDirectSettlment: boolean;
    code: string;
  }) {
    super({
      name: "Domestic Purchase",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isFullRefund: args.isFullRefund,
      isPartialRefund: args.isPartialRefund,
      isDirectSettlment: args.isDirectSettlment,
      code: args.code,
    });
  }

  getCurrency(): Currencies {
    return Currencies.sar;
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

export class LocalPurchaseAuthSettlment extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0003",
    });
  }
}

export class LocalPurchaseAuth extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0007",
    });
  }
}
export class LocalPurchaseReversal extends BaseLocalPurchase {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0003",
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

export class LocalPurchasePartialRefund extends BaseLocalPurchase {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: true,
      code: "0005",
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
export class LocalPurchaseFullRefund extends BaseLocalPurchase {
  changeTransactionCode: boolean;
  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0005",
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
