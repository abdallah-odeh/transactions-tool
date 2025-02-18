import { LocalPurchaseAuth, LocalPurchaseDirectSettlement, LocalPurchaseAuthSettlment, LocalPurchaseReversal, LocalPurchasePartialRefund, LocalPurchaseFullRefund } from "../models/item_category/domestic/domestic-purchase";
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
  InternationalPurchaseAuth,
  InternationalPurchaseDirectSettlement,
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
  TransactionsTypes,
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
export const transactionsTypes = [
  TransactionsTypes.internationalAuthRev, //✅
  TransactionsTypes.internationalATMWithdrawal, //✅
  TransactionsTypes.internationalATMWithdrawalReversal, //✅
  TransactionsTypes.internationalPurchase, //✅
  TransactionsTypes.internationalPurchasePartialRefund, //✅
  TransactionsTypes.internationalPurchaseFullRefund, 
  TransactionsTypes.domesticAuth, 
  TransactionsTypes.domesticAuthRev,
  TransactionsTypes.domesticATMWithdrawal,
  TransactionsTypes.domesticATMWithdrawalRefund,
  TransactionsTypes.domesticATMWithdrawalDirectSettlement,
  TransactionsTypes.domesticATMWithdrawalReversalDirectSettlement,
  TransactionsTypes.domesticPurchase,
  TransactionsTypes.domesticPurchasePartialRefund,
  TransactionsTypes.domesticPurchaseFullRefund,
];

export const itemCategories = [
  new LocalPurchaseAuth(),
  new LocalPurchaseReversal(),

  new InternationalPurchaseReversal(),

  new LocalATMWithdrawal(),
  new LocalATMWithdrawalRefund(),
  new LocalATMWithdrawalDirectSettlement(),
  new LocalATMWithdrawalReversal(), //direct settlement

  new InternationalATMWithdrawal(),
  new InternationalATMWithdrawalReversal(),

  new LocalPurchaseAuthSettlment(),
  new LocalPurchasePartialRefund(),
  new LocalPurchaseFullRefund(),

  new InternationalPurchase(),
  new InternationalPurchasePartialRefund(),
  new InternationalPurchaseFullRefund(),

  // new InternationalPurchaseAuth(),
  // new InternationalPurchaseDirectSettlement(),

  // new InternationalATMWithdrawalAuth(),
  // new InternationalATMWithdrawalDirectSettlement(),
  // new InternationalATMWithdrawalRefund(),

  // new LocalPurchaseDirectSettlement(),

  // new LocalATMWithdrawalAuth(),
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
