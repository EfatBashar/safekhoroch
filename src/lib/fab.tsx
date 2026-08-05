import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type FabAction = (() => void) | null;

type FabCtx = {
  action: FabAction;
  setAction: (fn: FabAction) => void;
};

const Ctx = createContext<FabCtx>({ action: null, setAction: () => {} });

export function FabProvider({ children }: { children: ReactNode }) {
  const [action, setActionState] = useState<FabAction>(null);
  const setAction = useCallback((fn: FabAction) => {
    setActionState(() => fn);
  }, []);
  const value = useMemo(() => ({ action, setAction }), [action, setAction]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFab() {
  return useContext(Ctx);
}

/** Register a page-specific action for the global FAB (+) button. */
export function useRegisterFab(handler: () => void) {
  const { setAction } = useFab();
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    setAction(() => ref.current());
    return () => setAction(null);
  }, [setAction]);
}
