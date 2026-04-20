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
import { store } from "@/lib/store";
import { toast } from "sonner";

export function AddSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl border-t-0 p-0"
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl">Add new</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="tx" className="px-6 pb-8 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tx">Transaction</TabsTrigger>
            <TabsTrigger value="loan">Debt / Loan</TabsTrigger>
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

  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    if (!category) return toast.error("Pick a category");
    store.addTransaction({
      id: crypto.randomUUID(),
      type,
      amount: n,
      category,
      account,
      note: note || undefined,
      date: new Date(date).toISOString(),
    });
    toast.success(`${type === "income" ? "Income" : "Expense"} added`);
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
          Expense
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategory("");
          }}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "income" ? "bg-income text-income-foreground" : "text-muted-foreground"}`}
        >
          Income
        </button>
      </div>

      <div>
        <Label htmlFor="amt">Amount</Label>
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
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Pick" />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Account</Label>
          <Select value={account} onValueChange={(v) => setAccount(v as Account)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="h-12 w-full text-base">
        Save
      </Button>
    </form>
  );
}

function LoanForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<LoanType>("lend");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!person.trim()) return toast.error("Enter a name");
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    store.addLoan({
      id: crypto.randomUUID(),
      type,
      person: person.trim(),
      amount: n,
      date: new Date(date).toISOString(),
      note: note || undefined,
      settled: false,
    });
    toast.success("Saved");
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
          I Lent
        </button>
        <button
          type="button"
          onClick={() => setType("borrow")}
          className={`rounded-lg py-2 text-sm font-semibold transition ${type === "borrow" ? "bg-debt text-debt-foreground" : "text-muted-foreground"}`}
        >
          I Borrowed
        </button>
      </div>

      <div>
        <Label>Person</Label>
        <Input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="Name"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 h-14 text-2xl font-bold"
        />
      </div>
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Note</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="h-12 w-full text-base">
        Save
      </Button>
    </form>
  );
}
