import { create as createStore } from "zustand";
import { mixin } from "./utils";
import { StoreHistory, StoreHistoryConfig } from "./types";

/**
 * create history store
 * @param baseStore take get/set the from this store
 * @param config history config
 * @returns the store with history util api
 */
export function createHistoryStore<T>(
  baseStore: {
    getState: () => T;
    setState: (state: T) => void;
  },
  config?: Partial<StoreHistoryConfig>
) {
  const { getState: get, setState: set } = baseStore;
  const historyConfig: StoreHistoryConfig = {
    maxLength: 20,
    throttle: 0,
    ...config,
  };
  const historyState = {
    grouping: false,
    filtering: false,
    throttling: false,
    groupingState: null as null | T,
  };
  const historyStore = createStore<StoreHistory<T>>(
    (setHistory, getHistory) => {
      function gotoHistory(step: number) {
        const { past, future } = getHistory();
        let current = get();
        const all = [...past, get(), ...future];

        const target = Math.max(
          0,
          Math.min(past.length + step, all.length - 1)
        );
        current = all[target];

        set(current);
        setHistory({
          past: all.slice(0, target),
          future: all.slice(target + 1),
        });
      }
      return {
        /**
         * store the past state [old ... new]
         */
        past: [],
        /**
         * store the future state [old ... new]
         */
        future: [],
        redo: (step = 1) => {
          if (step < 1) {
            return;
          }
          if (!getHistory().future.length) {
            return;
          }
          gotoHistory(step);
        },
        undo: (step = 1) => {
          if (step < 1) {
            return;
          }
          if (!getHistory().past.length) {
            return;
          }
          gotoHistory(-step);
        },
        push: (data) => {
          // if when grouping, just store the state,
          // that will be the state when grouping end
          if (historyState.grouping) {
            historyState.groupingState = historyState.groupingState || data;
            return;
          }
          // if throttling, just ignore
          if (historyState.throttling) {
            return;
          }
          // if enable throttle, set throttling flag
          if (historyConfig.throttle) {
            historyState.throttling = true;
            setTimeout(() => {
              historyState.throttling = false;
            }, historyConfig.throttle);
          }

          // if enable filtering, just merge the state to last state,
          // not increase the past list length
          if (historyState.filtering) {
            setHistory({
              past: [...getHistory().past.slice(0, -1), data],
              future: [],
            });
            return;
          }

          // push the state to history
          setHistory({
            past: [...getHistory().past.slice(), data].slice(
              -1 * historyConfig.maxLength
            ),
            future: [],
          });
        },
        clear: () => {
          setHistory({
            past: [],
            future: [],
          });
        },
      };
    }
  );

  function groupHistory(fn: () => void) {
    try {
      historyState.grouping = true;
      fn();
    } finally {
      historyState.grouping = false;
      if (historyState.groupingState) {
        historyStore.getState().push(historyState.groupingState);
        historyState.groupingState = null;
      }
    }
  }

  function filterHistory(fn: () => void) {
    try {
      historyState.filtering = true;
      fn();
    } finally {
      historyState.filtering = false;
    }
  }

  return mixin(historyStore, {
    group: groupHistory,
    filter: filterHistory,
  });
}
