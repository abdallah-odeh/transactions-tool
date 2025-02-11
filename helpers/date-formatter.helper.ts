import { format as formatter, parse as parser } from "date-fns";

export const DateFormatterHelper = {
  format: (date: Date, format: string = "dd/MM/yyyy"): string => {
    return formatter(date, format);
    try {
      return formatter(date, format);
    } catch (e) {
      console.error(`Could not format date ${date} in ${format}\n${e}`);
      return formatter(date, format);
    }
  },

  tryFormat: (date?: Date, format: string = "dd/MM/yyyy"): string | null => {
    if (date == null) return null;
    return DateFormatterHelper.format(date, format);
  },

  parse: (date: string, format: string = "dd/MM/yyyy"): Date => {
    return parser(date, format, new Date());
  },

  tryParse: (date?: string, format: string = "dd/MM/yyyy"): Date | null => {
    if (date == null) return null;
    return parser(date, format, new Date());
  },
};
