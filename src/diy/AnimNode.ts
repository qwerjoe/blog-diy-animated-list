import { AnimationOptions } from "./types";

type LayoutProperties = {
  top: number;
  left: number;
};

const kGlobalAnimationOptions: Required<AnimationOptions> = {
  duration: 200,
  easing: "ease-out",
};

export class AnimNode {
  private isMounted: boolean = false;
  private domElement?: HTMLElement | null;

  private prevLayout?: LayoutProperties;

  private animations: Set<Animation> = new Set();

  setDomElement(element: HTMLElement | null) {
    this.domElement = element;
  }

  beforeUpdate() {
    if (this.domElement && this.isMounted) {
      this.prevLayout = calcLayoutProperties(this.domElement);
    }
  }

  afterUpdate() {
    if (!this.domElement || !this.isMounted) {
      return;
    }

    if (!this.prevLayout) {
      // first update -- fade in object
      const animation = this.domElement.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: kGlobalAnimationOptions.duration,
          easing: kGlobalAnimationOptions.easing,
          composite: "replace",
          fill: "both",
        },
      );

      this.registerAnimation(animation);
    }

    const layout = calcLayoutProperties(this.domElement);
    if (this.prevLayout && hasLayoutChanged(this.prevLayout, layout)) {
      this.handleLayoutChange(this.prevLayout, layout);
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

    const transformFrom = `${delta.left}px ${delta.top}px`;
    const transformTo = "0px 0px";

    const animation = this.domElement.animate(
      [{ translate: transformFrom }, { translate: transformTo }],
      {
        duration: kGlobalAnimationOptions.duration,
        easing: kGlobalAnimationOptions.easing,
        composite: "add",
        fill: "both",
      },
    );

    this.registerAnimation(animation);
  }

  private registerAnimation(animation: Animation) {
    this.animations.add(animation);

    const removeAnimation = this.removeAnimation.bind(this, animation);
    animation.addEventListener("finish", removeAnimation);
    animation.addEventListener("cancel", removeAnimation);
    animation.addEventListener("remove", removeAnimation);
  }

  private removeAnimation(animation: Animation) {
    animation.cancel();
    this.animations.delete(animation);
  }

  mount() {
    this.isMounted = true;

    if (!this.domElement) {
      throw new Error("AnimNode: mounting without a dom element");
    }
  }

  unmount() {
    this.isMounted = false;
    this.prevLayout = undefined;
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
