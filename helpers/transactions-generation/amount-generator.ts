import { AmountRange } from "../../data/types";
import { ConsoleHelper } from "../console-helper";
import { TransactionsGeneratorHelper } from "../transactions-generator.helper";

export const AmountGenerator = {
  generate: async (): Promise<AmountRange> => {
    console.log("\n=========================");
    const types = await ConsoleHelper.read(
      "Enter transactions amount range i.e. 0.5 - 120.5"
    );
    if (types.length == 0) {
      console.error("Invalid range\n");
      return AmountGenerator.generate();
    }

    const range = types.trim().replace(" ", "").split("-");
    if (range.length != 2) {
      console.error("Invalid range\n");
      return AmountGenerator.generate();
    }

    range.sort();

    return {
      min: Number.parseFloat(range[0]),
      max: Number.parseFloat(range[1]),
    };
  },
};
