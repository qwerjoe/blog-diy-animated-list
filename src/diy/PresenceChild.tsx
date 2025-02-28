import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";

type PresenceChildContextValue = {
  isPresent: boolean;
  onSafeToRemove: () => void;
  preventImmediateRemoval: () => void;
};

const PresenceChildContext = createContext<
  PresenceChildContextValue | undefined
>(undefined);

type PresenceChildProps = PropsWithChildren & {
  isPresent: boolean;
  onSafeToRemove: () => void;
};

export function PresenceChild({
  children,
  onSafeToRemove,
  isPresent,
}: PresenceChildProps) {
  // will be set to true when a component in the subtree uses the `usePresence` hook
  const isRemovalDeferred = useRef(false);

  const contextValue = {
    onSafeToRemove,
    isPresent,
    preventImmediateRemoval: () => (isRemovalDeferred.current = true),
  };

  useEffect(() => {
    if (!isPresent && !isRemovalDeferred.current) {
      onSafeToRemove();
    }
  }, [isPresent, onSafeToRemove]);

  return (
    <PresenceChildContext.Provider value={contextValue}>
      {children}
    </PresenceChildContext.Provider>
  );
}

type UsePresenceResult = {
  isPresent: boolean;
  safeToRemove: () => void;
};

export function usePresence(): UsePresenceResult {
  const context = useContext(PresenceChildContext);
  if (!context) {
    // It's completly valid to use this hook without <AnimPresence> wrapper
    // in that case nothing will defer the unmouning of the element,
    // so isPresent can always be true, and safeToRemove is a no-op.
    return {
      isPresent: true,
      safeToRemove: () => {},
    };
  }

  // when a component uses this hook we can assume that it will handle the removal process
  // and eventualy it will call safeToRemove at some point
  context.preventImmediateRemoval();
  return {
    isPresent: context?.isPresent,
    safeToRemove: context.onSafeToRemove.bind(context),
  };
}
