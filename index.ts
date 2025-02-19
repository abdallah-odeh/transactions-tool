import { ConsoleHelper } from "./helpers/console-helper";
import { CSVParser } from "./helpers/csv-parser";
import * as fs from "fs";
import { TransactionsGeneratorHelper } from "./helpers/transactions-generator.helper";
import path from "path";
import { ProviderGenerator } from "./helpers/transactions-generation/provider-generator";
import { RecordsCountGenerator } from "./helpers/transactions-generation/records-count-generator";
import { TransactionsCategoriesGenerator } from "./helpers/transactions-generation/transaction-type-generator";
import { AmountGenerator } from "./helpers/transactions-generation/amount-generator";
import { DatesGenerator } from "./helpers/transactions-generation/date-generator";
import { CardsGenerator } from "./helpers/transactions-generation/cards-generator";
import { FilesHelper } from "./helpers/files.helper";
import { DateFormatterHelper } from "./helpers/date-formatter.helper";
import { Transaction } from "./models/transaction";
import {
  ClassMessage,
  TransactionCode,
  TransactionsTypes,
  TransactionType,
} from "./models/transaction_type";
import {
  CardLoad,
  CardUnLoad,
} from "./models/item_category/base_item_category";
import { currencies } from "./data/data";
import { columns } from "./data/file_info";

const startProgram = async () => {
  do {
    console.info(
      "What would you like to do? press (Q) anytime to terminate the app"
    );
    console.info("1. Convert .csv file to .txt file");
    console.info("2. Convert .txt file to .csv file");
    console.info("3. Generate transactions to .csv file");
    console.info("4. Hit cached webhooks inside generated/webhooks.json");
    console.info("5. Convert generated .csv files to .txt");
    console.info("6. Convert CardLoad/UnLoad webhooks into transactions");
    const program = await ConsoleHelper.read("Enter process number: ");
    console.log("\n=========================");

    switch (program.trim()) {
      case "1":
        await convertCSVFile();
        break;
      case "2":
        await convertFixedLengthFile();
        break;
      case "3":
        await generateTransactions();
        break;
      case "4":
        await hitWebhooks();
        break;
      case "5":
        await convertGeneratedFileToTxt();
        break;
      case "6":
        await convertWebhooksToTransactions();
        break;
      default:
        console.error("Invalid choice. Please try again");
    }
  } while (true);
};

startProgram();

const convertCSVFile = async (filePath?: string) => {
  const csv = filePath ?? (await ConsoleHelper.read("Enter .csv file path: "));
  if (csv.length == 0) return convertCSVFile();
  if (!csv.endsWith("csv")) {
    console.error("File must be .csv");
    return convertCSVFile();
  }

  const fileName = path.basename(csv);
  const outputFileName = csv
    .replace(fileName, fileName.replace("csv", "txt"))
    .replace("csv", "fixed_length");

  CSVParser.convertCsvToFixedLength(csv.trim(), outputFileName.trim());
};

const convertFixedLengthFile = async () => {
  const txt = await ConsoleHelper.read("Enter .txt file path: ");
  if (txt.length == 0) return convertFixedLengthFile();
  if (!txt.endsWith("txt")) {
    console.error("File must be .csv");
    return convertFixedLengthFile();
  }

  const fileName = path.basename(txt);
  const outputFileName = txt
    .replace(fileName, fileName.replace("txt", "csv"))
    .replace("fixed_length", "csv");

  CSVParser.convertFixedLengthToCSV(txt.trim(), outputFileName.trim());
};

const generateTransactions = async () => {
  const provider = await ProviderGenerator.generate();
  const records = await RecordsCountGenerator.generate();
  // const classes = await ClassMessageGenerator.generate();
  const categories = await TransactionsCategoriesGenerator.generate();
  const amountRange = await AmountGenerator.generate();
  const dateRange = await DatesGenerator.generate();
  const cards = await CardsGenerator.generate();

  await TransactionsGeneratorHelper.generate({
    provider: provider,
    records: records,
    // types: classes,
    categories: categories,
    amount: amountRange,
    date: dateRange,
    cards: cards,
  });
};

