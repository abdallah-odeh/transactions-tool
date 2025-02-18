import { currencies } from "../../data/data";
import { TransactionCategory } from "../../data/types";
import { Transaction } from "../../models/transaction";
import {
  TransactionType,
  TransactionCode,
  ClassMessage,
  Currencies,
} from "../../models/transaction_type";
import { getRandomItem } from "../generator.helper";
import {
  appendWebhook,
  TransactionsGeneratorHelper,
} from "../transactions-generator.helper";
import { SetllementGenerator } from "./settlement";

export const AuthRevGenerator = {
  generate: async (options: {
    type: TransactionType;
    amount: number;
    code: TransactionCode;
    category: TransactionCategory;
    card: any;
    date: Date;
  }): Promise<string[]> => {
    const currency = getRandomItem(currencies);
    const transaction = new Transaction({
      transactionType: options.type,
      amount: options.amount,
      messageClass: ClassMessage.authorization,
      transactionCode: options.code,
      itemCategory: options.category.type,
      card: options.card,
      transactionDate: options.date,
      currency: currency,
      prepareAsWebhook: true,
    });

    let fees = 0;
    let vatOnFees = 0;
    if (options.code == TransactionCode.cash) {
      fees += options.amount * 0.15;
    }

    if (currency != Currencies.sar) {
      fees += options.amount * 0.03;
    }

    vatOnFees = fees * 0.15;

    await appendWebhook(transaction.asWebhook(fees, vatOnFees));

    transaction.itemCategory = options.category.rev;
    await appendWebhook(transaction.asWebhook(fees, vatOnFees));

    const result = [];

    const generateSettlement = Math.random() < 0.5;

    if (generateSettlement) {
      result.push(
        // generate settlment
        ...(await SetllementGenerator.generate({
          type: options.type,
          amount: options.amount,
          category: options.category.type,
          card: options.card,
          code: options.code,
          settlementDate: options.date,
          authorizationTransactionLogID: transaction.transactionID,
          authIdResponse: transaction.authIdResponse,
          parentTransaction: transaction.transactionID,
          curr: currency,
        })),
        // generate settlment refund
        ...(await SetllementGenerator.generate({
          type: options.type,
          amount: options.amount,
          category: options.category.rev,
          card: options.card,
          code: options.code,
          settlementDate: options.date,
          authorizationTransactionLogID: transaction.transactionID,
          authIdResponse: transaction.authIdResponse,
          parentTransaction: transaction.transactionID,
          curr: currency,
        }))
      );
    }
    return result;
  },
};
