import {
  ClassMessage,
  Currencies,
  TransactionCode,
  TransactionType,
} from "../transaction_type";

export type TransactionParams = {
  amount: number;
  transactionType: TransactionType;
  transactionCode: TransactionCode;
  card: any;
  date?: Date;
  currency?: Currencies;
};

export type Records = {
  webhooks: string[];
  transactions: string[];
};

export abstract class BaseItemCategory {
  name: string;
  hasSettlement: boolean;
  hasAuth: boolean;
  isRefund: boolean;
  code: string;

  constructor(args: {
    name: string;
    hasSettlement: boolean;
    hasAuth: boolean;
    isRefund: boolean;
    code: string;
  }) {
    this.name = args.name;
    this.hasSettlement = args.hasSettlement;
    this.hasAuth = args.hasAuth;
    this.isRefund = args.isRefund;
    this.code = args.code;
  }

  displayName(): string {
    if (this.isRefund) {
      if (this.hasSettlement) {
        return `${this.name.trim()} Refund (${this.code})`;
      } else if (this.hasAuth) {
        return `${this.name.trim()} Reversal (${this.code})`;
      }
    }
    if (this.hasSettlement && this.hasAuth) {
      return `${this.name.trim()} Auth & Settlement (${this.code})`;
    } else if (this.hasSettlement) {
      return `${this.name.trim()} Direct settlement (${this.code})`;
    } else if (this.hasAuth) {
      return `${this.name.trim()} Auth (${this.code})`;
    }
    return this.name;
  }

  getMessageClass(asWebhook: boolean = false): ClassMessage {
    if (this.hasSettlement && this.hasAuth) {
      if (asWebhook) {
        return ClassMessage.authorization;
      } else {
        return ClassMessage.financial;
      }
    } else if (this.hasSettlement) {
      return ClassMessage.financial;
    } else if (this.hasAuth) {
      return ClassMessage.authorization;
    }
    return ClassMessage.authorization;
  }

  abstract getRecords(args: TransactionParams): Records;
}

export abstract class BaseRefundItemCategory extends BaseItemCategory {
  isFull: boolean;
  constructor(args: {
    name: string;
    hasSettlement: boolean;
    hasAuth: boolean;
    isFull: boolean;
    code: string;
  }) {
    super({
      name: args.name,
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isRefund: true,
      code: args.code,
    });
    this.isFull = args.isFull;
  }

  displayName(): string {
    const result = super.displayName();
    if (this.isFull) {
      return result
        .replace("Refund", "Full Refund")
        .replace("Reversal", "Full Reversal");
    }
    return result
      .replace("Refund", "Partial Refund")
      .replace("Reversal", "Partial Reversal");
  }

  getMessageClass(asWebhook?: boolean): ClassMessage {
    return ClassMessage.reversalOrChargeBack;
  }
}
