// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(newLeft: number, newTop: number) {}

export function intBetween(min: number, max: number, val: number) {
  return Math.floor(Math.min(max, Math.max(min, val)));
}

export function getCoords(evt: TouchEvent | MouseEvent) {
  if (evt.type === "touchmove") {
    evt = evt as TouchEvent;
    return {
      x: evt.changedTouches[0].clientX,
      y: evt.changedTouches[0].clientY,
    };
  }

  evt = evt as MouseEvent;
  return { x: evt.clientX, y: evt.clientY };
}

export function getPageCoords(evt: TouchEvent | MouseEvent) {
  if (evt.type === "touchmove") {
    evt = evt as TouchEvent;
    return {
      x: evt.changedTouches[0].pageX,
      y: evt.changedTouches[0].pageY,
    };
  }

  evt = evt as MouseEvent;
  return { x: evt.pageX, y: evt.pageY };
}
