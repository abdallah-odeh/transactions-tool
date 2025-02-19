import { Currencies, TransactionCode } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseLocalATMWithdrawal extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isPartialRefund: boolean;
    isFullRefund: boolean;
    isDirectSettlment: boolean;
    code: string;
  }) {
    super({
      name: "Local ATM Withdrawal",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isDirectSettlment: args.isDirectSettlment,
      isPartialRefund: args.isPartialRefund,
      isFullRefund: args.isFullRefund,
      code: args.code,
    });
  }

  getCurrency(): Currencies {
    return Currencies.sar;
  }

  getFee(amount: number): number {
    return 10;
  }

  transactionCode(): TransactionCode {
    return TransactionCode.cash;
  }

  refundTransactionCode(): TransactionCode {
    return this.transactionCode();
  }
}

export class LocalATMWithdrawal extends BaseLocalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: false,
      code: "0011",
    });
  }
}

export class LocalATMWithdrawalDirectSettlement extends BaseLocalATMWithdrawal {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: true,
      isPartialRefund: false,
      isFullRefund: false,
      code: "0011",
    });
  }
}
export class LocalATMWithdrawalAuth extends BaseLocalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: false,
      code: "0011",
    });
  }
}
export class LocalATMWithdrawalReversal extends BaseLocalATMWithdrawal {
  changeTransactionCode: boolean;
  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: true,
      code: "0012",
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
export class LocalATMWithdrawalRefund extends BaseLocalATMWithdrawal {
  changeTransactionCode: boolean;
  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: true,
      code: "0017",
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
