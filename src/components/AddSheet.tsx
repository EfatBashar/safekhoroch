import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Account,
  type LoanType,
  type TxType,
} from "@/lib/types";
import { newId, store } from "@/lib/store";
import { categoryStore } from "@/lib/listStore";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useTx } from "@/lib/i18nExtra";
import { Plus } from "lucide-react";

export function AddSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useT();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-t-0 p-0"
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl">{t.addNew}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="tx" className="px-6 pb-8 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tx">{t.transaction}</TabsTrigger>
            <TabsTrigger value="loan">{t.debtLoan}</TabsTrigger>
          </TabsList>
          <TabsContent value="tx" className="mt-4">
            <TxForm onDone={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="loan" className="mt-4">
            <LoanForm onDone={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function TxForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState<Account>("cash");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const { t, tc } = useT();
  const x = useTx();
  const customCats = categoryStore.use();
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const builtIn = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const custom = customCats.filter((c) => c.type === type).map((c) => c.name);
  const cats = [...builtIn.filter((c) => c !== "Other"), ...custom, "Other"];

  const confirmNewCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (cats.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setCategory(name);
      setAddingCategory(false);
      setNewCategoryName("");
      return;
    }
    categoryStore.add({ id: newId(), name, type });
    setCategory(name);
    setAddingCategory(false);
    setNewCategoryName("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error(t.enterValidAmount);
    if (!category) return toast.error(t.pickCategory);
    store.addTransaction({
      id: newId(),
      source: "manual",
      type,
      amount: n,
      category,
      account,
      note: note || undefined,
      date: new Date(date).toISOString(),
    });
    toast.success(type === "income" ? t.incomeAdded : t.expenseAdded);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategory("");
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "expense" ? "bg-expense text-expense-foreground" : "text-muted-foreground"}`}
        >
          {t.expense}
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategory("");
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "income" ? "bg-income text-income-foreground" : "text-muted-foreground"}`}
        >
          {t.income}
        </button>
      </div>

      <div>
        <Label htmlFor="amt">{t.amount}</Label>
        <Input
          id="amt"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t.category}</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t.pick} />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c} value={c}>
                  {custom.includes(c) ? c : tc(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t.account}</Label>
          <Select value={account} onValueChange={(v) => setAccount(v as Account)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">{t.cash}</SelectItem>
              <SelectItem value="bank">{t.bank}</SelectItem>
              <SelectItem value="bkash">{t.bkash}</SelectItem>
              <SelectItem value="nagad">{t.nagad}</SelectItem>
              <SelectItem value="rocket">{t.rocket}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {addingCategory ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={t.category}
            className="h-10 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmNewCategory();
              }
            }}
          />
          <Button type="button" size="sm" className="h-10" onClick={confirmNewCategory}>
            {t.save}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-10"
            onClick={() => {
              setAddingCategory(false);
              setNewCategoryName("");
            }}
          >
            {x.cancel}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingCategory(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> {t.category}
        </button>
      )}

      <div>
        <Label htmlFor="date">{t.date}</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="note">{t.noteOptional}</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="h-12 w-full text-base">
        {t.save}
      </Button>
    </form>
  );
}

function LoanForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<LoanType>("lend");
  const [person, setPerson] = useState("");
  const [account, setAccount] = useState<Account>("cash");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const { t } = useT();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!person.trim()) return toast.error(t.enterName);
    if (!n || n <= 0) return toast.error(t.enterValidAmount);
    store.addLoan({
      id: newId(),
      type,
      person: person.trim(),
      amount: n,
      date: new Date(date).toISOString(),
      note: note || undefined,
      settled: false,
      account,
    });
    toast.success(t.saved);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        <button
          type="button"
          onClick={() => setType("lend")}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "lend" ? "bg-loan text-loan-foreground" : "text-muted-foreground"}`}
        >
          {t.iLent}
        </button>
        <button
          type="button"
          onClick={() => setType("borrow")}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "borrow" ? "bg-debt text-debt-foreground" : "text-muted-foreground"}`}
        >
          {t.iBorrowed}
        </button>
      </div>

      <div>
        <Label>{t.person}</Label>
        <Input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder={t.name}
          className="mt-1"
        />
      </div>
      <div>
        <Label>{t.amount}</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{t.date}</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{t.account}</Label>
          <Select value={account} onValueChange={(v) => setAccount(v as Account)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">{t.cash}</SelectItem>
              <SelectItem value="bank">{t.bank}</SelectItem>
              <SelectItem value="bkash">{t.bkash}</SelectItem>
              <SelectItem value="nagad">{t.nagad}</SelectItem>
              <SelectItem value="rocket">{t.rocket}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>{t.note}</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="h-12 w-full text-base">
        {t.save}
      </Button>
    </form>
  );
}
