import { format as formatter, parse as parser } from "date-fns";

export const DateFormatterHelper = {
  format: (date: Date, format: string = "dd/MM/yyyy"): string => {
    try {
      return formatter(date, format);
    } catch (e) {
      console.error(`Could not format date ${date} in ${format}\n${e}`);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      return format
        .replace("yyyy", year.toString().padStart(4, "0"))
        .replace("MM", month.toString().padStart(2, "0"))
        .replace("dd", day.toString().padStart(2, "0"));
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
