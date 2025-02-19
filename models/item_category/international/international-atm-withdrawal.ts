import { Currencies, TransactionCode } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseInternationalATMWithdrawal extends BaseItemCategory {
  constructor(args: {
    hasSettlement: boolean;
    hasAuth: boolean;
    isDirectSettlment: boolean;
    isPartialRefund: boolean;
    isFullRefund: boolean;
    code: string;
  }) {
    super({
      name: "International ATM Withdrawal",
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
    return 30;
  }

  transactionCode(): TransactionCode {
    return TransactionCode.cash;
  }

  refundTransactionCode(): TransactionCode {
    return this.transactionCode();
  }
}

export class InternationalATMWithdrawal extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0013",
    });
  }
}

export class InternationalATMWithdrawalDirectSettlement extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: true,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0013",
    });
  }
}
export class InternationalATMWithdrawalAuth extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0013",
    });
  }
}
export class InternationalATMWithdrawalReversal extends BaseInternationalATMWithdrawal {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0014",
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
export class InternationalATMWithdrawalRefund extends BaseInternationalATMWithdrawal {
  changeTransactionCode: boolean;

  constructor(args: { changeTransactionCode: boolean }) {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0014",
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
