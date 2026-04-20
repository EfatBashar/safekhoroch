export type TxType = "income" | "expense";
export type Account = "cash" | "bank";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  account: Account;
  note?: string;
  date: string; // ISO
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
