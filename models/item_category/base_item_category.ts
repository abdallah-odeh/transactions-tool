import { Transaction } from "../transaction";
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
  hasSettlement: boolean; // indicator for sync files records
  hasAuth: boolean; // indicator for webhooks records
  isDirectSettlment: boolean; // indicator for webhook transaction's class message
  isPartialRefund: boolean;
  isFullRefund: boolean;
  code: string;

  constructor(args: {
    name: string;
    hasSettlement: boolean;
    hasAuth: boolean;
    isDirectSettlment: boolean;
    isPartialRefund: boolean;
    isFullRefund: boolean;
    code: string;
  }) {
    this.name = args.name;
    this.hasSettlement = args.hasSettlement;
    this.hasAuth = args.hasAuth;
    this.isPartialRefund = args.isPartialRefund;
    this.isFullRefund = args.isFullRefund;
    this.isDirectSettlment = args.isDirectSettlment;
    this.code = args.code;
  }

  displayName(): string {
    const flags = [this.name];
    if (this.isRefund()) {
      if (this.isPartialRefund) {
        flags.push("Partial");
      } else if (this.isFullRefund) {
        flags.push("Full");
      }

      if (this.hasAuth && !this.hasSettlement) {
        flags.push("Reversal");
      } else if (this.hasSettlement) {
        flags.push("Refund");
      }
    }

    if (this.isDirectSettlment) {
      flags.push("Direct Settlement");
    } else if (this.hasAuth && this.hasSettlement) {
      flags.push("Auth + Settlement");
    } else if (this.hasAuth) {
      flags.push("Auth");
    } else if (this.hasSettlement) {
      flags.push("Settlement");
    }

    flags.push(`(${this.code})`);

    return flags.join(" ");
  }
  getRecords(args: TransactionParams): Records {
    const webhooks = [];
    const transactions = [];
    const currency = this.getCurrency();

    const amount = args.amount;

    const fee = this.getFee(amount);
    const feeVAT = this.getVAT(fee);

    const fx = this.getFx(amount);
    const fxVAT = this.getVAT(fx);

    const totalFee = fee + fx;
    const totalVAT = this.getVAT(totalFee);

    let auth: Transaction | undefined;
    let transactionCode = args.transactionCode;
    if (this.name.toLowerCase().includes("atm")) {
      transactionCode = TransactionCode.cash;
    }

    if (this.hasAuth) {
      //should add webhook of type authorization
      auth = new Transaction({
        transactionType: args.transactionType,
        amount: args.amount,
        messageClass: ClassMessage.authorization,
        transactionCode: args.transactionCode,
        card: args.card,
        itemCategory: this,
        currency: currency,
        transactionDate: args.date,
        prepareAsWebhook: true,
      });
      webhooks.push(auth.asWebhook({ fees: totalFee, vatOnFees: totalVAT }));
    } else if (this.isDirectSettlment) {
      //should add webhook of type settlement
      auth = new Transaction({
        transactionType: args.transactionType,
        amount: args.amount,
        messageClass: ClassMessage.financial,
        transactionCode: args.transactionCode,
        card: args.card,
        itemCategory: this,
        currency: currency,
        transactionDate: args.date,
        prepareAsWebhook: true,
      });
      webhooks.push(auth.asWebhook({ fees: totalFee, vatOnFees: totalVAT }));
    }
    if (this.hasSettlement) {
      // should add sync file transactions
      const transaction = new Transaction({
        transactionType: args.transactionType,
        amount: args.amount,
        messageClass: ClassMessage.financial,
        transactionCode: args.transactionCode,
        card: args.card,
        itemCategory: this,
        currency: currency,
        transactionDate: args.date,
      });
      transaction.setChildOf(auth);
      transactions.push(transaction.asRow());

      // fees
      if (fee > 0) {
        const fees = new Transaction({
          transactionType: TransactionType.fee,
          amount: fee,
          messageClass: ClassMessage.financial,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });
        const vat = new Transaction({
          transactionType: TransactionType.vat,
          amount: feeVAT,
          messageClass: ClassMessage.financial,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });

        fees.setChildOf(auth);
        vat.setChildOf(fees);

        transactions.push(fees.asRow());
        transactions.push(vat.asRow());
      }

      // conversion rate
      if (fx > 0) {
        const fees = new Transaction({
          transactionType: TransactionType.fee,
          amount: fx,
          messageClass: ClassMessage.financial,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });
        const vat = new Transaction({
          transactionType: TransactionType.vat,
          amount: fxVAT,
          messageClass: ClassMessage.financial,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });

        fees.setChildOf(auth);
        vat.setChildOf(fees);

        transactions.push(fees.asRow());
        transactions.push(vat.asRow());
      }
    }
    if (this.isRefund()) {
      if ((this.hasAuth || this.isDirectSettlment) && !this.hasSettlement) {
        // should add reversal webhook
        const rev = new Transaction({
          transactionType: args.transactionType,
          amount: args.amount,
          messageClass: ClassMessage.reversalOrChargeBack,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: this.getCurrency(),
          transactionDate: args.date,
          prepareAsWebhook: true,
        });
        rev.reference = auth?.transactionID;
        webhooks.push(rev.asWebhook({ fees: totalFee, vatOnFees: totalVAT }));
      }
      if (this.hasSettlement) {
        // should add refund

        const transaction = new Transaction({
          transactionType: args.transactionType,
          amount: args.amount,
          messageClass: ClassMessage.reversalOrChargeBack,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: this.getCurrency(),
          transactionDate: args.date,
        });
        transaction.setChildOf(auth);
        transactions.push(transaction.asRow());

        // fees
        if (fee > 0) {
          const fees = new Transaction({
            transactionType: TransactionType.fee,
            amount: fee,
            messageClass: ClassMessage.reversalOrChargeBack,
            transactionCode: args.transactionCode,
            card: args.card,
            itemCategory: this,
            currency: transaction.currency,
            transactionDate: args.date,
          });
          const vat = new Transaction({
            transactionType: TransactionType.vat,
            amount: feeVAT,
            messageClass: ClassMessage.reversalOrChargeBack,
            transactionCode: args.transactionCode,
            card: args.card,
            itemCategory: this,
            currency: transaction.currency,
            transactionDate: args.date,
          });

          fees.setChildOf(auth);
          vat.setChildOf(fees);

          transactions.push(fees.asRow());
          transactions.push(vat.asRow());
        }

        // conversion rate
        if (fx > 0) {
          const fees = new Transaction({
            transactionType: TransactionType.fee,
            amount: fx,
            messageClass: ClassMessage.reversalOrChargeBack,
            transactionCode: args.transactionCode,
            card: args.card,
            itemCategory: this,
            currency: transaction.currency,
            transactionDate: args.date,
          });
          const vat = new Transaction({
            transactionType: TransactionType.vat,
            amount: fxVAT,
            messageClass: ClassMessage.reversalOrChargeBack,
            transactionCode: args.transactionCode,
            card: args.card,
            itemCategory: this,
            currency: transaction.currency,
            transactionDate: args.date,
          });

          fees.setChildOf(auth);
          vat.setChildOf(fees);

          transactions.push(fees.asRow());
          transactions.push(vat.asRow());
        }
      }
    }

    return {
      webhooks: webhooks,
      transactions: transactions,
    };
  }

  abstract getCurrency(): Currencies;

  abstract getFee(amount: number): number;

  getFx(amount: number): number {
    if (this.getCurrency() == Currencies.sar) return 0;
    return amount * 0.03;
  }

  getVAT(amount: number): number {
    return amount * 0.15;
  }

  isRefund(): boolean {
    return this.isFullRefund || this.isFullRefund;
  }
}

export class CardLoad extends BaseItemCategory {
  constructor() {
    super({
      name: "Card Load",
      hasSettlement: true,
      hasAuth: false,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: false,
      code: "0131",
    });
  }

  getCurrency(): Currencies {
    throw new Error("Method not implemented.");
  }
  getFee(amount: number): number {
    throw new Error("Method not implemented.");
  }
}

export class CardUnLoad extends BaseItemCategory {
  constructor() {
    super({
      name: "Card Unload",
      hasSettlement: true,
      hasAuth: false,
      isDirectSettlment: false,
      isPartialRefund: false,
      isFullRefund: false,
      code: "0133",
    });
  }

  getCurrency(): Currencies {
    throw new Error("Method not implemented.");
  }
  getFee(amount: number): number {
    throw new Error("Method not implemented.");
  }
}
