import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Plus, Check, Trash2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterFab } from "@/lib/fab";

type Task = { id: string; text: string; done: boolean; createdAt: string };
const KEY = "etracker.tasks.v1";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "করণীয় — হাত-খরচ" },
      { name: "description", content: "আপনার দৈনন্দিন কাজের তালিকা।" },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { t } = useT();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useRegisterFab(() => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus();
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Task[]) => {
    setTasks(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const uid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  const add = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    persist([
      { id: uid(), text: input.trim(), done: false, createdAt: new Date().toISOString() },
      ...tasks,
    ]);
    setInput("");
  };

  const toggle = (id: string) =>
    persist(tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => persist(tasks.filter((x) => x.id !== id));

  const pending = tasks.filter((x) => !x.done);
  const done = tasks.filter((x) => x.done);

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-xl font-bold">{t.tasksTitle}</h1>
      <p className="text-xs text-muted-foreground">{t.tasksSub}</p>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.taskPlaceholder}
          className="h-12 rounded-xl"
        />
        <Button
          type="submit"
          disabled={!input.trim()}
          onClick={(e) => {
            e.preventDefault();
            add();
          }}
          className="h-12 rounded-xl bg-primary px-4"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      {tasks.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListChecks className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <p className="mt-4 font-display text-lg font-bold">{t.noTasksTitle}</p>
          <p className="text-sm text-muted-foreground">{t.noTasksSub}</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.pending}
              </p>
              <ul className="space-y-2">
                {pending.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggle} onDelete={remove} />
                ))}
              </ul>
            </div>
          )}
          {done.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t.done}
              </p>
              <ul className="space-y-2">
                {done.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggle} onDelete={remove} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
      <button
        onClick={() => onToggle(task.id)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
          task.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
        aria-label="toggle"
      >
        {task.done && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <span
        className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground active:text-destructive"
        aria-label="delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
