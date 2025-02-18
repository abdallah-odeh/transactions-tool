import path from "path";
import * as fs from "fs";
import { ConsoleHelper } from "../console-helper";

export const CardsGenerator = {
  generate: async (): Promise<any[]> => {
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
      return CardsGenerator.generate();
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
            return CardsGenerator.generate();
        }
      }
      result.push(cardsOptions[inputValue]);
    }

    return result;
  },
};
