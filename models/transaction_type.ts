export enum TransactionType {
  transaction = 1,
  fee = 2,
  commission = 3,
  interest = 4,
  payment = 5,
  latePaymentFee = 6,
  overLimitFee = 7,
  creditAdjustment = 8,
  debitAdjustment = 9,
  creditFee = 10,
  vat = 1002,
}

export enum ClassMessage {
  authorization = 1,
  financial = 2, // settlement
  // fileUpdate = 3, // rev
  reversalOrChargeBack = 4, // refund
}

export enum TransactionCode {
  purchase = 0,
  cash = 1,
  feeCollection = 19,
  return = 20,
  paymentToCardholder = 26,
  cashIn = 4001,
  cashOut = 4000,
}

export enum ItemCategory {
  localPurchaseOnUs = 1,
  localPurchaseOnUsRev = 2,
  localPurchase = 3,
  localPurchaseRev = 4,
  localRefund = 5,
  localRefundRev = 6,
  internationalPurchase = 7,
  internationalPurchaseRev = 8,
  internationalRefund = 9,
  internationalRefundRev = 10,
  localCasiCash = 11,
  localCasiCashRev = 12,
  internationalCasiCash = 13,
  internationalCasiCashRev = 14,
  purchaseChargeBack = 15,
  purchaseChargeBackRev = 16,
  cashChargeBack = 17,
  cashChargeBackRev = 18,
  localPurchaseRepresentment = 19,
  return = 20,
  deposit = 21,
  adjustment = 22,
  chqDepGuar = 23,
  chqDep = 24,
  paymentToCardholder = 26,
  balanceEnq = 31,
}

export enum Currencies {
  sar = "682",
  inr = "356",
}

export enum TransactionsTypes {
  domesticAuth = "Domestic Auth",
  domesticAuthRev = "Domestic Auth Reversal",
  domesticATMWithdrawal = "Domestic ATM Withdrawal",
  domesticATMWithdrawalRefund = "Domestic ATM Withdrawal Refund",
  domesticATMWithdrawalDirectSettlement = "Domestic ATM Withdrawal (Direct Settlement)",
  domesticATMWithdrawalReversalDirectSettlement = "Domestic ATM Withdrawal Reversal (Direct Settlement)",
  domesticPurchase = "Domestic Purchase",
  domesticPurchasePartialRefund = "Domestic Purchase Partial Refund",
  domesticPurchaseFullRefund = "Domestic Purchase Full Refund",
  internationalAuthRev = "International Auth Reversal",
  internationalATMWithdrawal = "International ATM Withdrawal",
  internationalATMWithdrawalReversal = "International ATM Withdrawal Reversal",
  internationalPurchase = "International Purchase",
  internationalPurchasePartialRefund = "International Purchase Partial Refund",
  internationalPurchaseFullRefund = "International Purchase Full Refund",
}

export class ItemCategoryInfo {
  isInternational: boolean;
  isRev: boolean;

  constructor(isInternational: boolean, isRev: boolean) {
    this.isInternational = isInternational;
    this.isRev = isRev;
  }
}

export const ItemCategoryUtils = {
  getInfo(category: ItemCategory): ItemCategoryInfo {
    switch (category) {
      case ItemCategory.localPurchaseOnUs:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.localPurchaseOnUsRev:
        return new ItemCategoryInfo(false, true);
      case ItemCategory.localPurchase:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.localPurchaseRev:
        return new ItemCategoryInfo(false, true);
      case ItemCategory.localRefund:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.localRefundRev:
        return new ItemCategoryInfo(false, true);
      case ItemCategory.internationalPurchase:
        return new ItemCategoryInfo(true, false);
      case ItemCategory.internationalPurchaseRev:
        return new ItemCategoryInfo(true, true);
      case ItemCategory.internationalRefund:
        return new ItemCategoryInfo(true, false);
      case ItemCategory.internationalRefundRev:
        return new ItemCategoryInfo(true, true);
      case ItemCategory.localCasiCash:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.localCasiCashRev:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.internationalCasiCash:
        return new ItemCategoryInfo(true, false);
      case ItemCategory.internationalCasiCashRev:
        return new ItemCategoryInfo(true, true);
      case ItemCategory.purchaseChargeBack:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.purchaseChargeBackRev:
        return new ItemCategoryInfo(false, true);
      case ItemCategory.cashChargeBack:
        return new ItemCategoryInfo(false, false);
      case ItemCategory.cashChargeBackRev:
        return new ItemCategoryInfo(false, true);
      case ItemCategory.localPurchaseRepresentment:
      case ItemCategory.return:
      case ItemCategory.deposit:
      case ItemCategory.adjustment:
      case ItemCategory.chqDepGuar:
      case ItemCategory.chqDep:
      case ItemCategory.paymentToCardholder:
      case ItemCategory.balanceEnq:
      default:
        return new ItemCategoryInfo(false, false);
    }
  },
};
