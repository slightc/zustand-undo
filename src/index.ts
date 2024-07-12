import type {
  Mutate,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
  UseBoundStore,
} from "zustand";
import { create as createStore } from "zustand";
import { createHistoryStore } from "./history";
import { StoreHistoryConfig } from "./types";

/**
 * create zustand store with history support
 * @param initializer
 * @param config history config
 */
export function createStoreWithHistory<
  T,
  Mos extends [StoreMutatorIdentifier, unknown][] = []
>(initializer: StateCreator<T, [], Mos>, config?: Partial<StoreHistoryConfig>) {
  const create = (config?.create ?? createStore) as typeof createStore<T, Mos>;

  // wrap with history store
  const api = create((set, get, api) => {
    const historyStore = createHistoryStore(
      { getState: get, setState: set }, // keep current set/get api
      config
    );

    // override history store to current api
    (api as any).history = historyStore;
    (api as any).useHistory = historyStore;

    api.setState = (updater, ...a) => {
      const cur = get();
      const next =
        typeof updater === "function"
          ? (updater as (state: T) => T | Partial<T>)(cur)
          : updater;
      const res = set(next, ...a);

      // when setState, push current state to history,
      // in push function, will handle throttle, grouping, filtering
      historyStore.getState().push(cur);
      return res;
    };

    return initializer(api.setState, get, api);
  });

  return api as UseBoundStore<Mutate<StoreApi<T>, Mos>> & {
    history: ReturnType<typeof createHistoryStore<T>>;
    useHistory: ReturnType<typeof createHistoryStore<T>>;
  };
}
