import { AnimationOptions, Properties } from "./types";

const kAnimationProperties = ["translate", "opacity"] as const;
type AnimationProperty = (typeof kAnimationProperties)[number];

type AnimationTarget = {
  [p in AnimationProperty]?: string;
} & {
  options?: AnimationOptions;
};

type LayoutProperties = {
  top: number;
  left: number;
};

const kGlobalAnimationOptions: Required<AnimationOptions> = {
  duration: 200,
  easing: "ease-out",
};

function toAnimationTarget(target: Partial<Properties>) {
  const animTarget: AnimationTarget = {};

  if (target.x !== undefined || target.y !== undefined) {
    animTarget.translate = `${target.x ?? 0}px ${target.y ?? 0}px`;
  }

  if (target.opacity !== undefined) {
    animTarget.opacity = String(target.opacity);
  }

  return animTarget;
}

export class AnimNode {
  private isMounted: boolean = false;
  private domElement?: HTMLElement | null;

  private defaultAnimationOptions: AnimationOptions = kGlobalAnimationOptions;
  private animationTarget: AnimationTarget = {};

  private prev: {
    layout?: LayoutProperties;
    target: AnimationTarget;
  } = { target: {} };

  private animations: Set<Animation> = new Set();
  private onFinishedAnimating?: () => void;
  private dirtyFinishedAnimatingCallback = false;

  setDomElement(element: HTMLElement | null) {
    this.domElement = element;
  }

  animateTo(target: Partial<Properties>, options?: AnimationOptions) {
    this.animationTarget = {
      ...toAnimationTarget(target),
      options,
    };
  }

  setDefaultOptions(options: AnimationOptions) {
    this.defaultAnimationOptions = options;
  }

  setFinishedAnimatingCallback(callback?: () => void) {
    this.onFinishedAnimating = callback;
    this.dirtyFinishedAnimatingCallback = true;
  }

  beforeUpdate() {
    if (this.domElement && this.isMounted) {
      this.prev = {
        layout: calcLayoutProperties(this.domElement),
        target: this.animationTarget,
      };
    }
  }

  afterUpdate() {
    if (!this.domElement || !this.isMounted) {
      return;
    }

    if (this.prev.target !== this.animationTarget) {
      this.handleTargetChange();
    }

    const layout = calcLayoutProperties(this.domElement);
    if (this.prev.layout && hasLayoutChanged(this.prev.layout, layout)) {
      this.handleLayoutChange(this.prev.layout, layout);
    }

    if (this.dirtyFinishedAnimatingCallback) {
      this.dirtyFinishedAnimatingCallback = false;
      if (this.onFinishedAnimating && this.animations.size === 0) {
        this.onFinishedAnimating();
      }
    }
  }

  private handleLayoutChange(
    prevLayout: LayoutProperties,
    layout: LayoutProperties,
  ) {
    if (!this.domElement) {
      return;
    }

    const delta = {
      top: prevLayout.top - layout.top,
      left: prevLayout.left - layout.left,
    };

    const translateFrom = `${delta.left}px ${delta.top}px`;
    const translateTo = "0px 0px";

    const animation = this.domElement.animate(
      [{ translate: translateFrom }, { translate: translateTo }],
      {
        duration:
          this.defaultAnimationOptions.duration ??
          kGlobalAnimationOptions.duration,
        easing:
          this.defaultAnimationOptions.easing ?? kGlobalAnimationOptions.easing,
        composite: "add",
        fill: "both",
      },
    );

    this.registerAnimation(animation, false);
  }

  private handleTargetChange() {
    const target = this.animationTarget;
    const prevTarget = this.prev.target;

    kAnimationProperties.forEach((property) => {
      const targetValue = target[property];
      const prevTargetValue = prevTarget[property];

      if (targetValue !== undefined) {
        if (prevTargetValue === undefined || targetValue !== prevTargetValue) {
          this.animateProperty(property, targetValue, target.options);
        }
      } else {
        // skip
      }
    });
  }

  private animateProperty(
    property: AnimationProperty,
    to: string,
    { duration, easing }: AnimationOptions = {},
  ) {
    if (!this.domElement) {
      return;
    }

    const animation = this.domElement.animate(
      { [property]: to },
      {
        duration:
          duration ??
          this.defaultAnimationOptions.duration ??
          kGlobalAnimationOptions.duration,
        easing:
          easing ??
          this.defaultAnimationOptions.easing ??
          kGlobalAnimationOptions.easing,
        composite: "replace",
        fill: "forwards",
      },
    );

    this.registerAnimation(animation);
  }

  private registerAnimation(animation: Animation, shouldCommitStyles = true) {
    this.animations.add(animation);

    animation.addEventListener("finish", () => {
      if (shouldCommitStyles) {
        this.commitAnimationStyles(animation);
      }
      this.removeAnimation(animation);
    });

    const removeAnimation = this.removeAnimation.bind(this, animation);
    animation.addEventListener("cancel", removeAnimation);
    animation.addEventListener("remove", removeAnimation);
  }

  private removeAnimation(animation: Animation) {
    animation.cancel();
    this.animations.delete(animation);
    if (this.animations.size === 0 && this.onFinishedAnimating) {
      this.onFinishedAnimating();
    }
  }

  private commitAnimationStyles(animation: Animation) {
    if (this.isMounted && this.domElement) {
      animation.commitStyles();
    }
  }

  mount(initialValues: Partial<Properties> = {}) {
    this.isMounted = true;

    if (!this.domElement) {
      throw new Error("AnimNode: mounting without a dom element");
    }

    const initialAnimationValues = toAnimationTarget(initialValues);
    kAnimationProperties.forEach((property) => {
      if (initialAnimationValues[property] !== undefined) {
        this.domElement!.style[property] = initialAnimationValues[property];
      }
    });

    this.prev.target = initialAnimationValues;
  }

  unmount() {
    this.isMounted = false;
    this.prev = { target: {} };
    this.animationTarget = {};
    for (const animation of this.animations.values()) {
      animation.cancel();
    }
    this.animations.clear();
  }
}

function calcLayoutProperties(element: HTMLElement): LayoutProperties {
  return {
    left: element.offsetLeft,
    top: element.offsetTop,
  };
}

function hasLayoutChanged(prev: LayoutProperties, current: LayoutProperties) {
  return prev.left !== current.left || prev.top !== current.top;
}
