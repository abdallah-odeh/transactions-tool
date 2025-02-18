import { generate, currencies } from "../../../data/data";
import { Transaction } from "../../transaction";
import {
  ClassMessage,
  Currencies,
  TransactionType,
} from "../../transaction_type";
import {
  BaseItemCategory,
  Records,
  TransactionParams,
} from "../base_item_category";

export abstract class BaseInternationalATMWithdrawal extends BaseItemCategory {
  getRecords(args: TransactionParams): Records {
    const webhooks = [];
    const transactions = [];
    const currency = Currencies.inr;

    const amount = args.amount;
    const withdrawalFee = 30;
    const withdrawalFeeVat = withdrawalFee * 0.15;

    const fxFee = amount * 0.03;
    const fxFeeVat = fxFee * 0.15;

    let auth: Transaction | undefined;
    let fee = withdrawalFee + fxFee;
    let vatOnFee = withdrawalFeeVat + fxFeeVat;

    if (this.hasAuth) {
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
      webhooks.push(auth.asWebhook(fee, vatOnFee));

      if (this.isRefund && !this.hasSettlement) {
        const rev = new Transaction({
          transactionType: args.transactionType,
          amount: args.amount,
          messageClass: ClassMessage.reversalOrChargeBack,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
          prepareAsWebhook: true,
        });
        webhooks.push(rev.asWebhook(fee, vatOnFee));
      }
    }

    if (this.hasSettlement) {
      const classes = [ClassMessage.financial];

      if (this.isRefund) {
        classes.push(ClassMessage.reversalOrChargeBack);
      }

      for (var i = 0; i < classes.length; i++) {
        const classMessage = classes[i];

        const transaction = new Transaction({
          transactionType: args.transactionType,
          amount: args.amount,
          messageClass: classMessage,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });
        transaction.setChildOf(auth);
        transactions.push(transaction.asRow());

        // atm withdrawal fee
        if (transaction.currency != Currencies.sar) {
          const fees = new Transaction({
            transactionType: TransactionType.fee,
            amount: withdrawalFee,
            messageClass: classMessage,
            transactionCode: args.transactionCode,
            card: args.card,
            itemCategory: this,
            currency: transaction.currency,
            transactionDate: args.date,
          });
          const vat = new Transaction({
            transactionType: TransactionType.vat,
            amount: withdrawalFeeVat,
            messageClass: classMessage,
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

        // add fx
        const fees = new Transaction({
          transactionType: TransactionType.fee,
          amount: fxFee,
          messageClass: classMessage,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: transaction.currency,
          transactionDate: args.date,
        });
        const vat = new Transaction({
          transactionType: TransactionType.vat,
          amount: fxFeeVat,
          messageClass: classMessage,
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

    return {
      webhooks: webhooks,
      transactions: transactions,
    };
  }
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isRefund: boolean;
    code: string;
  }) {
    super({
      name: "International ATM Withdrawal",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isRefund: args.isRefund,
      code: args.code,
    });
  }
}

export class InternationalATMWithdrawal extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isRefund: false,
      code: "0013",
    });
  }
}

export class InternationalATMWithdrawalDirectSettlement extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isRefund: false,
      code: "0013",
    });
  }
}
export class InternationalATMWithdrawalAuth extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isRefund: false,
      code: "0013",
    });
  }
}
export class InternationalATMWithdrawalReversal extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isRefund: true,
      code: "0014",
    });
  }
}
export class InternationalATMWithdrawalRefund extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isRefund: true,
      code: "0014",
    });
  }
}
