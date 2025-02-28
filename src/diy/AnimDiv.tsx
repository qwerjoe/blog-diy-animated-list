import { ComponentProps, useLayoutEffect, useRef } from "react";
import { AnimNode } from "./AnimNode";

export type AnimDivProps = ComponentProps<"div">;

export function AnimDiv({ ...divProps }: AnimDivProps) {
  const { domRef } = useAnimNode();
  return <div {...divProps} ref={domRef} />;
}

function useAnimNode() {
  const animNodeRef = useRef<AnimNode>(new AnimNode());
  const animNode = animNodeRef.current;
  const target = useRef<Animation>(undefined);

  animNode.beforeUpdate();

  useLayoutEffect(() => {
    animNode.mount();
    return () => {
      target.current = undefined;
      animNode.unmount();
    };
  }, []);

  useLayoutEffect(() => {
    animNode.afterUpdate();
  }, undefined);

  return {
    animNode,
    domRef: (el: HTMLDivElement) => {
      animNode.setDomElement(el);
    },
  };
}
