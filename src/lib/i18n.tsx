import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const LANG_KEY = "etracker.lang.v1";

type Strings = {
  // App / nav
  appName: string;
  dashboard: string;
  activity: string;
  todo: string;
  loans: string;
  bakirKhata: string;
  add: string;

  // Header
  notifications: string;
  settings: string;
  profile: string;
  menu: string;

  // Greeting
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  greetingNight: string;
  greetingSub: string;

  // Section headers
  sec1FinancialSummary: string;
  sec2MainFeatures: string;
  sec3RecentActivity: string;
  sec4ExtraTools: string;

  // Summary cards
  cashOnHand: string;
  bankAccount: string;
  totalIncome: string;
  totalExpense: string;

  // Feature grid labels
  featTransactions: string;
  featAccounts: string;
  featDebt: string;
  featLedger: string;
  featBudget: string;
  featSavings: string;
  featLoan: string;
  featDPS: string;
  featTasks: string;

  // Extra tools
  toolMarket: string;
  toolMedicine: string;
  toolBills: string;
  toolAnalytics: string;
  toolBakir: string;
  toolReport: string;
  toolPro: string;
  toolSettings: string;

  // Recent / upcoming
  recentTransactions: string;
  seeAll: string;
  noTransactions: string;
  upcomingTasks: string;
  noTasks: string;

  // Activity / Transactions page
  netBalance: string;
  txCount: (n: number) => string;
  filterAll: string;
  filterIncome: string;
  filterExpense: string;
  noTxTitle: string;
  noTxSub: string;
  addTransaction: string;
  back: string;
  delete: string;

  // Bottom nav
  navDashboard: string;
  navTransactions: string;
  navTodo: string;
  navDebt: string;
  navBakir: string;

  // Drawer sections
  drawerFinancialMgmt: string;
  drawerLoanInvest: string;
  drawerLifestyle: string;
  drawerReports: string;
  drawerFamily: string;
  drawerDailyCashFlow: string;
  drawerInvestment: string;
  drawerAssetVault: string;
  drawerBillReminder: string;
  drawerFamily2: string;
  drawerProUpgrade: string;
  drawerLogout: string;

  // Add sheet
  addNew: string;
  transaction: string;
  debtLoan: string;
  iLent: string;
  iBorrowed: string;
  amount: string;
  category: string;
  pick: string;
  account: string;
  cash: string;
  bank: string;
  bkash: string;
  nagad: string;
  rocket: string;
  date: string;
  noteOptional: string;
  note: string;
  person: string;
  name: string;
  save: string;
  income: string;
  expense: string;
  incomeAdded: string;
  expenseAdded: string;
  saved: string;
  enterValidAmount: string;
  pickCategory: string;
  enterName: string;

  // Loans page
  loansTitle: string;
  loansSub: string;
  owedToMe: string;
  iOwe: string;
  net: string;
  lent: string;
  borrowed: string;
  settled: string;
  noLoans: string;
  toggleSettled: string;

  // Accounts page
  accountsTitle: string;
  accountsSub: string;
  monthlySummary: string;
  last6Months: string;
  netSavings: string;

  // Settings page
  settingsTitle: string;
  freePlan: string;
  upgradePro: string;
  proSub: string;
  account_label: string;
  dataExport: string;
  dataExportSub: string;
  cloudSync: string;
  cloudSyncSub: string;
  privacyPolicy: string;
  changePassword: string;
  signOut: string;
  helpContact: string;
  whatsappSupport: string;
  emailSupport: string;
  dangerZone: string;
  deleteAccount: string;
  deleteAccountSub: string;
  appVersion: string;

  // Pro page
  proTitle: string;
  proHeroTitle: string;
  proHeroSub: string;
  pickPlan: string;
  monthlyPlan: string;
  yearlyPlan: string;
  perMonth: string;
  perYear: string;
  saveTag: string;
  proBenefits: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  benefit4: string;
  benefit5: string;
  benefit6: string;
  payNow: string;

  // Tasks
  tasksTitle: string;
  tasksSub: string;
  noTasksTitle: string;
  noTasksSub: string;
  addTask: string;
  taskPlaceholder: string;
  done: string;
  pending: string;

  // Bakir Khata
  bakirTitle: string;
  bakirSub: string;
  comingSoon: string;
  comingSoonSub: string;

  // Categories
  cats: Record<string, string>;
};

