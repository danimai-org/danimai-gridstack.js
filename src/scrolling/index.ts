import ScrollingMonitor from "./scroll-monitor";
import { noop } from "./util";

const DEFAULT_BUFFER = 150;

export type Options = {
  onScrollChange: typeof noop;
  verticalStrength: typeof defaultVerticalStrength;
  horizontalStrength: typeof defaultHorizontalStrength;
  strengthMultiplier: number;
};

export type Point = {
  x: number;
  y: number;
};

export type ElementBound = Point & {
  h: number;
  w: number;
};

export type PagePosition = {
  pageX: number;
  pageY: number;
};

export function createHorizontalStrength(_buffer: number) {
  return function defaultHorizontalStrength(
    { x, w, y, h }: ElementBound,
    point: Point
  ) {
    const buffer = Math.min(w / 2, _buffer);
    const inRange = point.x >= x && point.x <= x + w;
    const inBox = inRange && point.y >= y && point.y <= y + h;

    if (inBox) {
      if (point.x < x + buffer) {
        return (point.x - x - buffer) / buffer;
      } else if (point.x > x + w - buffer) {
        return -(x + w - point.x - buffer) / buffer;
      }
    }

    return 0;
  };
}

export function createVerticalStrength(_buffer: number) {
  return function defaultVerticalStrength(
    { x, w, y, h }: ElementBound,
    point: Point
  ) {
    const buffer = Math.min(h / 2, _buffer);
    const inRange = point.y >= y && point.y <= y + h;
    const inBox = inRange && point.x >= x && point.x <= x + w;

    if (inBox) {
      if (point.y < y + buffer) {
        return (point.y - y - buffer) / buffer;
      } else if (point.y > y + h - buffer) {
        return -(y + h - point.y - buffer) / buffer;
      }
    }

    return 0;
  };
}

export const defaultHorizontalStrength =
  createHorizontalStrength(DEFAULT_BUFFER);

export const defaultVerticalStrength = createVerticalStrength(DEFAULT_BUFFER);

const defaultOptions = {
  verticalStrength: defaultVerticalStrength,
  horizontalStrength: defaultHorizontalStrength,
  strengthMultiplier: 30,
};

export function createScrollMonitor(
  el: HTMLElement,
  scrollingOptions?: Partial<Options>
) {
  const options = {
    ...defaultOptions,
    ...scrollingOptions,
  } as Options;
  return new ScrollingMonitor(el, options);
}
