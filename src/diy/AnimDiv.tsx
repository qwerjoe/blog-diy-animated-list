import { ComponentProps, useLayoutEffect, useRef } from "react";
import { AnimNode } from "./AnimNode";
import { Properties, AnimationOptions } from "./types";

export type Animation = Partial<Properties> & {
  options?: AnimationOptions;
};

type AnimDivOwnProps = {
  initial?: Animation;
  animate?: Animation;
  options?: AnimationOptions;
};

export type AnimDivProps = ComponentProps<"div"> & AnimDivOwnProps;

export function AnimDiv({
  initial,
  animate,
  options,
  ...divProps
}: AnimDivProps) {
  const { domRef } = useAnimNode({ initial, animate, options });
  return <div {...divProps} ref={domRef} />;
}

type UseAnimNodeParams = AnimDivOwnProps;

function useAnimNode({ initial, animate, options }: UseAnimNodeParams) {
  const animNodeRef = useRef<AnimNode>(new AnimNode());
  const animNode = animNodeRef.current;

  animNode.beforeUpdate();

  useLayoutEffect(() => {
    animNode.mount(initial);
    return () => {
      animNode.unmount();
    };
  }, []);

  useLayoutEffect(() => {
    animNode.setDefaultOptions(options ?? {});
  }, [options]);

  useLayoutEffect(() => {
    animNode.animateTo(animate ?? {}, animate?.options);
  }, [animate]);

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
