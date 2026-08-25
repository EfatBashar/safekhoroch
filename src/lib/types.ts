export type TxType = "income" | "expense";
export type Account = "cash" | "bank" | "bkash" | "nagad" | "rocket";
export const ACCOUNTS: Account[] = ["cash", "bank", "bkash", "nagad", "rocket"];

export type TxSource = "manual" | "loan" | "market" | "savings" | "dps" | "bill";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  account: Account;
  note?: string;
  date: string; // ISO
  /** where this entry came from; transfers don't count as income/expense */
  source?: TxSource;
  /** id of the linked loan / market item / savings goal / bill */
  refId?: string;
}

export type LoanType = "borrow" | "lend"; // borrow = I owe; lend = owed to me

export interface Loan {
  id: string;
  type: LoanType;
  person: string;
  amount: number;
  date: string;
  note?: string;
  settled: boolean;
  account?: Account;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Gift",
  "Investment",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Other",
];
