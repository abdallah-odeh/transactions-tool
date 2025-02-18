import { Currencies } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseInternationalPurchase extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isDirectSettlment: boolean;
    isFullRefund: boolean;
    isPartialRefund: boolean;
    code: string;
  }) {
    super({
      name: "International Purchase",
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
    return 0;
  }
}

export class InternationalPurchase extends BaseInternationalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0007",
    });
  }
}

export class InternationalPurchaseReversal extends BaseInternationalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0008",
    });
  }
}
export class InternationalPurchasePartialRefund extends BaseInternationalPurchase {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: true,
      code: "0009",
    });
  }
}
export class InternationalPurchaseFullRefund extends BaseInternationalPurchase {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0009",
    });
  }
}
