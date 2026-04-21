import { useT } from "./i18n";

type S = {
  budgetTitle: string;
  budgetSub: string;
  savingsTitle: string;
  savingsSub: string;
  dpsTitle: string;
  dpsSub: string;
  marketTitle: string;
  marketSub: string;
  medicineTitle: string;
  medicineSub: string;
  billsTitle: string;
  billsSub: string;
  reportTitle: string;
  reportSub: string;
  investmentTitle: string;
  investmentSub: string;
  assetTitle: string;
  assetSub: string;
  familyTitle: string;
  familySub: string;
  notifTitle: string;
  notifEmpty: string;

  monthly: string;
  spent: string;
  limit: string;
  goal: string;
  target: string;
  progress: string;
  contribute: string;
  add: string;
  saveBtn: string;
  delete: string;
  cancel: string;
  remaining: string;
  paid: string;
  unpaid: string;
  due: string;
  bought: string;
  taken: string;
  qty: string;
  dose: string;
  bank: string;
  months: string;
  totalValue: string;
  type: string;
  shop: string;
  amount: string;
  credit: string;
  paidLabel: string;
  noEntries: string;
  exportDone: string;
  signedOut: string;
  deletedAll: string;
  confirmDelete: string;
  totalIncomeLabel: string;
  totalExpenseLabel: string;
  netLabel: string;
  byCategory: string;
  noData: string;
  relation: string;
  member: string;
  members: string;
  monthlyEMI: string;
  matureValue: string;
};

const en: S = {
  budgetTitle: "Budgets",
  budgetSub: "Set monthly limits per category",
  savingsTitle: "Savings goals",
  savingsSub: "Track your saving targets",
  dpsTitle: "DPS",
  dpsSub: "Deposit Pension Scheme tracker",
  marketTitle: "Market list",
  marketSub: "Today's shopping list",
  medicineTitle: "Medicine",
  medicineSub: "Daily medicine reminder",
  billsTitle: "Bills",
  billsSub: "Recurring bill reminders",
  reportTitle: "Report",
  reportSub: "Income vs expense breakdown",
  investmentTitle: "Investments",
  investmentSub: "Track stocks, FD, business",
  assetTitle: "Asset vault",
  assetSub: "Gold, land, vehicles, etc.",
  familyTitle: "Family",
  familySub: "Manage family members",
  notifTitle: "Notifications",
  notifEmpty: "No notifications yet",

  monthly: "Monthly",
  spent: "Spent",
  limit: "Limit",
  goal: "Goal",
  target: "Target",
  progress: "Progress",
  contribute: "Add contribution",
  add: "Add",
  saveBtn: "Save",
  delete: "Delete",
  cancel: "Cancel",
  remaining: "Remaining",
  paid: "Paid",
  unpaid: "Unpaid",
  due: "Due day",
  bought: "Bought",
  taken: "Taken",
  qty: "Quantity",
  dose: "Dose",
  bank: "Bank / Institution",
  months: "Months",
  totalValue: "Total value",
  type: "Type",
  shop: "Shop name",
  amount: "Amount",
  credit: "Credit (took on tab)",
  paidLabel: "Paid back",
  noEntries: "No entries yet — tap + to add",
  exportDone: "Data exported (downloaded)",
  signedOut: "Signed out",
  deletedAll: "All data deleted",
  confirmDelete: "Are you sure? This cannot be undone.",
  totalIncomeLabel: "Total income",
  totalExpenseLabel: "Total expense",
  netLabel: "Net",
  byCategory: "By category",
  noData: "No data to show",
  relation: "Relation",
  member: "Member",
  members: "members",
  monthlyEMI: "Monthly",
  matureValue: "Matures to",
};

const bn: S = {
  budgetTitle: "বাজেট",
  budgetSub: "ক্যাটাগরি অনুযায়ী মাসিক সীমা",
  savingsTitle: "সঞ্চয় লক্ষ্য",
  savingsSub: "আপনার সঞ্চয়ের লক্ষ্য ট্র্যাক করুন",
  dpsTitle: "ডিপিএস",
  dpsSub: "ডিপোজিট পেনশন স্কিম",
  marketTitle: "বাজার তালিকা",
  marketSub: "আজকের বাজারের লিস্ট",
  medicineTitle: "ঔষধ",
  medicineSub: "দৈনিক ঔষধ রিমাইন্ডার",
  billsTitle: "বিল",
  billsSub: "নিয়মিত বিল রিমাইন্ডার",
  reportTitle: "রিপোর্ট",
  reportSub: "আয় ও ব্যয়ের বিশ্লেষণ",
  investmentTitle: "বিনিয়োগ",
  investmentSub: "শেয়ার, এফডি, ব্যবসা ট্র্যাক",
  assetTitle: "সম্পদ ভল্ট",
  assetSub: "স্বর্ণ, জমি, গাড়ি ইত্যাদি",
  familyTitle: "পরিবার",
  familySub: "পরিবারের সদস্য পরিচালনা",
  notifTitle: "নোটিফিকেশন",
  notifEmpty: "এখনো কোনো নোটিফিকেশন নেই",

  monthly: "মাসিক",
  spent: "খরচ",
  limit: "সীমা",
  goal: "লক্ষ্য",
  target: "টার্গেট",
  progress: "অগ্রগতি",
  contribute: "জমা যোগ",
  add: "যোগ",
  saveBtn: "সংরক্ষণ",
  delete: "মুছুন",
  cancel: "বাতিল",
  remaining: "বাকি",
  paid: "পরিশোধিত",
  unpaid: "অপরিশোধিত",
  due: "প্রতি মাসের",
  bought: "কেনা হয়েছে",
  taken: "খাওয়া হয়েছে",
  qty: "পরিমাণ",
  dose: "ডোজ",
  bank: "ব্যাংক / প্রতিষ্ঠান",
  months: "মাস",
  totalValue: "মোট মূল্য",
  type: "ধরণ",
  shop: "দোকানের নাম",
  amount: "টাকা",
  credit: "বাকি নিয়েছি",
  paidLabel: "পরিশোধ করেছি",
  noEntries: "কোনো এন্ট্রি নেই — + চাপুন",
  exportDone: "ডাটা এক্সপোর্ট হয়েছে",
  signedOut: "সাইন আউট হয়েছে",
  deletedAll: "সমস্ত ডাটা মুছে ফেলা হয়েছে",
  confirmDelete: "আপনি কি নিশ্চিত? এটা পূর্বাবস্থায় ফেরানো যাবে না।",
  totalIncomeLabel: "মোট আয়",
  totalExpenseLabel: "মোট খরচ",
  netLabel: "নীট",
  byCategory: "ক্যাটাগরি অনুযায়ী",
  noData: "কোনো তথ্য নেই",
  relation: "সম্পর্ক",
  member: "সদস্য",
  members: "সদস্য",
  monthlyEMI: "মাসিক",
  matureValue: "মেয়াদান্তে",
};

export function useTx() {
  const { lang } = useT();
  return lang === "bn" ? bn : en;
}