const hitWebhooks = async () => {
  const filePath = "webhooks.json";
  if (!FilesHelper.exists(filePath)) {
    console.error("Webhooks file not found, aborting ..");
    console.log("=========================\n");
    return;
  }

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  try {
    const fileContent = await FilesHelper.read(filePath);
    const webhooks = JSON.parse(fileContent);

    console.info(`There are ${webhooks.length} webhooks to hit`);

    for (var i = 0; i < webhooks.length; i++) {
      const raw = JSON.stringify(webhooks[i]);

      await fetch(
        "https://api-expense.uat.sanadcash.com/api/webhooks/7002/card-transaction-notification",
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        }
      )
        // .then((response) => response.text())
        .then((result) =>
          console.info(
            `Webhook ${i} ${
              result.ok ? "✅" : `❌ ${result.status} | ${result.statusText}`
            }`
          )
        )
        .catch((error) => console.error(error));
    }
  } catch (e) {
    console.error(`Could not hit webhooks! ${e}`);
  }

  console.log("=========================\n");
};

const convertGeneratedFileToTxt = async () => {
  const dirPath = "generated/";
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (!fs.lstatSync(filePath).isFile()) return;
    if (!filePath.endsWith("csv")) return;
    convertCSVFile(filePath);
  });
};

const convertWebhooksToTransactions = async () => {
  const filePath = "webhooks.json";
  await FilesHelper.write(filePath, "[]");
  console.log(
    `Please enter the webhooks you want to convert into the file: ${filePath}`
  );
  await ConsoleHelper.read("Type anything when you are done..");
  const content = await FilesHelper.read(filePath);
  const webhooks = JSON.parse(content);
  const date = new Date();

  const formattedDate = DateFormatterHelper.format(date, "yyyyMMdd");
  const fileName = `TransactionsSync_${formattedDate}.csv`;

  const header = columns.map((e) => e[0]).join(",");
  const transactions = [header];

  const categories = [new CardLoad(), new CardUnLoad()];
  const transactionsCodes = [TransactionCode.cashIn, TransactionCode.cashOut];

  for (var i = 0; i < webhooks.length; i++) {
    const webhook = webhooks[i];
    const now = process.hrtime.bigint().toString();

    let transactionType = "1";
    let description = "Converted transaction";
    if (webhook.transactionCode == "4000") {
      transactionType = "1";
      description = "Cash in";
    } else if (webhook.transactionCode == "4001") {
      transactionType = "1";
      description = "Cash in";
    } else if (webhook.transactionCode == "0") {
      transactionType = "0";
      description = "Converted purchase";
    } else if (webhook.transactionCode == "19") {
      transactionType = "0";
      description = "Converted fee collection";
    } else if (webhook.transactionCode == "26") {
      transactionType = "1";
      description = "Converted payment to card holder";
    }

    const row = [
      "R", // <- Record type
      webhook.transactionId,
      transactionType,
      webhook.currency, // <- Transaction currency
      webhook.amount, // <- Transaction amount
      webhook.currency, // <- Billing currency
      webhook.amount, // <- Billing amount
      webhook.date, // <- Settlement date
      webhook.amount, // <- Settlement amount
      webhook.currency, //SAR // <- Settlement currency
      webhook.date, // <- System date
      webhook.accountNumber, // <- Account number
      webhook.accountId, // <- Account id
      webhook.cardId ?? "", // <- VPAN
      webhook.cardMaskedNumber ?? "", // <- Masked VPAN
      webhook.date, // <- Date transmit
      webhook.time, // <- Time transmit
      webhook.date, // <- Date local
      webhook.time, // <- Time local
      webhook.messageClass ?? "", // <- Message class
      "2", // <- Message function
      "0", // <- Transaction source
      "00200", // <- Function code
      webhook.transactionCode, // <- Transaction Code
      "", // <- Acquirer Financial Entity
      "", // <- Transaction Reference Number
      "", // <- ARN
      "", // <- Token Requestor ID
      "00000000000000000000",
      webhook.transactionType, // <- Item Category
      webhook.rrn ?? now, // <- RRN
      webhook.stan ?? "0", // <- STAN
      description, // <- Description
      `CARD ACCEPTOR~ATM Riyadh~CITY NAME~             ${webhook.currency}`, // <- Card Acceptor Location
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
      webhook.parentTransactionId ?? webhook.transactionId ?? "", // <- Reference
      "0", // <- Original Transaction Id
      "", // <- Original Transaction Reference
      "0", // <- Balance Before
      Number.parseFloat(webhook.otb) + Number.parseFloat(webhook.amount), // <- Surplus Before
      "0", // <- Balance After
      webhook.otb, // <- Surplus After
      webhook.sign == "C" ? "C" : "D", // <- Credit Debit (C | D)
      "0", // <- Application Sequence
    ].join(",");

    transactions.push(row);
  }
  const footer = [
    "F",
    transactions.length - 1,
    ...Array(columns.length - 2),
  ].join(",");

  transactions.push(footer);

  await FilesHelper.write(fileName, transactions.join("\n"));
};