const dict: Record<Lang, Strings> = {
  bn: {
    appName: "হাত-খরচ",
    dashboard: "ড্যাশবোর্ড",
    activity: "লেনদেন",
    todo: "করণীয়",
    loans: "দেনা-পাওনা",
    bakirKhata: "বাকির খাতা",
    add: "যোগ",

    notifications: "নোটিফিকেশন",
    settings: "সেটিংস",
    profile: "প্রোফাইল",
    menu: "মেনু",

    greetingMorning: "শুভ সকাল",
    greetingAfternoon: "শুভ দুপুর",
    greetingEvening: "শুভ সন্ধ্যা",
    greetingNight: "শুভ রাত্রি",
    greetingSub: "আপনার আর্থিক সারসংক্ষেপ",

    sec1FinancialSummary: "০১. আর্থিক সারাংশ",
    sec2MainFeatures: "০২. প্রধান ফিচার",
    sec3RecentActivity: "০৩. সাম্প্রতিক কার্যকলাপ",
    sec4ExtraTools: "০৪. অতিরিক্ত সরঞ্জাম",

    cashOnHand: "হাতের নগদ",
    bankAccount: "একাউন্ট ব্যালেন্স",
    totalIncome: "মোট আয়",
    totalExpense: "মোট ব্যয়",

    featTransactions: "লেনদেন",
    featAccounts: "একাউন্ট",
    featDebt: "দেনা-পাওনা",
    featLedger: "খাতা",
    featBudget: "বাজেট",
    featSavings: "সঞ্চয়",
    featLoan: "ঋণ",
    featDPS: "ডিপিএস",
    featTasks: "কাজ",

    toolMarket: "বাজার",
    toolMedicine: "ঔষধ",
    toolBills: "বিল",
    toolAnalytics: "বিশ্লেষণ",
    toolBakir: "বাকির খাতা",
    toolReport: "রিপোর্ট",
    toolPro: "প্রো",
    toolSettings: "সেটিংস",

    recentTransactions: "সাম্প্রতিক লেনদেন",
    seeAll: "সব দেখুন",
    noTransactions: "কোনো লেনদেন নেই",
    upcomingTasks: "আসন্ন কাজ",
    noTasks: "কোনো কাজ নেই",

    netBalance: "নীট ব্যালেন্স",
    txCount: (n: number) => `${toBn(n)} টি লেনদেন`,
    filterAll: "সব",
    filterIncome: "আয়",
    filterExpense: "খরচ",
    noTxTitle: "কোন লেনদেন নেই",
    noTxSub: "নতুন লেনদেন যোগ করুন",
    addTransaction: "লেনদেন যোগ করুন",
    back: "ফিরে",
    delete: "মুছুন",

    navDashboard: "ড্যাশবোর্ড",
    navTransactions: "লেনদেন",
    navTodo: "করণীয়",
    navDebt: "দেনা-পাওনা",
    navBakir: "বাকির খাতা",

    drawerFinancialMgmt: "আর্থিক ব্যবস্থাপনা",
    drawerLoanInvest: "ঋণ ও বিনিয়োগ",
    drawerLifestyle: "জীবনযাত্রা",
    drawerReports: "রিপোর্ট ও বিশ্লেষণ",
    drawerFamily: "পরিবার",
    drawerDailyCashFlow: "দৈনিক নগদ প্রবাহ",
    drawerInvestment: "বিনিয়োগ",
    drawerAssetVault: "সম্পদ ভল্ট",
    drawerBillReminder: "বিল রিমাইন্ডার",
    drawerFamily2: "ফ্যামিলি",
    drawerProUpgrade: "প্রো আপগ্রেড",
    drawerLogout: "লগআউট",

    addNew: "নতুন যোগ করুন",
    transaction: "লেনদেন",
    debtLoan: "ঋণ / ধার",
    iLent: "ধার দিয়েছি",
    iBorrowed: "ধার নিয়েছি",
    amount: "পরিমাণ",
    category: "ক্যাটাগরি",
    pick: "নির্বাচন",
    account: "অ্যাকাউন্ট",
    cash: "নগদ",
    bank: "ব্যাংক",
    bkash: "বিকাশ",
    nagad: "নগদ (মোবাইল)",
    rocket: "রকেট",
    date: "তারিখ",
    noteOptional: "নোট (ঐচ্ছিক)",
    note: "নোট",
    person: "ব্যক্তি",
    name: "নাম",
    save: "সংরক্ষণ",
    income: "আয়",
    expense: "খরচ",
    incomeAdded: "আয় যোগ হয়েছে",
    expenseAdded: "খরচ যোগ হয়েছে",
    saved: "সংরক্ষিত",
    enterValidAmount: "সঠিক পরিমাণ লিখুন",
    pickCategory: "একটি ক্যাটাগরি নির্বাচন করুন",
    enterName: "একটি নাম লিখুন",

    loansTitle: "দেনা-পাওনা",
    loansSub: "ধার দেওয়া ও নেওয়া, এক জায়গায়",
    owedToMe: "আমি পাব",
    iOwe: "আমি দেব",
    net: "নীট",
    lent: "ধার দিয়েছি",
    borrowed: "ধার নিয়েছি",
    settled: "পরিশোধিত",
    noLoans: "এখনো কোনো ঋণ নেই। + চেপে যোগ করুন।",
    toggleSettled: "পরিশোধিত টগল",

    accountsTitle: "একাউন্ট",
    accountsSub: "আপনার টাকা যেখানে আছে",
    monthlySummary: "মাসিক সারসংক্ষেপ",
    last6Months: "গত ৬ মাস",
    netSavings: "নীট সঞ্চয়",

    settingsTitle: "সেটিংস",
    freePlan: "ফ্রি প্ল্যান",
    upgradePro: "প্রো আপগ্রেড করুন",
    proSub: "৳৪৯/মাস • বিজ্ঞাপনমুক্ত + সব ফিচার",
    account_label: "অ্যাকাউন্ট",
    dataExport: "ডাটা এক্সপোর্ট",
    dataExportSub: "আপনার ডাটা CSV ফরম্যাটে সংরক্ষণ করুন",
    cloudSync: "ক্লাউড সিঙ্ক",
    cloudSyncSub: "ক্লাউড সার্ভার থেকে ডাটা সিঙ্ক করুন",
    privacyPolicy: "গোপনীয়তা নীতি",
    changePassword: "পাসওয়ার্ড পরিবর্তন করুন",
    signOut: "সাইন আউট",
    helpContact: "সাহায্য ও যোগাযোগ",
    whatsappSupport: "হোয়াটসঅ্যাপ সাপোর্ট",
    emailSupport: "ইমেইল সাপোর্ট",
    dangerZone: "বিপদজনক এলাকা",
    deleteAccount: "অ্যাকাউন্ট মুছে ফেলুন",
    deleteAccountSub: "সকল ডাটা স্থায়ীভাবে মুছে যাবে",
    appVersion: "সংস্করণ v1.0.0",

    proTitle: "প্রো সাবস্ক্রিপশন",
    proHeroTitle: "হাত-খরচ প্রো",
    proHeroSub: "বিজ্ঞাপনমুক্ত • আনলিমিটেড • ক্লাউড সিঙ্ক",
    pickPlan: "প্ল্যান বেছে নিন",
    monthlyPlan: "মাসিক প্ল্যান",
    yearlyPlan: "বার্ষিক প্ল্যান",
    perMonth: "/মাস",
    perYear: "/বছর",
    saveTag: "৳৮৯ সাশ্রয়",
    proBenefits: "প্রো সুবিধাসমূহ",
    benefit1: "বিজ্ঞাপনমুক্ত অভিজ্ঞতা",
    benefit2: "আনলিমিটেড এন্ট্রি",
    benefit3: "আল্ট্রা ফাস্ট ক্লাউড সিঙ্ক",
    benefit4: "কাস্টম ক্যাটাগরি",
    benefit5: "বিল রিমাইন্ডার",
    benefit6: "অ্যাডভান্সড রিপোর্ট ও PDF",
    payNow: "পেমেন্ট করুন",

    tasksTitle: "করণীয়",
    tasksSub: "আপনার কাজের তালিকা",
    noTasksTitle: "কোনো কাজ নেই",
    noTasksSub: "নতুন কাজ যোগ করুন",
    addTask: "কাজ যোগ করুন",
    taskPlaceholder: "কাজ লিখুন...",
    done: "সম্পন্ন",
    pending: "বাকি",

    bakirTitle: "বাকির খাতা",
    bakirSub: "দোকানে বাকির হিসাব",
    comingSoon: "শীঘ্রই আসছে",
    comingSoonSub: "এই ফিচারটি শীঘ্রই যোগ করা হবে",

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
    },
  },
  en: {
    appName: "Hat-Khoroch",
    dashboard: "Dashboard",
    activity: "Transactions",
    todo: "Tasks",
    loans: "Debt",
    bakirKhata: "Ledger",
    add: "Add",

    notifications: "Notifications",
    settings: "Settings",
    profile: "Profile",
    menu: "Menu",

    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    greetingNight: "Good night",
    greetingSub: "Your financial summary",

    sec1FinancialSummary: "01. Financial Summary",
    sec2MainFeatures: "02. Main Features",
    sec3RecentActivity: "03. Recent Activity",
    sec4ExtraTools: "04. Extra Tools",

    cashOnHand: "Cash on hand",
    bankAccount: "Account balance",
    totalIncome: "Total income",
    totalExpense: "Total expense",

    featTransactions: "Transactions",
    featAccounts: "Accounts",
    featDebt: "Debt",
    featLedger: "Ledger",
    featBudget: "Budget",
    featSavings: "Savings",
    featLoan: "Loan",
    featDPS: "DPS",
    featTasks: "Tasks",

    toolMarket: "Market",
    toolMedicine: "Medicine",
    toolBills: "Bills",
    toolAnalytics: "Analytics",
    toolBakir: "Ledger",
    toolReport: "Report",
    toolPro: "Pro",
    toolSettings: "Settings",

    recentTransactions: "Recent transactions",
    seeAll: "See all",
    noTransactions: "No transactions",
    upcomingTasks: "Upcoming tasks",
    noTasks: "No tasks",

    netBalance: "Net balance",
    txCount: (n: number) => `${n} transactions`,
    filterAll: "All",
    filterIncome: "Income",
    filterExpense: "Expense",
    noTxTitle: "No transactions",
    noTxSub: "Add a new transaction",
    addTransaction: "Add transaction",
    back: "Back",
    delete: "Delete",

    navDashboard: "Dashboard",
    navTransactions: "Transactions",
    navTodo: "Tasks",
    navDebt: "Debt",
    navBakir: "Ledger",

    drawerFinancialMgmt: "Financial Management",
    drawerLoanInvest: "Loan & Investment",
    drawerLifestyle: "Lifestyle",
    drawerReports: "Reports & Analysis",
    drawerFamily: "Family",
    drawerDailyCashFlow: "Daily cash flow",
    drawerInvestment: "Investment",
    drawerAssetVault: "Asset vault",
    drawerBillReminder: "Bill reminder",
    drawerFamily2: "Family",
    drawerProUpgrade: "Pro upgrade",
    drawerLogout: "Logout",

    addNew: "Add new",
    transaction: "Transaction",
    debtLoan: "Debt / Loan",
    iLent: "I Lent",
    iBorrowed: "I Borrowed",
    amount: "Amount",
    category: "Category",
    pick: "Pick",
    account: "Account",
    cash: "Cash",
    bank: "Bank",
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    date: "Date",
    noteOptional: "Note (optional)",
    note: "Note",
    person: "Person",
    name: "Name",
    save: "Save",
    income: "Income",
    expense: "Expense",
    incomeAdded: "Income added",
    expenseAdded: "Expense added",
    saved: "Saved",
    enterValidAmount: "Enter a valid amount",
    pickCategory: "Pick a category",
    enterName: "Enter a name",

    loansTitle: "Debt & Loans",
    loansSub: "Borrow & lend, in one place",
    owedToMe: "Owed to me",
    iOwe: "I owe",
    net: "Net",
    lent: "Lent",
    borrowed: "Borrowed",
    settled: "Settled",
    noLoans: "No loans yet. Tap + to add one.",
    toggleSettled: "Toggle settled",

    accountsTitle: "Accounts",
    accountsSub: "Where your money lives",
    monthlySummary: "Monthly summary",
    last6Months: "Last 6 months",
    netSavings: "Net savings",

    settingsTitle: "Settings",
    freePlan: "Free plan",
    upgradePro: "Upgrade to Pro",
    proSub: "৳49/mo • Ad-free + all features",
    account_label: "Account",
    dataExport: "Data export",
    dataExportSub: "Save your data in CSV format",
    cloudSync: "Cloud sync",
    cloudSyncSub: "Sync data from cloud server",
    privacyPolicy: "Privacy policy",
    changePassword: "Change password",
    signOut: "Sign out",
    helpContact: "Help & contact",
    whatsappSupport: "WhatsApp support",
    emailSupport: "Email support",
    dangerZone: "Danger zone",
    deleteAccount: "Delete account",
    deleteAccountSub: "All data will be permanently deleted",
    appVersion: "Version v1.0.0",

    proTitle: "Pro Subscription",
    proHeroTitle: "Hat-Khoroch Pro",
    proHeroSub: "Ad-free • Unlimited • Cloud Sync",
    pickPlan: "Pick a plan",
    monthlyPlan: "Monthly plan",
    yearlyPlan: "Yearly plan",
    perMonth: "/mo",
    perYear: "/yr",
    saveTag: "Save ৳89",
    proBenefits: "Pro benefits",
    benefit1: "Ad-free experience",
    benefit2: "Unlimited entries",
    benefit3: "Ultra fast cloud sync",
    benefit4: "Custom categories",
    benefit5: "Bill reminders",
    benefit6: "Advanced reports & PDF",
    payNow: "Pay now",

    tasksTitle: "Tasks",
    tasksSub: "Your to-do list",
    noTasksTitle: "No tasks",
    noTasksSub: "Add a new task",
    addTask: "Add task",
    taskPlaceholder: "Write a task...",
    done: "Done",
    pending: "Pending",

    bakirTitle: "Ledger",
    bakirSub: "Shop credit accounts",
    comingSoon: "Coming soon",
    comingSoonSub: "This feature will be added shortly",

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
    },
  },
};

function toBn(n: number): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => map[parseInt(d, 10)]);
}

export type Dict = Strings;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  tc: (cat: string) => string;
}>({
  lang: "bn",
  setLang: () => {},
  t: dict.bn,
  tc: (c) => c,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

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
