import { Currencies } from "../../transaction_type";
import { BaseItemCategory } from "../base_item_category";

export abstract class BaseLocalPurchase extends BaseItemCategory {
  constructor(args: {
    hasAuth: boolean;
    hasSettlement: boolean;
    isPartialRefund: boolean;
    isFullRefund: boolean;
    isDirectSettlment: boolean;
    code: string;
  }) {
    super({
      name: "Domestic Purchase",
      hasAuth: args.hasAuth,
      hasSettlement: args.hasSettlement,
      isFullRefund: args.isFullRefund,
      isPartialRefund: args.isPartialRefund,
      isDirectSettlment: args.isDirectSettlment,
      code: args.code,
    });
  }

  getCurrency(): Currencies {
    return Currencies.sar;
  }

  getFee(amount: number): number {
    return 0;
  }
}

export class LocalPurchaseAuthSettlment extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0003",
    });
  }
}

export class LocalPurchaseAuth extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: false,
      code: "0007",
    });
  }
}
export class LocalPurchaseReversal extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: true,
      hasSettlement: false,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0003",
    });
  }
}
export class LocalPurchasePartialRefund extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: false,
      isPartialRefund: true,
      code: "0005",
    });
  }
}
export class LocalPurchaseFullRefund extends BaseLocalPurchase {
  constructor() {
    super({
      hasAuth: false,
      hasSettlement: true,
      isDirectSettlment: false,
      isFullRefund: true,
      isPartialRefund: false,
      code: "0005",
    });
  }
}
