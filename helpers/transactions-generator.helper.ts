import { columns } from "../data/file_info";
import { Transaction } from "../models/transaction";
import {
  ClassMessage,
  currencies,
  Currencies,
  ItemCategory,
  ItemCategoryUtils,
  TransactionCode,
  TransactionType,
} from "../models/transaction_type";
import { ConsoleHelper } from "./console-helper";
import { DateFormatterHelper } from "./date-formatter.helper";
import * as fs from "fs";
import * as path from "path";
import { getRandomItem } from "./generator.helper";

type AmountRange = { min: number; max: number };
type DateRange = { start: Date; end: Date };
type TransactionsFile = { name: string; date: Date; transactions: string[] };

export const TransactionsGeneratorHelper = {
  getProvider: async (): Promise<string> => {
    const providers = ["NeoLeap", "APISO"];
    console.log("Please select provider");
    for (var i = 0; i < providers.length; i++) {
      console.log(`${i + 1}. ${providers[i]}`);
    }
    const provider = await ConsoleHelper.read("Enter provider's number: ");
    if (provider.length == 0) {
      console.error("Invalid provider number\n");
      return TransactionsGeneratorHelper.getProvider();
    }

    const index = Number.parseInt(provider) - 1;
    if (index < 0 || index >= providers.length) {
      console.error("Invalid provider number\n");
      return TransactionsGeneratorHelper.getProvider();
    }

    if (index == 1) {
      console.error("APISO is not yet supported!\n");
      return TransactionsGeneratorHelper.getProvider();
    }

    return providers[index];
  },

  getRecordsCount: async (): Promise<number> => {
    console.log("\n=========================");
    const records = await ConsoleHelper.read("How many records do you want?");
    if (records.length == 0) {
      console.error("Invalid records count\n");
      return TransactionsGeneratorHelper.getRecordsCount();
    }

    const recordsCount = Number.parseInt(records);
    if (recordsCount <= 0) {
      console.error("Invalid records count\n");
      return TransactionsGeneratorHelper.getRecordsCount();
    }

    return recordsCount;
  },

  getTypesOfTransactions: async (): Promise<Array<ClassMessage>> => {
    console.log("\n=========================");
    console.log("What transaction types do you want in the file?");
    const transactionTypes = [
      ClassMessage.authorization,
      ClassMessage.financial,
      ClassMessage.fileUpdate,
      ClassMessage.reversalOrChargeBack,
    ];
    for (var i = 0; i < transactionTypes.length; i++) {
      console.log(`${i + 1}. ${ClassMessage[transactionTypes[i]]}`);
    }
    const types = await ConsoleHelper.read(
      "Enter types (separated by commas) i.e. 1,3,4"
    );

    if (types.length == 0) {
      console.error("Invalid types\n");
      return TransactionsGeneratorHelper.getTypesOfTransactions();
    }

    const input = types.split(",").map((e) => Number.parseInt(e) - 1);
    const result = new Array<ClassMessage>();
    for (var i = 0; i < input.length; i++) {
      const inputValue = input[i];

      if (inputValue < 0 || inputValue >= transactionTypes.length) {
        console.error(`Invalid type ${inputValue + 1}\n`);
        const shouldProceed = await ConsoleHelper.read(
          "Ignore it and proceed [y] or try again [n]?"
        );
        switch (shouldProceed.toLowerCase()) {
          case "y":
          case "yes":
            continue;
          default:
            return TransactionsGeneratorHelper.getTypesOfTransactions();
        }
      }
      result.push(transactionTypes[inputValue]);
    }

    return result;
  },

  getAmountRange: async (): Promise<AmountRange> => {
    console.log("\n=========================");
    const types = await ConsoleHelper.read(
      "Enter transactions amount range i.e. 0.5 - 120.5"
    );
    if (types.length == 0) {
      console.error("Invalid range\n");
      return TransactionsGeneratorHelper.getAmountRange();
    }

    const range = types.trim().replace(" ", "").split("-");
    if (range.length != 2) {
      console.error("Invalid range\n");
      return TransactionsGeneratorHelper.getAmountRange();
    }

    range.sort();

    return {
      min: Number.parseFloat(range[0]),
      max: Number.parseFloat(range[1]),
    };
  },

  getDateRange: async (): Promise<DateRange> => {
    console.log("\n=========================");
    const today = new Date();

    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const types = await ConsoleHelper.read(
      `Enter transactions date range in format dd/MM/yyyy i.e. ${DateFormatterHelper.format(
        startDate
      )} - ${DateFormatterHelper.format(endDate)}`
    );
    if (types.length == 0) {
      console.error("Invalid range\n");
      return TransactionsGeneratorHelper.getDateRange();
    }

    const range = types.trim().replace(" ", "").split("-");
    if (range.length != 2) {
      console.error("Invalid range\n");
      return TransactionsGeneratorHelper.getDateRange();
    }

    range.sort();

    const start = DateFormatterHelper.tryParse(range[0]);
    if (start == null) {
      console.error("Invalid start date\n");
      return TransactionsGeneratorHelper.getDateRange();
    }

    const end = DateFormatterHelper.tryParse(range[1]);
    if (end == null) {
      console.error("Invalid end date\n");
      return TransactionsGeneratorHelper.getDateRange();
    }

    return {
      start: start,
      end: end,
    };
  },

  getCards: async (): Promise<any[]> => {
    console.log("\n=========================");
    console.log(`Select cards from below to apply transactions to`);

    const absolutePath = path.resolve("data/cards.json"); // Get absolute path
    const data = fs.readFileSync(absolutePath, "utf-8"); // Read file as string
    const tenants = JSON.parse(data);

    let index = 1;
    const cardsOptions = <any>[];
    for (var i = 0; i < tenants.length; i++) {
      console.log(`Cards for tenant "${tenants[i].name}"`);
      const cards = tenants[i].cards;
      for (var j = 0; j < cards.length; j++) {
        cardsOptions.push(cards[j]);
        const vpan = cards[j].vpan;
        const accountNumber = cards[j].account_number;
        if (vpan?.length == 0)
          console.log(`\t${index++}. AccountNo:\t ${accountNumber}`);
        else console.log(`\t${index++}. VPAN:\t ${vpan}`);
      }
    }

    const types = await ConsoleHelper.read(
      "Enter cards index (separated by commas) i.e. 1,3,4"
    );

    if (types.length == 0) {
      console.error("Invalid index\n");
      return TransactionsGeneratorHelper.getCards();
    }

    const input = types.split(",").map((e) => Number.parseInt(e) - 1);
    const result = <any>[];
    for (var i = 0; i < input.length; i++) {
      const inputValue = input[i];

      if (inputValue < 0 || inputValue >= cardsOptions.length) {
        console.error(`Invalid index ${inputValue + 1}\n`);
        const shouldProceed = await ConsoleHelper.read(
          "Ignore it and proceed [y] or try again [n]?"
        );
        switch (shouldProceed.toLowerCase()) {
          case "y":
          case "yes":
            continue;
          default:
            return TransactionsGeneratorHelper.getCards();
        }
      }
      result.push(cardsOptions[inputValue]);
    }

    return result;
  },

  generate: async (
    provider: string,
    records: number,
    types: ClassMessage[],
    amount: AmountRange,
    date: DateRange,
    cards: any[]
  ): Promise<void> => {
    resetWebhooks();
    console.log("\n=========================");
    const dirPath = _getFilePath("");

    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // Delete file
      }
    });

    const files: TransactionsFile[] = [];

    for (var i = 0; i < records; i++) {
      const messageClass = types[Math.floor(Math.random() * types.length)];
      const transactionAmount =
        Math.random() * (amount.max - amount.min + 1) + amount.min;
      const card = cards[Math.floor(Math.random() * cards.length)];
      const transactionDate = new Date(
        Math.floor(
          Math.random() * (date.end.getTime() - date.start.getTime() + 1)
        ) + date.start.getTime()
      );

      const formattedDate = DateFormatterHelper.format(
        transactionDate,
        "yyyyMMdd"
      );
      const fileName = `TransactionsSync_${formattedDate}.csv`;
      let file = files.find((e) => e.name == fileName);
      if (file == undefined) {
        files.push({ name: fileName, date: transactionDate, transactions: [] });
        file = files.find((e) => e.name == fileName);
      }

      const transactionsTypes = [
        TransactionType.transaction,
        // TransactionType.fee,
        // TransactionType.commission,
        // TransactionType.payment,
        // TransactionType.creditAdjustment,
        // TransactionType.debitAdjustment,
        // TransactionType.creditFee,
        // TransactionType.vat,
      ];

      const transactionsCode = [
        TransactionCode.purchase,
        TransactionCode.cash,
        TransactionCode.feeCollection,
        TransactionCode.paymentToCardholder,
      ];
      const revCategories = [
        ItemCategory.localPurchaseOnUsRev,
        ItemCategory.localPurchaseRev,
        ItemCategory.localRefundRev,
        ItemCategory.internationalPurchaseRev,
        ItemCategory.internationalRefundRev,
        ItemCategory.localCasiCashRev,
        ItemCategory.internationalCasiCashRev,
        ItemCategory.purchaseChargeBackRev,
        ItemCategory.cashChargeBackRev,
      ];
      const categories = [
        ItemCategory.localPurchaseOnUs,
        ItemCategory.localPurchase,
        ItemCategory.localRefund,
        ItemCategory.internationalPurchase,
        ItemCategory.internationalRefund,
        ItemCategory.localCasiCash,
        ItemCategory.internationalCasiCash,
        ItemCategory.purchaseChargeBack,
        ItemCategory.cashChargeBack,
      ];

      switch (messageClass) {
        case ClassMessage.authorization:
          file!.transactions.push(
            ...(await _generateAuthTransaction(
              transactionsTypes[
                Math.floor(Math.random() * transactionsTypes.length)
              ],
              transactionAmount,
              transactionsCode[
                Math.floor(Math.random() * transactionsCode.length)
              ],
              categories[Math.floor(Math.random() * categories.length)],
              card
            ))
          );
          break;
        case ClassMessage.financial:
          file!.transactions.push(
            ...(await _generateSettlementTransaction(
              transactionsTypes[
                Math.floor(Math.random() * transactionsTypes.length)
              ],
              transactionAmount,
              transactionsCode[
                Math.floor(Math.random() * transactionsCode.length)
              ],
              categories[Math.floor(Math.random() * categories.length)],
              card,
              transactionDate
            ))
          );
          break;
        case ClassMessage.fileUpdate:
          break;
        case ClassMessage.reversalOrChargeBack:
          file!.transactions.push(
            ...(await _generateAuthRevTransaction(
              transactionsTypes[
                Math.floor(Math.random() * transactionsTypes.length)
              ],
              transactionAmount,
              transactionsCode[
                Math.floor(Math.random() * transactionsCode.length)
              ],
              revCategories[Math.floor(Math.random() * revCategories.length)],
              card,
              transactionDate
            ))
          );
      }
    }

    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.transactions.length == 0) continue;
      const header = columns.map((e) => e[0]).join(",");
      const transactions = [header];
      for (var j = 0; j < file.transactions.length; j++) {
        transactions.push(...file.transactions[j].split("\n"));
      }
      const footer = [
        "F",
        transactions.length - 1,
        ...Array(columns.length - 2),
      ].join(",");
      transactions.push(footer);

      fs.writeFileSync(_getFilePath(file.name), transactions.join("\n"));

      console.log(
        `✅ CSV file generated successfully! ✅ file path: ${file.name}`
      );
    }
    console.log("=========================\n");

    const reGenerated = await ConsoleHelper.read(
      "Would you like to regenerate the result [y] or restart the program? [n]"
    );

    switch (reGenerated.toLowerCase()) {
      case "yes":
      case "y":
        return TransactionsGeneratorHelper.generate(
          provider,
          records,
          types,
          amount,
          date,
          cards
        );
    }

    return;
    console.log(`Generating .csv file with`);
    console.log(`\t Provider: ${provider}`);
    console.log(`\t Number of records: ${records}`);
    console.log(`\t Types: ${types}`);
    console.log(`\t Amount: ${amount.min} - ${amount.max}`);
    console.log(
      `\t Date: ${DateFormatterHelper.format(
        date.start
      )} - ${DateFormatterHelper.format(date.end)}`
    );
    console.log(`\t Cards:`);
    for (var i = 0; i < cards.length; i++) {
      const vpan = cards[i].vpan;
      const accountNumber = cards[i].account_number;
      if (vpan?.length == 0) console.log(`\t\t AccountNo:\t ${accountNumber}`);
      else console.log(`\t\t VPAN:\t ${vpan}`);
    }
  },
};

