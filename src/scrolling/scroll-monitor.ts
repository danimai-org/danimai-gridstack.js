import throttle from "lodash.throttle";
import { intBetween, getCoords } from "./util";
import type { Options } from "./index";
import raf from "./raf";
import { Utils } from "../gridstack";

export default class ScrollingMonitor {
  container: HTMLElement;
  eventBody: HTMLBodyElement;
  scaleX: number;
  scaleY: number;
  attached: boolean;
  frame: null | number;
  mobileView: boolean;

  constructor(private el: HTMLElement, private options: Options) {
    const mobileMode = document.body.getAttribute("mobile-mode") === "true";
    this.mobileView = document.body.getAttribute("mobile-view") === "true";

    this.container =
      mobileMode && !this.mobileView
        ? Utils.getScrollElement(el)
        : (document.scrollingElement as HTMLElement);
    this.eventBody = this.container.ownerDocument.body as HTMLBodyElement;
    this.options = options;
    this.scaleX = 0;
    this.scaleY = 0;
    this.frame = null;
    this.attached = false;
  }

  start() {
    // console.log(
    //   "start:--> container",
    //   this.container,
    //   this.scaleX,
    //   this.scaleY
    // );
    this.container.addEventListener("dragover", this.handleEvent);
    // touchmove events don't seem to work across siblings, so we unfortunately
    // have to attach the listeners to the body
    this.eventBody.addEventListener("touchmove", this.handleEvent);
    this.eventBody.addEventListener("mousemove", this.handleEvent);
  }

  stop() {
    // console.log("stop:--> container", this.container);
    this.container.removeEventListener("dragover", this.handleEvent);
    this.eventBody.removeEventListener("touchmove", this.handleEvent);
    this.eventBody.removeEventListener("mousemove", this.handleEvent);
    this.stopScrolling();
  }

  handleEvent = (evt: TouchEvent | DragEvent) => {
    if (!this.attached) {
      this.attach();
      this.updateScrolling(evt);
    }
  };

  attach() {
    this.attached = true;
    this.eventBody.addEventListener("dragover", this.updateScrolling);
    this.eventBody.addEventListener("touchmove", this.updateScrolling);
    this.eventBody.addEventListener("mousemove", this.updateScrolling);
  }

  detach() {
    this.attached = false;
    this.eventBody.removeEventListener("dragover", this.updateScrolling);
    this.eventBody.removeEventListener("touchmove", this.updateScrolling);
    this.eventBody.removeEventListener("mousemove", this.updateScrolling);
  }

  // Update scaleX and scaleY every 100ms or so
  // and start scrolling if necessary
  updateScrolling = throttle(
    (evt) => {
      const {
        left: x,
        top: y,
        width: w,
        height: h,
      } = this.container.getBoundingClientRect();
      const box = { x, y, w, h };
      const coords = getCoords(evt);
      // calculate strength
      this.scaleX = this.options.horizontalStrength(box, coords);
      this.scaleY = this.options.verticalStrength(box, coords);
      // console.log(
      //   "start:throttle:--> container",
      //   this.scaleX,
      //   this.scaleY,
      //   !this.frame
      // );

      // start scrolling if we need to
      if (!this.frame) {
        this.startScrolling();
      }
    },
    100,
    { trailing: false }
  );

  startScrolling() {
    // console.log(
    //   "start:startScrolling:--> container",
    //   this.scaleX,
    //   this.scaleY,
    //   this.options.strengthMultiplier
    // );

    let i = 0;
    const tick = () => {
      const prevScrollTop = this.container.scrollTop;
      const { scaleX, scaleY, container } = this;
      const { strengthMultiplier, onScrollChange } = this.options;
      const elementCoords = this.el.getBoundingClientRect();
      const atTop = elementCoords.top < 10;
      const atBottom =
        window.innerHeight - elementCoords.bottom < (this.mobileView ? 50 : 10);
      this.scaleY =
        (this.scaleY === 0 && atTop) || atBottom
          ? 0.4 * (atTop ? -1 : 1)
          : this.scaleY;
      // console.log(
      //   "scrolling:tick",
      //   atTop,
      //   atBottom,
      //   scaleX,
      //   scaleY,
      //   strengthMultiplier
      // );
      // stop scrolling if there's nothing to do
      if (strengthMultiplier === 0 || scaleX + this.scaleY === 0) {
        this.stopScrolling();
        return;
      }

      // there's a bug in safari where it seems like we can't get
      // mousemove events from a container that also emits a scroll
      // event that same frame. So we double the strengthMultiplier and only adjust
      // the scroll position at 30fps
      if (i++ % 2) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const newTop = intBetween(
          0,
          scrollHeight - clientHeight,
          scrollTop + scaleY * strengthMultiplier
        );
        // console.log(
        //   "new Top",
        //   newTop,
        //   scrollTop + scaleY * strengthMultiplier,
        //   scrollHeight - clientHeight
        // );
        this.container.scrollTop = newTop;
        onScrollChange(0, newTop - prevScrollTop);
      }
      this.frame = raf(tick);
    };

    tick();
  }

  stopScrolling() {
    this.detach();
    this.scaleX = 0;
    this.scaleY = 0;

    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}
