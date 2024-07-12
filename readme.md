# zustand-undo

motive to create a simple, type friendly and easy-to-use undo/redo stack for your zustand store

here is a simple example of how to use it
```tsx
import { createStoreWithHistory } from 'zustand-undo'

const useStore = createStoreWithHistory<{ count: number; increment: () => void }>(
  (set) => {
    return {
      count: 0,
      increment: () => {
        set((state) => ({
          count: state.count + 1,
        }));
      },
    };
  }
);

function App() {
  const store = useStore();
  const history = useStore.useHistory();

  return (
    <>
      <div>
        <pre>json: {JSON.stringify(store)}</pre>
        <button onClick={() => store.increment()}>inc</button>
        <button
          onClick={() => {
            useStore.history.group(() => {
              store.increment();
              store.increment();
              store.increment();
            });
          }}
        >
          inc3
        </button>
        <button onClick={() => history.undo()}>
          undo({history.past.length})
        </button>
        <button onClick={() => history.redo()}>
          redo({history.future.length})
        </button>
      </div>
    </>
  );
}

```