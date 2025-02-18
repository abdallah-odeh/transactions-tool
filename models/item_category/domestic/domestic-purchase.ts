import { currencies, generate } from "../../../data/data";
import { Transaction } from "../../transaction";
import {
  ClassMessage,
  Currencies,
  TransactionType,
} from "../../transaction_type";
import {
  BaseItemCategory,
  BaseRefundItemCategory,
  Records,
  TransactionParams,
} from "../base_item_category";

export class LocalPurchase extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isRefund: boolean;
    code: string;
  }) {
    super({
      name: "Local Purchase",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isRefund: args.isRefund,
      code: args.code,
    });
  }

  getRecords(args: TransactionParams): Records {
    const webhooks = [];
    const transactions = [];
    const currency = Currencies.sar;

    let auth: Transaction | undefined;
    let fee = 0.0;
    let vatOnFee = 0.0;

    if (currency != Currencies.sar) {
      fee = args.amount * 0.03;
      vatOnFee = fee * 0.15;
    }

    if (this.hasAuth) {
      auth = new Transaction({
        transactionType: args.transactionType,
        amount: args.amount,
        messageClass: this.getMessageClass(true),
        transactionCode: args.transactionCode,
        card: args.card,
        itemCategory: this,
        currency: currency,
        transactionDate: args.date,
        prepareAsWebhook: true,
      });
      webhooks.push(auth.asWebhook(fee, vatOnFee));
    }

    if (this.hasSettlement) {
      const transaction = new Transaction({
        transactionType: args.transactionType,
        amount: args.amount,
        messageClass: this.getMessageClass(),
        transactionCode: args.transactionCode,
        card: args.card,
        itemCategory: this,
        currency: currency,
        transactionDate: args.date,
      });
      transaction.setChildOf(auth);
      transactions.push(transaction.asRow());

      // add fx
      if (transaction.currency != Currencies.sar) {
        const fees = new Transaction({
          transactionType: TransactionType.fee,
          amount: fee,
          messageClass: this.getMessageClass(),
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: transaction.currency,
          transactionDate: args.date,
        });
        const vat = new Transaction({
          transactionType: TransactionType.vat,
          amount: vatOnFee,
          messageClass: this.getMessageClass(),
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
}

export class LocalPurchaseAuthSettlment extends LocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isRefund: false,
      code: "0003",
    });
  }
}

export class LocalPurchaseDirectSettlement extends LocalPurchase {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isRefund: false,
      code: "0003",
    });
  }
}
export class LocalPurchaseAuth extends LocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isRefund: false,
      code: "0007",
    });
  }
}
export class LocalPurchaseReversal extends LocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isRefund: true,
      code: "0003",
    });
  }
}
export class LocalPurchasePartialRefund extends BaseRefundItemCategory {
  getRecords(args: TransactionParams): Records {
    const webhooks = [];
    const transactions = [];
    const currency = Currencies.sar;

    let auth: Transaction | undefined;
    const fee = 0.0;
    const vatOnFee = 0.0;

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
          messageClass: ClassMessage.authorization,
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

        let amount = args.amount;
        if (classMessage == ClassMessage.reversalOrChargeBack) {
          amount = Math.random() * amount;
        }

        const transaction = new Transaction({
          transactionType: args.transactionType,
          amount: amount,
          messageClass: classMessage,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });
        transaction.setChildOf(auth);
        transactions.push(transaction.asRow());
      }
    }

    return {
      webhooks: webhooks,
      transactions: transactions,
    };
  }
  constructor() {
    super({
      name: "Local Purchase",
      hasAuth: false,
      hasSettlement: true,
      isFull: false,
      code: "0005",
    });
  }
}
export class LocalPurchaseFullRefund extends BaseRefundItemCategory {
  getRecords(args: TransactionParams): Records {
    const webhooks = [];
    const transactions = [];
    const currency = Currencies.sar;

    let auth: Transaction | undefined;
    const fee = 0.0;
    const vatOnFee = 0.0;

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
          messageClass: ClassMessage.authorization,
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
        const amount = args.amount;

        const transaction = new Transaction({
          transactionType: args.transactionType,
          amount: amount,
          messageClass: classMessage,
          transactionCode: args.transactionCode,
          card: args.card,
          itemCategory: this,
          currency: currency,
          transactionDate: args.date,
        });
        transaction.setChildOf(auth);
        transactions.push(transaction.asRow());
      }
    }

    return {
      webhooks: webhooks,
      transactions: transactions,
    };
  }
  constructor() {
    super({
      name: "Local Purchase",
      hasAuth: false,
      hasSettlement: true,
      isFull: true,
      code: "0005",
    });
  }
}
