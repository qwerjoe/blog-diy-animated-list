import {
  Children,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { PresenceChild } from "./PresenceChild";

type PresenceTrackedChild = {
  element: ReactElement;
  isPresent: boolean;
};

export function AnimPresence({ children: _children }: PropsWithChildren) {
  const children = useMemo(() => filterElements(_children), [_children]);

  const [trackedChildren, setTrackedChildren] = useState(
    convertToTracked(children),
  );

  const childrenChanged = useChangeDetection(children);
  if (childrenChanged) {
    const newTrackedChildren = mergeChildrenLists(trackedChildren, children);
    setTrackedChildren(newTrackedChildren);
  }

  return trackedChildren.map(({ element, isPresent }) => {
    const optionalKey = element.key;
    if (optionalKey === null) {
      return element;
    }

    const key = optionalKey;

    return (
      <PresenceChild
        key={key}
        isPresent={isPresent}
        onSafeToRemove={() => {
          setTrackedChildren((children) =>
            children.filter(
              (child) => child.element.key !== key || child.isPresent,
            ),
          );
        }}
      >
        {element}
      </PresenceChild>
    );
  });
}

function convertToTracked(children: ReactElement[]): PresenceTrackedChild[] {
  return children.map((child) => ({
    element: child,
    isPresent: true,
  }));
}

function mergeChildrenLists(
  oldTrackedChildren: PresenceTrackedChild[],
  newChildren: ReactElement[],
) {
  const childrenKeys = nonNullElementKeys(newChildren);
  const newTrackedChildren = convertToTracked(newChildren);
  oldTrackedChildren.forEach((oldTracked, index) => {
    const key = oldTracked.element.key;
    if (key !== null) {
      if (!childrenKeys.includes(key)) {
        newTrackedChildren.splice(index, 0, {
          ...oldTracked,
          isPresent: false,
        });
      }
    }
  });

  return newTrackedChildren;
}

function filterElements(node: ReactNode) {
  const elements: ReactElement[] = [];
  Children.forEach(node, (child) => {
    if (isValidElement(child)) {
      elements.push(child);
    }
  });
  return elements;
}

function nonNullElementKeys(elements: ReactElement[]) {
  return elements.filter((el) => el.key !== null).map((el) => el.key);
}

function useChangeDetection<T>(value: T) {
  const prevRef = useRef<T>(value);
  const changed = prevRef.current !== value;
  prevRef.current = value;
  return changed;
}
