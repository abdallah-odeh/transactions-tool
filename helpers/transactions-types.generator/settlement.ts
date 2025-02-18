import { categories, currencies } from "../../data/data";
import { Transaction } from "../../models/transaction";
import {
  TransactionType,
  ItemCategory,
  ClassMessage,
  TransactionCode,
  Currencies,
} from "../../models/transaction_type";
import { getRandomItem } from "../generator.helper";

export const SetllementGenerator = {
  generate: async (options: {
    type: TransactionType;
    category: ItemCategory;
    amount: number;
    card: any;
    code: TransactionCode;
    settlementDate?: Date;
    reference?: string;
    authorizationTransactionLogID?: string;
    authIdResponse?: string;
    parentTransaction?: string;
    curr?: Currencies;
  }): Promise<string[]> => {
    const currency = options?.curr ?? getRandomItem(currencies);
    const transaction = new Transaction({
      transactionType: options.type,
      amount: options.amount,
      messageClass: ClassMessage.financial,
      transactionCode: options.code,
      itemCategory: options.category,
      card: options.card,
      transactionDate: options.settlementDate,
      currency: currency,
    });

    transaction.authorizationTransactionLogID =
      options?.authorizationTransactionLogID;
    transaction.reference = options?.reference;
    transaction.settlementDate = options?.settlementDate;
    transaction.handleTransactionID(options?.parentTransaction);

    switch (options.type) {
      case TransactionType.transaction:
        const result = [transaction.asRow()];

        if (options.code == TransactionCode.cash) {
          result.push(
            ...(await SetllementGenerator.generate({
              type: TransactionType.fee,
              category: options.category,
              amount: options.amount * 0.15,
              card: options.card,
              code: options.code,
              settlementDate: options.settlementDate,
              reference: transaction.transactionID,
              authorizationTransactionLogID:
                options?.authorizationTransactionLogID,
              authIdResponse: options?.authIdResponse,
              parentTransaction: options?.parentTransaction,
              curr: options.curr,
            }))
          );
        }

        // international transaction needs to add fee inclusive tax
        if (currency != Currencies.sar) {
          result.push(
            ...(await SetllementGenerator.generate({
              type: TransactionType.fee,
              category: options.category,
              amount: options.amount * 0.03,
              card: options.card,
              code: options.code,
              settlementDate: options.settlementDate,
              reference: transaction.transactionID,
              authorizationTransactionLogID:
                options?.authorizationTransactionLogID,
              authIdResponse: options?.authIdResponse,
              parentTransaction: options?.parentTransaction,
              curr: options.curr,
            }))
          );
        }
        return result;
      case TransactionType.fee:
      case TransactionType.commission:
        return [
          transaction.asRow(),
          // Add VAT record
          ...(await SetllementGenerator.generate({
            type: TransactionType.vat,
            category: options.category,
            amount: options.amount * 0.15,
            card: options.card,
            code: options.code,
            settlementDate: options.settlementDate,
            reference: transaction.transactionID,
            curr: options.curr,
          })),
        ];
      case TransactionType.payment:
      case TransactionType.creditAdjustment:
      case TransactionType.debitAdjustment:
      case TransactionType.creditFee:
      case TransactionType.vat:
    }
    return [transaction.asRow()];
  },
};
