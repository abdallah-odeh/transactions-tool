import * as fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { columns } from "../data/file_info";
import path from "path";

export const CSVParser = {
  convertCsvToFixedLength: (inputCsvPath: string, outputTxtPath: string) => {
    const outputStream = fs.createWriteStream(outputTxtPath);

    const terms = path.basename(inputCsvPath).split('_');
    const lastTerm = terms[terms.length - 1].split('.');

    const date = lastTerm[0];

    outputStream.write(`H${date}\n`);

    try {
      fs.createReadStream(inputCsvPath)
        .pipe(csv())
        .on("data", (row) => {
          const cells = Object.values(row);
          if (String(cells).trim().length == 0) return;
          const ignored = ["H", "F"];
          if (ignored.includes(String(cells[0]))) {
            return outputStream.write(cells.join("").replace(",", "") + "\n");
          }
          const fixedLengthRow = cells
            .map(function (value, index) {
              const column = columns[index];
              return CSVParser.formatFixedLength(
                String(value),
                column[1],
                column[2]
              );
            })
            .join("");

          outputStream.write(fixedLengthRow + "\n");
        })
        .on("end", () => {
          outputStream.end();
        });
    } catch (e) {}
  },

  convertFixedLengthToCSV: (inputTxtPath: string, outputCSVPath: string) => {
    // Create the CSV writer
    const csvWriter = createObjectCsvWriter({
      path: outputCSVPath,
      header: columns.map((column) => ({
        id: column[0],
        title: column[0],
      })),
    });

    // Read the fixed-width file
    fs.readFile(inputTxtPath, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const csvRows: string[] = [];

      // Create header from column widths
      const header = columns.map((column) => column[0]).join(",");
      csvRows.push(header);

      // Parse each row in the fixed-length data
      data.split("\n").forEach((line) => {
        if (line.trim().length == 0) return;
        let row = "";
        let start = 0;

        columns.forEach((column) => {
          const width = column[2];
          row += `${line.substring(start, start + width).trim()},`;
          start += width;
        });

        // Remove trailing comma
        row = row.slice(0, -1);
        csvRows.push(row);
      });

      // Write the CSV rows to the file
      fs.writeFileSync(outputCSVPath, csvRows.join("\n"));
    });
  },

  formatFixedLength: (value: string, type: string, length: number): string => {
    value = value.trim();
    if (value.length == 0) return value.padStart(length, " ");
    if (value.length > length) {
      return value.substring(0, length);
    }
    switch (type) {
      case "string":
      case "date":
        return value.padEnd(length, " ");
      case "amount":
      case "number":
        return value.padStart(length, "0");
    }
    return value.padEnd(length, " ");
  },
};
