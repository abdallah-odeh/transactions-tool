import { classMessages } from "../../data/data";
import { ClassMessage } from "../../models/transaction_type";
import { ConsoleHelper } from "../console-helper";
import { TransactionsGeneratorHelper } from "../transactions-generator.helper";

export const ClassMessageGenerator = {
  generate: async (): Promise<Array<ClassMessage>> => {
    console.log("\n=========================");
    console.log("What transaction types do you want in the file?");
    for (var i = 0; i < classMessages.length; i++) {
      console.log(`${i + 1}.\t${ClassMessage[classMessages[i]]}`);
    }
    const types = await ConsoleHelper.read(
      "Enter types (separated by commas) i.e. 1,3,4"
    );

    if (types.length == 0) {
      console.error("Invalid types\n");
      return ClassMessageGenerator.generate();
    }

    const input = types.split(",").map((e) => Number.parseInt(e) - 1);
    const result = new Array<ClassMessage>();
    for (var i = 0; i < input.length; i++) {
      const inputValue = input[i];

      if (inputValue < 0 || inputValue >= classMessages.length) {
        console.error(`Invalid type ${inputValue + 1}\n`);
        const shouldProceed = await ConsoleHelper.read(
          "Ignore it and proceed [y] or try again [n]?"
        );
        switch (shouldProceed.toLowerCase()) {
          case "y":
          case "yes":
            continue;
          default:
            return ClassMessageGenerator.generate();
        }
      }
      result.push(classMessages[inputValue]);
    }

    return result;
  },
};
