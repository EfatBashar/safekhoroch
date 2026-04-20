import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const LANG_KEY = "etracker.lang.v1";

type Strings = {
  appName: string;
  home: string;
  activity: string;
  accounts: string;
  loans: string;
  add: string;
  greeting: string;
  yourPocket: string;
  totalBalance: string;
  cash: string;
  bank: string;
  income: string;
  expense: string;
  thisWeek: string;
  last7Days: string;
  owedToMe: string;
  iOwe: string;
  recentActivity: string;
  totalCount: (n: number) => string;
  emptyDashboard: string;
  activityTitle: string;
  activitySub: string;
  all: string;
  noTransactions: string;
  items: (n: number) => string;
  delete: string;
  accountsTitle: string;
  accountsSub: string;
  cashOnHand: string;
  bankAccount: string;
  monthlySummary: string;
  last6Months: string;
  financialSummary: string;
  totalIncome: string;
  totalExpense: string;
  netSavings: string;
  loansTitle: string;
  loansSub: string;
  net: string;
  lent: string;
  borrowed: string;
  settled: string;
  noLoans: string;
  toggleSettled: string;
  addNew: string;
  transaction: string;
  debtLoan: string;
  iLent: string;
  iBorrowed: string;
  amount: string;
  category: string;
  pick: string;
  account: string;
  date: string;
  noteOptional: string;
  note: string;
  person: string;
  name: string;
  save: string;
  incomeAdded: string;
  expenseAdded: string;
  saved: string;
  enterValidAmount: string;
  pickCategory: string;
  enterName: string;
  cats: Record<string, string>;
};

