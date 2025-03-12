import { columns } from "../data/file_info";
import { ConsoleHelper } from "./console-helper";
import { DateFormatterHelper } from "./date-formatter.helper";
import * as fs from "fs";
import { AmountRange, DateRange, TransactionsFile } from "../data/types";
import { generate, transactionsCode, transactionTypes } from "../data/data";
import { FilesHelper } from "./files.helper";
import { BaseItemCategory } from "../models/item_category/base_item_category";

export const TransactionsGeneratorHelper = {
  generate: async (options: {
    provider: string;
    records: number;
    // types: ClassMessage[];
    categories: BaseItemCategory[];
    amount: AmountRange;
    date: DateRange;
    cards: any[];
  }): Promise<void> => {
    await FilesHelper.cleanDir();
    console.log("\n=========================");

    const files: TransactionsFile[] = [];
    const accounts: string[] = [];

    for (var i = 0; i < options.records; i++) {
      const card = generate(options.cards);
      const amount =
        Math.random() * (options.amount.max - options.amount.min) +
        options.amount.min;

      const date = new Date(
        Math.floor(
          Math.random() *
            (options.date.end.getTime() - options.date.start.getTime() + 1)
        ) + options.date.start.getTime()
      );

      const formattedDate = DateFormatterHelper.format(date, "yyyyMMdd");
      const fileName = `TransactionsSync_${formattedDate}.csv`;
      let file = files.find((e) => e.name == fileName);
      if (file == undefined) {
        files.push({ name: fileName, date: date, transactions: [] });
        file = files.find((e) => e.name == fileName);
      }

      // const category = generate(options.categories);
      const category = options.categories[i % options.categories.length];

      const transaction = category.getRecords({
        amount: amount,
        transactionType: generate(transactionTypes),
        card: card,
        date: date,
        applicationSequance: accounts.filter((e) => e == card.account_number)
          .length,
      });

      console.log(
        `${category.displayName()} ${transaction.transactions.length} | ${
          transaction.webhooks.length
        }`
      );

      file!.transactions.push(...transaction.transactions);
      await appendWebhook(transaction.webhooks);

      for (var t = 0; t < transaction.transactions.length; t++) {
        accounts.push(card.account_number);
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

      await FilesHelper.write(file.name, transactions.join("\n"));

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
        return TransactionsGeneratorHelper.generate(options);
    }
  },
};

export const appendWebhook = async (newData: any[]) => {
  await FilesHelper.updateContent("webhooks.json", newData);
};
