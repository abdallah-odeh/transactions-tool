import { DateRange } from "../../data/types";
import { ConsoleHelper } from "../console-helper";
import { DateFormatterHelper } from "../date-formatter.helper";
import { TransactionsGeneratorHelper } from "../transactions-generator.helper";

export const DatesGenerator = {
  generate: async (): Promise<DateRange> => {
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
      return DatesGenerator.generate();
    }

    const range = types.trim().replace(" ", "").split("-");
    if (range.length == 1) {
      range.push(...range);
    }
    if (range.length != 2) {
      console.error("Invalid range\n");
      return DatesGenerator.generate();
    }

    range.sort();

    const start = DateFormatterHelper.tryParse(range[0].trim());
    if (start == null) {
      console.error("Invalid start date\n");
      return DatesGenerator.generate();
    }

    const end = DateFormatterHelper.tryParse(range[1].trim());
    if (end == null) {
      console.error("Invalid end date\n");
      return DatesGenerator.generate();
    }

    return {
      start: start,
      end: end,
    };
  },
};