const dict: Record<Lang, Strings> = {
  en: {
    // App / nav
    appName: "Pocket",
    home: "Home",
    activity: "Activity",
    accounts: "Accounts",
    loans: "Loans",
    add: "Add",

    // Dashboard
    greeting: "Good day 👋",
    yourPocket: "Your Pocket",
    totalBalance: "Total balance",
    cash: "Cash",
    bank: "Bank",
    income: "Income",
    expense: "Expense",
    thisWeek: "This week",
    last7Days: "Last 7 days",
    owedToMe: "Owed to me",
    iOwe: "I owe",
    recentActivity: "Recent activity",
    totalCount: (n: number) => `${n} total`,
    emptyDashboard: "Tap the + button to add your first transaction.",

    // Transactions
    activityTitle: "Activity",
    activitySub: "All your money movements",
    all: "All",
    noTransactions: "No transactions yet.",
    items: (n: number) => `${n} item${n > 1 ? "s" : ""}`,
    delete: "Delete",

    // Accounts
    accountsTitle: "Accounts",
    accountsSub: "Where your money lives",
    cashOnHand: "Cash on hand",
    bankAccount: "Bank account",
    monthlySummary: "Monthly summary",
    last6Months: "Last 6 months",
    financialSummary: "Financial summary",
    totalIncome: "Total income",
    totalExpense: "Total expense",
    netSavings: "Net savings",

    // Loans
    loansTitle: "Loans",
    loansSub: "Borrow & lend, in one place",
    net: "Net",
    lent: "Lent",
    borrowed: "Borrowed",
    settled: "Settled",
    noLoans: "No loans yet. Tap + to add one.",
    toggleSettled: "Toggle settled",

    // Add sheet
    addNew: "Add new",
    transaction: "Transaction",
    debtLoan: "Debt / Loan",
    iLent: "I Lent",
    iBorrowed: "I Borrowed",
    amount: "Amount",
    category: "Category",
    pick: "Pick",
    account: "Account",
    date: "Date",
    noteOptional: "Note (optional)",
    note: "Note",
    person: "Person",
    name: "Name",
    save: "Save",
    incomeAdded: "Income added",
    expenseAdded: "Expense added",
    saved: "Saved",
    enterValidAmount: "Enter a valid amount",
    pickCategory: "Pick a category",
    enterName: "Enter a name",

    // Categories
    cats: {
      Salary: "Salary",
      Freelance: "Freelance",
      Gift: "Gift",
      Investment: "Investment",
      Food: "Food",
      Transport: "Transport",
      Shopping: "Shopping",
      Bills: "Bills",
      Health: "Health",
      Entertainment: "Entertainment",
      Other: "Other",
    } as Record<string, string>,
  },
  bn: {
    appName: "পকেট",
    home: "হোম",
    activity: "লেনদেন",
    accounts: "অ্যাকাউন্ট",
    loans: "ঋণ",
    add: "যোগ",

    greeting: "শুভেচ্ছা 👋",
    yourPocket: "আপনার পকেট",
    totalBalance: "মোট ব্যালেন্স",
    cash: "নগদ",
    bank: "ব্যাংক",
    income: "আয়",
    expense: "ব্যয়",
    thisWeek: "এই সপ্তাহ",
    last7Days: "গত ৭ দিন",
    owedToMe: "আমি পাব",
    iOwe: "আমি দেব",
    recentActivity: "সাম্প্রতিক লেনদেন",
    totalCount: (n: number) => `মোট ${n}টি`,
    emptyDashboard: "প্রথম লেনদেন যোগ করতে + বাটনে চাপুন।",

    activityTitle: "লেনদেন",
    activitySub: "আপনার সব টাকার গতিবিধি",
    all: "সব",
    noTransactions: "এখনো কোনো লেনদেন নেই।",
    items: (n: number) => `${n}টি`,
    delete: "মুছুন",

    accountsTitle: "অ্যাকাউন্ট",
    accountsSub: "আপনার টাকা যেখানে আছে",
    cashOnHand: "হাতে নগদ",
    bankAccount: "ব্যাংক অ্যাকাউন্ট",
    monthlySummary: "মাসিক সারসংক্ষেপ",
    last6Months: "গত ৬ মাস",
    financialSummary: "আর্থিক সারসংক্ষেপ",
    totalIncome: "মোট আয়",
    totalExpense: "মোট ব্যয়",
    netSavings: "নিট সঞ্চয়",

    loansTitle: "ঋণ",
    loansSub: "ধার দেওয়া ও নেওয়া, এক জায়গায়",
    net: "নিট",
    lent: "ধার দিয়েছি",
    borrowed: "ধার নিয়েছি",
    settled: "পরিশোধিত",
    noLoans: "এখনো কোনো ঋণ নেই। + চেপে যোগ করুন।",
    toggleSettled: "পরিশোধিত টগল",

    addNew: "নতুন যোগ করুন",
    transaction: "লেনদেন",
    debtLoan: "ঋণ / ধার",
    iLent: "ধার দিয়েছি",
    iBorrowed: "ধার নিয়েছি",
    amount: "পরিমাণ",
    category: "ক্যাটাগরি",
    pick: "নির্বাচন",
    account: "অ্যাকাউন্ট",
    date: "তারিখ",
    noteOptional: "নোট (ঐচ্ছিক)",
    note: "নোট",
    person: "ব্যক্তি",
    name: "নাম",
    save: "সংরক্ষণ",
    incomeAdded: "আয় যোগ হয়েছে",
    expenseAdded: "ব্যয় যোগ হয়েছে",
    saved: "সংরক্ষিত",
    enterValidAmount: "সঠিক পরিমাণ লিখুন",
    pickCategory: "একটি ক্যাটাগরি নির্বাচন করুন",
    enterName: "একটি নাম লিখুন",

    cats: {
      Salary: "বেতন",
      Freelance: "ফ্রিল্যান্স",
      Gift: "উপহার",
      Investment: "বিনিয়োগ",
      Food: "খাবার",
      Transport: "পরিবহন",
      Shopping: "কেনাকাটা",
      Bills: "বিল",
      Health: "স্বাস্থ্য",
      Entertainment: "বিনোদন",
      Other: "অন্যান্য",
    } as Record<string, string>,
  },
};

export type Dict = Strings;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  tc: (cat: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: dict.en,
  tc: (c) => c,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Lang | null;
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t = dict[lang];
  const tc = (cat: string) => t.cats[cat] ?? cat;

  return (
    <LangContext.Provider value={{ lang, setLang, t, tc }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
