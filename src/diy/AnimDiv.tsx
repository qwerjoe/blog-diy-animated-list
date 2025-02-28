import { ComponentProps, useLayoutEffect, useRef } from "react";
import { AnimNode } from "./AnimNode";
import { Properties, AnimationOptions } from "./types";
import { usePresence } from "./PresenceChild";

export type Animation = Partial<Properties> & {
  options?: AnimationOptions;
};

type AnimDivOwnProps = {
  initial?: Animation;
  animate?: Animation;
  exit?: Animation;
  options?: AnimationOptions;
};

export type AnimDivProps = ComponentProps<"div"> & AnimDivOwnProps;

export function AnimDiv({
  initial,
  animate,
  exit,
  options,
  ...divProps
}: AnimDivProps) {
  const { domRef } = useAnimNode({ initial, animate, exit, options });
  return <div {...divProps} ref={domRef} />;
}

type UseAnimNodeParams = AnimDivOwnProps;

function useAnimNode({ initial, animate, exit, options }: UseAnimNodeParams) {
  const animNodeRef = useRef<AnimNode>(new AnimNode());
  const animNode = animNodeRef.current;
  const target = useRef<Animation>(undefined);

  animNode.beforeUpdate();

  const { isPresent, safeToRemove } = usePresence();

  useLayoutEffect(() => {
    animNode.mount(initial);
    return () => {
      target.current = undefined;
      animNode.unmount();
    };
  }, []);

  useLayoutEffect(() => {
    animNode.setDefaultOptions(options ?? {});
  }, [options]);

  useLayoutEffect(() => {
    if (isPresent && target.current !== animate) {
      target.current = animate;
      animNode.animateTo(target.current ?? {}, target.current?.options);
    } else if (!isPresent && target.current !== exit) {
      target.current = exit;
      animNode.animateTo(target.current ?? {}, target.current?.options);
      animNode.setFinishedAnimatingCallback(() => {
        safeToRemove();
      });
    }

    return () => {
      animNode.setFinishedAnimatingCallback(undefined);
    };
  }, [isPresent, animate, exit]);

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
