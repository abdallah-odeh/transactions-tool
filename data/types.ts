import { ItemCategory } from "../models/transaction_type";

export type TransactionCategory = { type: ItemCategory; rev: ItemCategory };
export type Column = [string, string, number];
export type AmountRange = { min: number; max: number };
export type DateRange = { start: Date; end: Date };
export type TransactionsFile = { name: string; date: Date; transactions: string[] };