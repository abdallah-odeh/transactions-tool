import { providers } from "../../data/data";
import { ConsoleHelper } from "../console-helper";

export const ProviderGenerator = {
  generate: async (): Promise<string> => {
    console.log("Please select provider");
    for (var i = 0; i < providers.length; i++) {
      console.log(`${i + 1}.\t${providers[i]}`);
    }
    const provider = await ConsoleHelper.read("Enter provider's number: ");
    if (provider.length == 0) {
      console.error("Invalid provider number\n");
      return ProviderGenerator.generate();
    }

    const index = Number.parseInt(provider) - 1;
    if (index < 0 || index >= providers.length) {
      console.error("Invalid provider number\n");
      return ProviderGenerator.generate();
    }

    if (index == 1) {
      console.error("APISO is not yet supported!\n");
      return ProviderGenerator.generate();
    }

    return providers[index];
  },
};
