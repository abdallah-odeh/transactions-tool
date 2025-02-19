import {
  LocalPurchaseAuth,
  LocalPurchaseAuthSettlment,
  LocalPurchaseReversal,
  LocalPurchasePartialRefund,
  LocalPurchaseFullRefund,
} from "../models/item_category/domestic/domestic-purchase";
import {
  LocalATMWithdrawalAuth,
  LocalATMWithdrawalDirectSettlement,
  LocalATMWithdrawal,
  LocalATMWithdrawalReversal,
  LocalATMWithdrawalRefund,
} from "../models/item_category/domestic/local-atm-withdrawal";
import {
  InternationalATMWithdrawalAuth,
  InternationalATMWithdrawalDirectSettlement,
  InternationalATMWithdrawal,
  InternationalATMWithdrawalReversal,
  InternationalATMWithdrawalRefund,
} from "../models/item_category/international/international-atm-withdrawal";
import {
  InternationalPurchase,
  InternationalPurchaseReversal,
  InternationalPurchaseFullRefund,
  InternationalPurchasePartialRefund,
} from "../models/item_category/international/international-purchase";
import {
  ClassMessage,
  Currencies,
  ItemCategory,
  TransactionCode,
  TransactionType,
} from "../models/transaction_type";
import { TransactionCategory } from "./types";

export const providers = ["NeoLeap", "APISO"];
export const currencies = [Currencies.sar, Currencies.inr];
export const classMessages = [
  ClassMessage.authorization,
  ClassMessage.financial,
  // ClassMessage.fileUpdate,
  ClassMessage.reversalOrChargeBack,
];

export const transactionTypes = [
  TransactionType.transaction,
  // TransactionType.fee,
  // TransactionType.commission,
  // TransactionType.payment,
  // TransactionType.creditAdjustment,
  // TransactionType.debitAdjustment,
  // TransactionType.creditFee,
  // TransactionType.vat,
];

export const itemCategories = [
  new LocalPurchaseAuth(),
  new LocalPurchaseReversal({ changeTransactionCode: false }),
  new LocalPurchaseReversal({ changeTransactionCode: true }),

  new InternationalPurchaseReversal({ changeTransactionCode: false }),
  new InternationalPurchaseReversal({ changeTransactionCode: true }),

  new LocalATMWithdrawal(),
  new LocalATMWithdrawalRefund({ changeTransactionCode: false }),
  new LocalATMWithdrawalRefund({ changeTransactionCode: true }),
  new LocalATMWithdrawalDirectSettlement(),
  new LocalATMWithdrawalReversal({ changeTransactionCode: false }), //direct settlement
  new LocalATMWithdrawalReversal({ changeTransactionCode: true }), //direct settlement

  new InternationalATMWithdrawal(),
  new InternationalATMWithdrawalReversal({ changeTransactionCode: false }),
  new InternationalATMWithdrawalReversal({ changeTransactionCode: true }),

  new LocalPurchaseAuthSettlment(),
  new LocalPurchasePartialRefund({ changeTransactionCode: false }),
  new LocalPurchasePartialRefund({ changeTransactionCode: true }),
  new LocalPurchaseFullRefund({ changeTransactionCode: false }),
  new LocalPurchaseFullRefund({ changeTransactionCode: true }),

  new InternationalPurchase(),
  new InternationalPurchasePartialRefund({ changeTransactionCode: false }),
  new InternationalPurchasePartialRefund({ changeTransactionCode: true }),
  new InternationalPurchaseFullRefund({ changeTransactionCode: false }),
  new InternationalPurchaseFullRefund({ changeTransactionCode: true }),
];
export const transactionsCode = [
  TransactionCode.purchase,
  TransactionCode.cash,
  TransactionCode.feeCollection,
  TransactionCode.paymentToCardholder,
];
export const categories: TransactionCategory[] = [
  {
    type: ItemCategory.localPurchaseOnUs,
    rev: ItemCategory.localPurchaseOnUsRev,
  },
  { type: ItemCategory.localPurchase, rev: ItemCategory.localPurchaseRev },
  { type: ItemCategory.localRefund, rev: ItemCategory.localRefundRev },
  {
    type: ItemCategory.internationalPurchase,
    rev: ItemCategory.internationalPurchaseRev,
  },
  {
    type: ItemCategory.internationalRefund,
    rev: ItemCategory.internationalRefundRev,
  },
  { type: ItemCategory.localCasiCash, rev: ItemCategory.localCasiCashRev },
  {
    type: ItemCategory.internationalCasiCash,
    rev: ItemCategory.internationalCasiCashRev,
  },
  {
    type: ItemCategory.purchaseChargeBack,
    rev: ItemCategory.purchaseChargeBackRev,
  },
  { type: ItemCategory.cashChargeBack, rev: ItemCategory.cashChargeBackRev },
];

export function generate<T>(arg: T[]): T {
  return arg[Math.floor(Math.random() * arg.length)];
}