const _generateRows = async (
  TRANSACTION_TYPE: TransactionType,
  category: ItemCategory,
  AMOUNT: number,
  CARD: any,
  MESSAGE_CLASS: ClassMessage,
  TRANSACTION_CODE: TransactionCode,
  options?: {
    SETTLEMENT_DATE?: Date;
    REFERENCE?: string;
    authorizationTransactionLogID?: string;
    authIdResponse?: string;
    parentTransaction?: string;
    curr?: Currencies;
  }
): Promise<string[]> => {
  const currency = options?.curr ?? getRandomItem(currencies);
  const transaction = new Transaction({
    transactionType: TRANSACTION_TYPE,
    amount: AMOUNT,
    messageClass: MESSAGE_CLASS,
    transactionCode: TRANSACTION_CODE,
    itemCategory: category,
    card: CARD,
    transactionDate: options?.SETTLEMENT_DATE,
    currency: currency,
  });

  transaction.authorizationTransactionLogID =
    options?.authorizationTransactionLogID;
  transaction.reference = options?.REFERENCE;
  transaction.settlementDate = options?.SETTLEMENT_DATE;
  transaction.handleTransactionID(options?.parentTransaction);

  switch (TRANSACTION_TYPE) {
    case TransactionType.transaction:
      const result = [transaction.asRow()];

      if (TRANSACTION_CODE == TransactionCode.cash) {
        result.push(
          ...(await _generateRows(
            TransactionType.fee,
            category,
            AMOUNT * 0.15,
            CARD,
            MESSAGE_CLASS,
            TRANSACTION_CODE,
            {
              SETTLEMENT_DATE: options?.SETTLEMENT_DATE,
              REFERENCE: transaction.transactionID,
              parentTransaction: options?.parentTransaction,
              authIdResponse: options?.authIdResponse,
              authorizationTransactionLogID:
                options?.authorizationTransactionLogID,
              curr: currency,
            }
          ))
        );
      }

      // international transaction needs to add fee inclusive tax
      if (currency != Currencies.sar) {
        result.push(
          ...(await _generateRows(
            TransactionType.fee,
            AMOUNT * 0.03,
            category,
            CARD,
            MESSAGE_CLASS,
            TRANSACTION_CODE,
            {
              SETTLEMENT_DATE: options?.SETTLEMENT_DATE,
              REFERENCE: transaction.transactionID,
              parentTransaction: options?.parentTransaction,
              authIdResponse: options?.authIdResponse,
              authorizationTransactionLogID:
                options?.authorizationTransactionLogID,
              curr: currency,
            }
          ))
        );
      }
      return result;
    case TransactionType.fee:
    case TransactionType.commission:
      return [
        transaction.asRow(),
        // Add VAT record
        ...(await _generateRows(
          TransactionType.vat,
          AMOUNT * 0.15,
          category,
          CARD,
          MESSAGE_CLASS,
          TRANSACTION_CODE,
          {
            SETTLEMENT_DATE: options?.SETTLEMENT_DATE,
            REFERENCE: transaction.transactionID,
            curr: currency,
          }
        )),
      ];
    case TransactionType.payment:
    case TransactionType.creditAdjustment:
    case TransactionType.debitAdjustment:
    case TransactionType.creditFee:
    case TransactionType.vat:
  }
  return [transaction.asRow()];
};

