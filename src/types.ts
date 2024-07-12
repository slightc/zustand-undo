import type { StoreApi, create } from "zustand";

export type StoreHistory<T> = {
  past: T[];
  future: T[];
  redo: (step?: number) => void;
  undo: (step?: number) => void;
  push: (data: T) => void;
  clear: () => void;
};

export type StoreHistoryApi<T> = {
  store: StoreApi<StoreHistory<T>>;
  group: (fn: () => void) => void;
  filter: (fn: () => void) => void;
};

export type StoreHistoryConfig = {
  maxLength: number;
  throttle: number;
  create?: typeof create;
};
