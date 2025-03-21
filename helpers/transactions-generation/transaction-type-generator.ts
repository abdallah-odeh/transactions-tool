import { itemCategories } from "../../data/data";
import { BaseItemCategory } from "../../models/item_category/base_item_category";
import { ConsoleHelper } from "../console-helper";

export const TransactionsCategoriesGenerator = {
  generate: async (): Promise<Array<BaseItemCategory>> => {
    console.log("\n=========================");
    console.log("What transaction categories do you want in the file?");
    console.log(`0.\tAll`);
    for (var i = 0; i < itemCategories.length; i++) {
      console.log(`${i + 1}.\t${itemCategories[i].displayName()}`);
    }
    let types = await ConsoleHelper.read(
      "Enter types (separated by commas) i.e. 1,3,4"
    );

    if (types.length == 0) {
      console.error("Invalid types\n");
      return TransactionsCategoriesGenerator.generate();
    }

    if (types == "0") {
      types = Array.from(
        { length: itemCategories.length },
        (_, i) => i + 1
      ).join(",");
    }

    const input = types.split(",").map((e) => Number.parseInt(e) - 1);
    const result = new Array<BaseItemCategory>();
    for (var i = 0; i < input.length; i++) {
      const inputValue = input[i];

      if (inputValue < 0 || inputValue >= itemCategories.length) {
        console.error(`Invalid type ${inputValue + 1}\n`);
        const shouldProceed = await ConsoleHelper.read(
          "Ignore it and proceed [y] or try again [n]?"
        );
        switch (shouldProceed.toLowerCase()) {
          case "y":
          case "yes":
            continue;
          default:
            return TransactionsCategoriesGenerator.generate();
        }
      }
      result.push(itemCategories[inputValue]);
    }

    return result;
  },
};
