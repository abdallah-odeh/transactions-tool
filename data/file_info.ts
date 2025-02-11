type Column = [string, string, number];

export const columns: Column[] = [
  ["RecordType", "string", 1],
  ["UNIQUE_ID", "number", 20],
  ["Transaction Type", "number", 5],
  ["Transaction Currency", "string", 3],
  ["Transaction Amount", "amount", 15],
  ["Billing Currency", "string", 3],
  ["Billing Amount", "amount", 15],
  ["Settlement Date", "date", 8],
  ["Settlement Amount", "amount", 15],
  ["Settlement Currency", "string", 3],
  ["System Date", "date", 8],
  ["Account Number", "string", 28],
  ["Account Id", "number", 10],
  ["VPAN", "string", 32],
  ["Masked PAN", "string", 11],
  ["Date Transmit", "date", 8],
  ["Time Transmit", "time", 6],
  ["Date Local", "date", 8],
  ["Time Local", "time", 6],
  ["Message Class", "string", 1],
  ["Message Function", "string", 1],
  ["Transaction Source", "string", 1],
  ["Function Code", "number", 5],
  ["Transaction Code", "number", 5],
  ["Acquirer Financial Entity", "string", 8],
  ["Transaction Reference Number", "string", 25],
  ["ARN", "string", 23],
  ["Token Requestor ID", "string", 32],
  ["Authorization Transaction Log ID", "number", 20],
  ["Item Category", "string", 4],
  ["RRN", "string", 12],
  ["STAN", "number", 10],
  ["Description", "string", 255],
  ["Card Acceptor Location", "string", 64],
  ["MCC", "number", 4],
  ["Card Acceptor ID", "string", 15],
  ["Terminal Code", "string", 16],
  ["Acquirer ID", "string", 11],
  ["Acquirer Country", "string", 3],
  ["Card Data Input Capability", "string", 1],
  ["Cardholder Authentication Availability", "string", 1],
  ["Card Capture Capability", "string", 1],
  ["Operating Environment", "string", 1],
  ["Cardholder Present Indicator", "string", 1],
  ["Card Present Indicator", "string", 1],
  ["Card Data Input Mode", "string", 1],
  ["Cardholder Authentication Method", "string", 1],
  ["Cardholder authorization Entity", "string", 1],
  ["Pin Capture Capability", "string", 1],
  ["Reference", "string", 15],
  ["Original Transaction Id", "number", 10],
  ["Original Transaction Reference", "string", 15],
  ["Balance Before", "amount", 15],
  ["Surplus Before", "amount", 15],
  ["Balance After", "amount", 15],
  ["Surplus After", "amount", 15],
  ["Credit Debit", "string", 1],
  ["Application Sequence", "amount", 10],
];
