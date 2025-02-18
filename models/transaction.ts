import { DateFormatterHelper } from "../helpers/date-formatter.helper";
import { BaseItemCategory } from "./item_category/base_item_category";
import {
  ClassMessage,
  ItemCategory,
  TransactionCode,
  TransactionType,
  Currencies,
  ItemCategoryUtils,
} from "./transaction_type";

export class Transaction {
  transactionID: string;
  transactionType: TransactionType;
  amount: number;
  settlementDate: Date | undefined;
  card: any;
  messageClass: ClassMessage;
  transactionCode: TransactionCode;
  authorizationTransactionLogID: string | undefined;
  reference: string | undefined;
  authIdResponse: string | undefined;
  rrn: string;
  date: string;
  time: string;
  transactionDate?: Date;
  itemCategory: BaseItemCategory;
  currency: Currencies;

  constructor(options: {
    transactionType: TransactionType;
    amount: number;
    messageClass: ClassMessage;
    transactionCode: TransactionCode;
    card: any;
    itemCategory: BaseItemCategory;
    transactionDate?: Date;
    currency?: Currencies;
    prepareAsWebhook?: boolean;
  }) {
    const now = process.hrtime.bigint().toString();
    this.transactionType = options.transactionType;
    this.amount = options.amount;
    this.messageClass = options.messageClass;
    this.transactionCode = options.transactionCode;
    this.card = options.card;
    this.rrn = now;
    this.itemCategory = options.itemCategory;
    if (options?.prepareAsWebhook == true) {
      this.transactionID = `15${now.substring(now.length - 4, now.length)}`;
    } else {
      this.transactionID = `12${now.substring(now.length - 4, now.length)}`;
    }
    this.date = DateFormatterHelper.format(
      options.transactionDate ?? new Date(),
      "yyyyMMdd"
    );
    this.time = DateFormatterHelper.format(
      options.transactionDate ?? new Date(),
      "hhmmss"
    );
    this.currency = options.currency ?? Currencies.sar;
  }

  handleTransactionID(transactionId?: string) {
    // console.log(`=========================\nhandling ${transactionId}`);
    // if (transactionId) console.log("if (transactionId)");
    // else console.log("else (transactionId)");

    // if (transactionId?.length) console.log("if (transactionId?.length)");
    // else console.log("else (transactionId?.length)");

    // if (transactionId?.length == 0) console.log("if (transactionId?.length == 0)");
    // else console.log("else (transactionId?.length == 0)");

    // console.log(`handling ${transactionId}\n=========================`);
    if (transactionId == undefined || transactionId.length == 0) return;
    switch (transactionId!.toUpperCase().substring(0, 1)) {
      case "T":
        this.reference = transactionId;
        break;
      case "C":
        this.transactionID = transactionId!;
        break;
    }
  }

  setChildOf(transaction?: Transaction) {
    if (transaction == null) return;
    this.authorizationTransactionLogID = transaction.transactionID;
    this.authIdResponse = transaction.authIdResponse;
    this.handleTransactionID(transaction.transactionID);
  }

  asRow(): string {
    return [
      "R", // <- Record type
      this.transactionID,
      this.transactionType,
      this.currency, // <- Transaction currency
      this.amount?.toFixed(2), // <- Transaction amount
      Currencies.sar, // <- Billing currency
      this.amount?.toFixed(2), // <- Billing amount
      DateFormatterHelper.tryFormat(this.settlementDate, "yyyyMMdd") ?? "", // <- Settlement date
      this.messageClass == ClassMessage.financial
        ? this.amount?.toFixed(2)
        : "", // <- Settlement amount
      this.messageClass == ClassMessage.financial ? Currencies.sar : "", //SAR // <- Settlement currency
      this.date, // <- System date
      this.card.account_number ?? "", // <- Account number
      this.card.account_id ?? "", // <- Account id
      this.card.vpan ?? "", // <- VPAN
      this.card.masked_pan ?? "", // <- Masked VPAN
      this.date, // <- Date transmit
      this.time, // <- Time transmit
      this.date, // <- Date local
      this.time, // <- Time local
      this.messageClass, // <- Message class
      "2", // <- Message function
      "0", // <- Transaction source
      "00200", // <- Function code
      this.transactionCode, // <- Transaction Code
      "", // <- Acquirer Financial Entity
      "", // <- Transaction Reference Number
      "", // <- ARN
      "", // <- Token Requestor ID
      this.authorizationTransactionLogID ?? "00000000000000000000",
      this.itemCategory.code, // <- Item Category
      this.rrn, // <- RRN
      "0", // <- STAN
      "Generated transaction", // <- Description
      "CARD ACCEPTOR~ATM Riyadh~CITY NAME~             682", // <- Card Acceptor Location
      "0", // <- MCC
      "", // <- Card Acceptor ID
      "", // <- Terminal Code
      "", // <- Acquirer ID
      "", // <- Acquirer Country
      "", // <- Card Data Input Capability
      "", // <- Cardholder Authentication Availability
      "", // <- Card Capture Capability
      "", // <- Operating Environment
      "", // <- Cardholder Present Indicator
      "", // <- Card Present Indicator
      "", // <- Card Data Input Mode
      "", // <- Cardholder Authentication Method
      "", // <- Cardholder authorization Entity
      "", // <- Pin Capture Capability
      this.reference ?? "", // <- Reference
      "0", // <- Original Transaction Id
      "", // <- Original Transaction Reference
      "0", // <- Balance Before
      "", // <- Surplus Before HERE
      "0", // <- Balance After
      "0", // <- Surplus After HERE
      this.messageClass == ClassMessage.reversalOrChargeBack ? "C" : "D", // <- Credit Debit (C | D)
      "0", // <- Application Sequence
    ].join(",");
  }

  asWebhook(fees: number, vatOnFees: number): any {
    if (this.authIdResponse == undefined) {
      this.authIdResponse = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    }
    return {
      InstId: "9000",
      cardId: this.card?.vpan ?? "",
      transactionId: `T${this.transactionID}`,
      parentTransactionId: this.reference,
      cardMaskedNumber: this.card?.masked_pan ?? "",
      accountNumber: this.card?.account_number,
      Date: this.date,
      Time: this.time,
      otb: "439.73",
      transactionCode: this.transactionCode.toString(),
      messageClass: this.messageClass.toString(),
      RRN: this.rrn,
      stan: "4341",
      cardAcceptorLocation: {
        merchantId: " ",
        merchantName: "CARD ACCEPTOR",
        merchantCountry: Currencies.sar,
        merchantCity: "CITY NAME",
        mcc: "6011",
      },
      transactionAmount: this.amount.toFixed(2),
      transactionCurrency: this.currency ?? Currencies.sar,
      billingAmount: this.amount.toFixed(2),
      billingCurrency: Currencies.sar,
      settlementAmount: "0.00",
      settlementCurrency: Currencies.sar,
      fees: fees.toFixed(2),
      vatOnFees: vatOnFees.toFixed(2),
      posEntryMode: "9",
      authIdResponse: this.authIdResponse,
      POSCDIM: "9",
    };
  }
}
