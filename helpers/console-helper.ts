import { exit } from "process";
import * as readline from "readline/promises";

export const ConsoleHelper = {
  read: async (question: string): Promise<string> => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(question);
    const input = await rl.question('➤  ');
    rl.close();

    if (input.toLowerCase() == "q") exit(0);

    return input.trim();
  },
};
