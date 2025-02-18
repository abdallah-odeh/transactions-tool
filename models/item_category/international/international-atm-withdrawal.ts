import { Currencies } from "../../transaction_type";
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
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0014",
    });
  }
}
export class InternationalATMWithdrawalRefund extends BaseInternationalATMWithdrawal {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0014",
    });
  }
}
