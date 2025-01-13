/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2015-present, Haltu Oy
 * Released under the MIT license
 * https://github.com/haltu/muuri/blob/master/LICENSE.md
 */

const dt = 1000 / 120;

const raf = (
  window.requestAnimationFrame ||
  (window as any).webkitRequestAnimationFrame ||
  (window as any).mozRequestAnimationFrame ||
  (window as any).msRequestAnimationFrame ||
  function (callback: (...args: any[]) => void) {
    return this.setTimeout(function () {
      callback(Date.now());
    }, dt);
  }
).bind(window);

/**
 * @param {Function} callback
 * @returns {Number}
 */
export default raf;
