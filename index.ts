import { ConsoleHelper } from "./helpers/console-helper";
import { CSVParser } from "./helpers/csv-parser";
import * as fs from "fs";
import { TransactionsGeneratorHelper } from "./helpers/transactions-generator.helper";
import path from "path";
import { ProviderGenerator } from "./helpers/transactions-generation/provider-generator";
import { RecordsCountGenerator } from "./helpers/transactions-generation/records-count-generator";
import { ClassMessageGenerator } from "./helpers/transactions-generation/class-message-helper";
import { TransactionsCategoriesGenerator } from "./helpers/transactions-generation/transaction-type-generator";
import { AmountGenerator } from "./helpers/transactions-generation/amount-generator";
import { DatesGenerator } from "./helpers/transactions-generation/date-generator";
import { CardsGenerator } from "./helpers/transactions-generation/cards-generator";

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
  const filePath = "generated/webhooks.json";
  if (!fs.existsSync(filePath)) {
    console.error("Webhooks file not found, aborting ..");
    console.log("=========================\n");
    return;
  }

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");

  try {
    const fsPromis = fs.promises;

    const fileContent = await fsPromis.readFile(filePath, "utf-8");
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
