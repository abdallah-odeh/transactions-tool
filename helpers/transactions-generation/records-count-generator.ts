import { ConsoleHelper } from "../console-helper";

export const RecordsCountGenerator = {
  generate: async (): Promise<number> => {
    console.log("\n=========================");
    const records = await ConsoleHelper.read("How many records do you want?");
    if (records.length == 0) {
      console.error("Invalid records count\n");
      return RecordsCountGenerator.generate();
    }

    const recordsCount = Number.parseInt(records);
    if (recordsCount <= 0) {
      console.error("Invalid records count\n");
      return RecordsCountGenerator.generate();
    }

    return recordsCount;
  },
};