const _generateAuthTransaction = async (
  type: TransactionType,
  amount: number,
  code: TransactionCode,
  category: ItemCategory,
  card: any,
  curr?: Currencies,
  options?: {
    transaction?: Transaction;
  }
): Promise<string[]> => {
  const currency = curr ?? getRandomItem(currencies);
  const auth =
    options?.transaction ??
    new Transaction({
      transactionType: type,
      amount: amount,
      messageClass: ClassMessage.authorization,
      transactionCode: code,
      itemCategory: category,
      card: card,
      currency: currency,
    });

  let fees = 0;
  let vatOnFees = 0;

  if (code == TransactionCode.cash) {
    if (ItemCategoryUtils.getInfo(category).isInternational) {
      fees += 30;
    } else {
      fees += 10;
    }
  }

  if (currency != Currencies.sar) {
    fees += amount * 0.03;
  }

  vatOnFees = fees * 0.15;

  await appendWebhook(auth.asWebhook(fees, vatOnFees));
  return [];
};

const _generateAuthRevTransaction = async (
  type: TransactionType,
  amount: number,
  code: TransactionCode,
  category: ItemCategory,
  card: any,
  date: Date
): Promise<string[]> => {
  const currency = getRandomItem(currencies);
  const transaction = new Transaction({
    transactionType: type,
    amount: amount,
    messageClass: ClassMessage.authorization,
    transactionCode: code,
    itemCategory: category,
    card: card,
    transactionDate: date,
    currency: currency,
  });

  let fees = 0;
  let vatOnFees = 0;
  if (code == TransactionCode.cash) {
    fees += amount * 0.15;
  }

  if (currency != Currencies.sar) {
    fees += amount * 0.03;
  }

  vatOnFees = fees * 0.15;

  await appendWebhook(transaction.asWebhook(fees, vatOnFees));
  const result = [];

  // generate a settlment
  if (Math.random() < 0.5) {
    result.push(
      ...(await _generateRows(
        type,
        amount,
        category,
        card,
        ClassMessage.financial,
        code,
        {
          SETTLEMENT_DATE: date,
          authorizationTransactionLogID: transaction.transactionID,
          authIdResponse: transaction.authIdResponse,
          parentTransaction: transaction.transactionID,
          curr: currency,
        }
      ))
    );
  }
  result.push(
    ...(await _generateRows(
      type,
      category,
      amount,
      card,
      ClassMessage.reversalOrChargeBack,
      code,
      {
        SETTLEMENT_DATE: date,
        authorizationTransactionLogID: transaction.transactionID,
        authIdResponse: transaction.authIdResponse,
        parentTransaction: transaction.transactionID,
        curr: currency,
      }
    ))
  );
  return result;
};

const _generateSettlementTransaction = async (
  type: TransactionType,
  amount: number,
  code: TransactionCode,
  category: ItemCategory,
  card: any,
  date: Date
): Promise<string[]> => {
  const currency = getRandomItem(currencies);
  const transaction = new Transaction({
    transactionType: type,
    amount: amount,
    messageClass: ClassMessage.authorization,
    transactionCode: code,
    card: card,
    itemCategory: category,
    transactionDate: date,
  });
  if (Math.random() > 0.5)
    await _generateAuthTransaction(
      type,
      amount,
      code,
      category,
      card,
      currency,
      {
        transaction: transaction,
      }
    );
  return _generateRows(
    type,
    category,
    amount,
    card,
    ClassMessage.financial,
    code,
    {
      SETTLEMENT_DATE: date,
      authorizationTransactionLogID: transaction.transactionID,
      authIdResponse: transaction.authIdResponse,
      parentTransaction: transaction.transactionID,
      curr: currency,
    }
  );
};

const appendWebhook = async (newData: any) => {
  const filePath = _getFilePath("webhooks.json");
  if (!fs.existsSync(filePath)) {
  } else {
    // If file doesn't exist, create it and write the header
    fs.writeFileSync(filePath, "[]");
  }
  try {
    const existingData = [];

    const fsPromis = fs.promises;

    if (
      await fsPromis
        .access(filePath)
        .then(() => true)
        .catch(() => false)
    ) {
      const fileContent = await fsPromis.readFile(filePath, "utf-8");
      existingData.push(...(fileContent ? JSON.parse(fileContent) : []));
    }

    existingData.push(newData);
    await fsPromis.writeFile(filePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error(error);
  }
};

const resetWebhooks = () => {
  const filePath = _getFilePath("webhooks.json");
  fs.writeFileSync(filePath, "");
};

const _getFilePath = (fileName: string): string => {
  const root = "generated";
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  if (fileName.includes(root)) return fileName;
  return `generated/${fileName}`;
};
